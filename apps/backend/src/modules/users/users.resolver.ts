/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserInput, ChangePasswordInput, UserPreferencesInput } from './dto/user.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { UserRole } from './entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    console.log('getCurrentUser called with user:', user ? user.email : 'no user');
    try {
      const result = await this.usersService.findById(user.id);
      console.log('findById result:', result ? result.email : 'no result');
      return result;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }

  @Query(() => String, { name: 'testQuery' })
  async testQuery(): Promise<string> {
    console.log('testQuery called - no auth');
    return 'Hello World - No Auth Required';
  }

  @Mutation(() => User)
  async updateProfile(
    @Args('input') input: UpdateUserInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return await this.usersService.update(user.id, input);
  }

  @Mutation(() => User)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return await this.usersService.changePassword(
      user.id,
      input.currentPassword,
      input.newPassword,
    );
  }

  @Mutation(() => User)
  async updatePreferences(
    @Args('preferences') preferences: UserPreferencesInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return await this.usersService.updatePreferences(user.id, preferences);
  }

  // Admin only queries
  @Query(() => [User])
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async users(
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('limit', { defaultValue: 10 }) limit: number,
  ): Promise<User[]> {
    const result = await this.usersService.findAll(page, limit);
    return result.users;
  }

  @Query(() => User)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async user(@Args('id') id: string): Promise<User> {
    return await this.usersService.findById(id);
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async suspendUser(@Args('id') id: string): Promise<User> {
    return await this.usersService.suspend(id);
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async activateUser(@Args('id') id: string): Promise<User> {
    return await this.usersService.activate(id);
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async banUser(@Args('id') id: string): Promise<User> {
    return await this.usersService.ban(id);
  }
}
