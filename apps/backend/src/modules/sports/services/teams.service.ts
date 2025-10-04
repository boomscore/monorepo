
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { LoggerService } from '@/common/services/logger.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly logger: LoggerService,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      where: { isActive: true },
      relations: ['league'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { id },
      relations: ['league'],
    });
  }

  async findByLeague(leagueId: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { leagueId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findTeamWithStats(
    teamId: string,
    options: {
      season?: number;
      includeForm?: boolean;
      includeHomeAway?: boolean;
    } = {},
  ): Promise<Team | null> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['league'],
    });

    if (!team) return null;

    // Additional logic to fetch statistics would go here
    // This could involve API calls or database queries

    return team;
  }

  async findBySlug(slug: string): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { slug },
      relations: ['league'],
    });
  }

  async search(query: string): Promise<Team[]> {
    return this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.league', 'league')
      .where('team.name ILIKE :query OR team.shortName ILIKE :query', {
        query: `%${query}%`,
      })
      .andWhere('team.isActive = :isActive', { isActive: true })
      .orderBy('team.name', 'ASC')
      .limit(20)
      .getMany();
  }

  // Missing methods for resolvers
  async findTeams(filters: {
    leagueId?: string;
    country?: string;
    isActive?: boolean;
  }): Promise<Team[]> {
    const queryBuilder = this.teamRepository.createQueryBuilder('team');

    if (filters.leagueId) {
      queryBuilder.andWhere('team.leagueId = :leagueId', {
        leagueId: filters.leagueId,
      });
    }

    if (filters.country) {
      queryBuilder.andWhere('team.country = :country', {
        country: filters.country,
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('team.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    return queryBuilder.orderBy('team.name', 'ASC').getMany();
  }

  async searchTeams(query: string, leagueId?: string): Promise<Team[]> {
    const queryBuilder = this.teamRepository
      .createQueryBuilder('team')
      .where('team.name ILIKE :query', { query: `%${query}%` })
      .orWhere('team.country ILIKE :query', { query: `%${query}%` });

    if (leagueId) {
      queryBuilder.andWhere('team.leagueId = :leagueId', { leagueId });
    }

    return queryBuilder.orderBy('team.name', 'ASC').limit(20).getMany();
  }

  async findTeamWithDetails(
    id: string,
    options: {
      includeStats?: boolean;
      includeForm?: boolean;
      includeHomeAway?: boolean;
    } = {},
  ): Promise<Team> {
    // This is the same as findTeamWithStats for now
    return this.findTeamWithStats(id, options);
  }
}
