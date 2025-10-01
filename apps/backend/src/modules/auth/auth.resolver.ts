/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/modules/users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '@/modules/users/entities/user.entity';
import { CreateUserInput } from '@/modules/users/dto/user.dto';
import { LoginInput, AuthResponse } from './dto/auth.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: CreateUserInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUserByEmail = await this.usersService.findByEmail(input.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await this.usersService.findByUsername(input.username);
    if (existingUserByUsername) {
      throw new Error('Username is already taken');
    }

    // Create user
    const user = await this.usersService.create(input);
    
    // Generate token
    const tokens = await this.authService.login(user);
    
    return {
      user,
      accessToken: tokens.access_token,
      message: 'Registration successful',
    };
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    const user = await this.authService.validateUser(input.email, input.password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.authService.login(user);
    
    // Update last login
    await this.usersService.updateLastLogin(user.id);
    
    return {
      user,
      accessToken: tokens.access_token,
      message: 'Login successful',
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(@Context('user') user: User): Promise<boolean> {
    // TODO: Implement proper logout with token blacklisting
    return true;
  }
}
