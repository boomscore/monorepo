/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // Add In operator
import { Sport } from '../entities/sport.entity';
import { League } from '../entities/league.entity';
import { SportsApiService } from './sports-api.service';
import { LoggerService } from '@/common/services/logger.service';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    private readonly sportsApiService: SportsApiService,
    private readonly logger: LoggerService,
  ) {}

  async getAllSports(): Promise<Sport[]> {
    return this.sportRepository.find({
      relations: ['leagues'],
      order: { name: 'ASC' },
    });
  }

  async getSportById(id: string): Promise<Sport> {
    const sport = await this.sportRepository.findOne({
      where: { id },
      relations: ['leagues'],
    });

    if (!sport) {
      throw new Error('Sport not found');
    }

    return sport;
  }

  async getSportBySlug(slug: string): Promise<Sport> {
    const sport = await this.sportRepository.findOne({
      where: { slug },
      relations: ['leagues'],
    });

    if (!sport) {
      throw new Error('Sport not found');
    }

    return sport;
  }

  async initializeSports(): Promise<void> {
    this.logger.info('Initializing sports from API', {
      service: 'sports',
    });

    try {
      // Check if sports already exist
      const existingSports = await this.sportRepository.count();
      if (existingSports > 0) {
        this.logger.info('Sports already initialized, skipping', {
          service: 'sports',
          count: existingSports,
        });
        return;
      }

      // For now, we'll create football manually since API-Football only supports football
      const football = this.sportRepository.create({
        name: 'Football',
        slug: 'football',
        description: 'Association football (soccer)',
        isActive: true,
      });

      await this.sportRepository.save(football);

      this.logger.info('Sports initialized successfully', {
        service: 'sports',
        count: 1,
      });
    } catch (error) {
      this.logger.error('Failed to initialize sports', error.stack, {
        service: 'sports',
      });
      throw error;
    }
  }

  async syncLeagues(): Promise<void> {
    this.logger.info('Syncing leagues from API', {
      service: 'sports',
    });

    try {
      const football = await this.getSportBySlug('football');

      // Get leagues from API-Football
      const apiLeagues = await this.sportsApiService.getLeagues();

      let created = 0;
      let updated = 0;

      for (const apiLeague of apiLeagues) {
        let league = await this.leagueRepository.findOne({
          where: { apiId: apiLeague.league.id },
        });

        if (league) {
          // Update existing league
          league.name = apiLeague.league.name;
          league.logo = apiLeague.league.logo;
          league.country = apiLeague.country.name;
          league.countryCode = apiLeague.country.code;
          league.countryFlag = apiLeague.country.flag;
          league.isActive = true;
          league.updatedAt = new Date();

          await this.leagueRepository.save(league);
          updated++;
        } else {
          // Create new league
          league = this.leagueRepository.create({
            sportId: football.id,
            apiId: apiLeague.league.id,
            name: apiLeague.league.name,
            slug: this.generateSlug(apiLeague.league.name),
            logo: apiLeague.league.logo,
            country: apiLeague.country.name,
            countryCode: apiLeague.country.code,
            countryFlag: apiLeague.country.flag,
            isActive: true,
          });

          await this.leagueRepository.save(league);
          created++;
        }
      }

      this.logger.info('Leagues sync completed', {
        service: 'sports',
        created,
        updated,
        total: apiLeagues.length,
      });
    } catch (error) {
      this.logger.error('Failed to sync leagues', error.stack, {
        service: 'sports',
      });
      throw error;
    }
  }

  async getPopularLeagues(): Promise<League[]> {
    // Return popular leagues based on predefined list
    const popularLeagueIds = [39, 40, 78, 135, 61, 2, 3]; // EPL, La Liga, Bundesliga, etc.

    return this.leagueRepository.find({
      where: { apiId: In(popularLeagueIds) },
      order: { name: 'ASC' },
    });
  }

  async searchSports(query: string): Promise<Sport[]> {
    return this.sportRepository
      .createQueryBuilder('sport')
      .where('sport.name ILIKE :query', { query: `%${query}%` })
      .orWhere('sport.description ILIKE :query', { query: `%${query}%` })
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async getSportsStats() {
    const stats = await this.sportRepository
      .createQueryBuilder('sport')
      .leftJoin('sport.leagues', 'league')
      .select(['sport.id', 'sport.name', 'COUNT(league.id) as leagueCount'])
      .groupBy('sport.id')
      .getRawMany();

    return stats.map(stat => ({
      sportId: stat.sport_id,
      sportName: stat.sport_name,
      leagueCount: parseInt(stat.leagueCount) || 0,
    }));
  }
}
