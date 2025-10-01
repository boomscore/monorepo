/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { SportsService } from '../services/sports.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';
import { Sport } from '../entities/sport.entity';

@Resolver(() => Sport)
export class SportsResolver {
  constructor(private readonly sportsService: SportsService) {}

  @Query(() => [Sport])
  async sports(): Promise<Sport[]> {
    return this.sportsService.getAllSports();
  }

  @Query(() => Sport, { nullable: true })
  async sport(@Args('id') id: string): Promise<Sport> {
    return this.sportsService.getSportById(id);
  }

  @Query(() => Sport, { nullable: true })
  async sportBySlug(@Args('slug') slug: string): Promise<Sport> {
    return this.sportsService.getSportBySlug(slug);
  }

  @Query(() => [Sport])
  async searchSports(@Args('query') query: string): Promise<Sport[]> {
    return this.sportsService.searchSports(query);
  }

  @Query(() => GraphQLJSON)
  async sportsStats() {
    return this.sportsService.getSportsStats();
  }

  // Admin mutations
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async initializeSports(): Promise<boolean> {
    await this.sportsService.initializeSports();
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncLeagues(): Promise<boolean> {
    await this.sportsService.syncLeagues();
    return true;
  }
}
