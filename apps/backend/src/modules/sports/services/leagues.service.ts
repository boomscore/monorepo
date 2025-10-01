/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from '../entities/league.entity';
import { LoggerService } from '@/common/services/logger.service';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    private readonly logger: LoggerService,
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

    // This would fetch standings from API or database
    // For now, return mock structure
    return {
      league,
      teams: [], // Would contain teams with statistics
    };
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

  // Missing methods for resolvers
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
    // Return top popular leagues
    const popularLeagueIds = [39, 40, 78, 135, 61, 2, 3]; // EPL, La Liga, etc.

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
