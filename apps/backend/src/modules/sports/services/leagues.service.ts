import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from '../entities/league.entity';
import { LoggerService } from '@/common/services/logger.service';
import { SportsApiService } from './sports-api.service';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    private readonly logger: LoggerService,
    private readonly sportsApi: SportsApiService,
  ) {}

  async findAll(): Promise<League[]> {
    return this.leagueRepository.find({
      where: { isActive: true },
      relations: ['sport'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findFeatured(): Promise<League[]> {
    return this.leagueRepository.find({
      where: { isActive: true, isFeatured: true },
      relations: ['sport'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<League | null> {
    return this.leagueRepository.findOne({
      where: { id },
      relations: ['sport', 'teams', 'seasons'],
    });
  }

  async findBySlug(slug: string): Promise<League | null> {
    return this.leagueRepository.findOne({
      where: { slug },
      relations: ['sport'],
    });
  }

  async getLeagueStandings(
    leagueId: string,
    options: { season?: number; limit?: number } = {},
  ): Promise<any> {
    const league = await this.findById(leagueId);
    if (!league) return null;

    try {
      const season = options.season ?? league.currentSeason ?? new Date().getFullYear();

      const apiLeagueId = parseInt(league.apiId, 10);
      if (Number.isNaN(apiLeagueId)) {
        this.logger.warn(`Invalid apiId for league ${league.id} (${league.name}): ${league.apiId}`);
        return null;
      }

      const apiStandings = await this.sportsApi.getStandings(apiLeagueId, season);

      if (!apiStandings || !apiStandings.league?.standings) {
        this.logger.warn(`No standings returned for league apiId=${apiLeagueId} season=${season}`);
        return null;
      }

      const groups = apiStandings.league.standings || [];
      const flattened = ([] as any[]).concat(...groups);
      const limited =
        typeof options.limit === 'number' ? flattened.slice(0, options.limit) : flattened;

      const standings = limited.map((t: any) => ({
        position: t.rank,
        teamId: String(t.team?.id ?? ''),
        teamName: t.team?.name ?? '',
        teamLogo: t.team?.logo ?? null,
        played: t.all?.played ?? 0,
        wins: t.all?.win ?? 0,
        draws: t.all?.draw ?? 0,
        losses: t.all?.lose ?? 0,
        goalDifference: t.goalsDiff ?? 0,
        points: t.points ?? 0,
      }));

      return {
        league: {
          id: league.id,
          apiId: league.apiId,
          name: league.name,
          country: league.country,
          season,
        },
        standings,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch league standings', error as any);
      return null;
    }
  }

  async findBySport(sportId: string): Promise<League[]> {
    return this.leagueRepository.find({
      where: { sportId, isActive: true },
      order: { isFeatured: 'DESC', sortOrder: 'ASC' },
    });
  }

  async findByCountry(country: string): Promise<League[]> {
    return this.leagueRepository.find({
      where: { country, isActive: true },
      relations: ['sport'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findLeagues(filters: {
    sportId?: string;
    country?: string;
    isActive?: boolean;
  }): Promise<League[]> {
    const queryBuilder = this.leagueRepository.createQueryBuilder('league');

    if (filters.sportId) {
      queryBuilder.andWhere('league.sportId = :sportId', {
        sportId: filters.sportId,
      });
    }

    if (filters.country) {
      queryBuilder.andWhere('league.country = :country', {
        country: filters.country,
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('league.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    return queryBuilder.orderBy('league.name', 'ASC').getMany();
  }

  async findPopularLeagues(): Promise<League[]> {
    const popularLeagueIds = ['39', '40', '78', '135', '61', '2', '3']; // EPL, La Liga, etc.

    return this.leagueRepository
      .createQueryBuilder('league')
      .where('league.apiId IN (:...ids)', { ids: popularLeagueIds })
      .orderBy('league.name', 'ASC')
      .getMany();
  }

  async searchLeagues(query: string, sportId?: string): Promise<League[]> {
    const queryBuilder = this.leagueRepository
      .createQueryBuilder('league')
      .where('league.name ILIKE :query', { query: `%${query}%` })
      .orWhere('league.country ILIKE :query', { query: `%${query}%` });

    if (sportId) {
      queryBuilder.andWhere('league.sportId = :sportId', { sportId });
    }

    return queryBuilder.orderBy('league.name', 'ASC').limit(20).getMany();
  }
}
