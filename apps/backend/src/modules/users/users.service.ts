/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { SubscriptionPlan } from '@/modules/payments/entities/subscription.entity';
import { CreateUserInput, UpdateUserInput } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = this.userRepository.create({
      ...input,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    console.log('UsersService.findById called with id:', id);
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['devices', 'sessions'],
      });

      console.log('UsersService.findById found user:', user ? user.email : 'no user');

      if (!user) {
        console.log('UsersService.findById: User not found, throwing NotFoundException');
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      console.error('UsersService.findById error:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username: username.toLowerCase() },
    });
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findById(id);

    Object.assign(user, input);

    if (input.password) {
      user.password = await bcrypt.hash(input.password, 12);
    }

    return await this.userRepository.save(user);
  }

  async updateLastLogin(id: string, ipAddress?: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    });
  }

  async updateUsage(id: string, type: 'predictions' | 'chat'): Promise<boolean> {
    const user = await this.findById(id);

    // Check if usage period needs reset (monthly)
    const now = new Date();
    const usagePeriodStart = user.usagePeriodStart || user.createdAt;
    const daysSinceStart = (now.getTime() - usagePeriodStart.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceStart >= 30) {
      user.resetUsagePeriod();
    }

    // Check usage limits
    if (type === 'predictions' && !user.canUsePredictions()) {
      return false;
    }

    if (type === 'chat' && !user.canUseChat()) {
      return false;
    }

    // Increment usage
    if (type === 'predictions') {
      user.monthlyPredictions += 1;
    } else if (type === 'chat') {
      user.monthlyChatMessages += 1;
    }

    await this.userRepository.save(user);
    return true;
  }

  async activate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.ACTIVE;
    user.isActive = true;
    return await this.userRepository.save(user);
  }

  async suspend(id: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.SUSPENDED;
    user.isActive = false;
    return await this.userRepository.save(user);
  }

  async ban(id: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.BANNED;
    user.isActive = false;
    return await this.userRepository.save(user);
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.findById(id);
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    return await this.userRepository.save(user);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<User> {
    const user = await this.findById(id);

    const isOldPasswordValid = await this.verifyPassword(user, oldPassword);
    if (!isOldPasswordValid) {
      throw new Error('Invalid current password');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    return await this.userRepository.save(user);
  }

  async updatePreferences(id: string, preferences: Record<string, any>): Promise<User> {
    const user = await this.findById(id);
    user.preferences = { ...user.preferences, ...preferences };
    return await this.userRepository.save(user);
  }

  // Admin methods
  async findAll(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    subscribedUsers: number;
    newUsersToday: number;
  }> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });

    const subscribedUsers =
      (await this.userRepository.count({
        where: { subscriptionPlan: SubscriptionPlan.PRO },
      })) +
      (await this.userRepository.count({
        where: { subscriptionPlan: SubscriptionPlan.ULTRA },
      }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await this.userRepository.count({
      where: {
        createdAt: { $gte: today } as any,
      },
    });

    return {
      totalUsers,
      activeUsers,
      subscribedUsers,
      newUsersToday,
    };
  }
}
