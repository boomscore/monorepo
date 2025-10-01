/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { DataSource } from 'typeorm';
import { dataSource } from '@/config/database.config';
import { User, UserRole } from '@/modules/users/entities/user.entity';
import { SubscriptionPlan } from '@/modules/payments/entities/subscription.entity';
import { Sport } from '@/modules/sports/entities/sport.entity';
import { League, LeagueType } from '@/modules/sports/entities/league.entity';
import * as bcrypt from 'bcrypt';

async function runSeeds() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  console.log('🌱 Starting database seeding...');

  try {
    // Create users
    await seedUsers();

    // Create sports and leagues
    await seedSports();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

async function seedUsers() {
  const userRepository = dataSource.getRepository(User);

  console.log('👤 Seeding users...');

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@boomscore.ai' },
  });

  if (existingAdmin) {
    console.log('   Admin user already exists, skipping user creation');
    return;
  }

  const users = [
    {
      email: 'admin@boomscore.ai',
      username: 'admin',
      password: await bcrypt.hash('Admin123!', 12),
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      subscriptionPlan: SubscriptionPlan.ULTRA,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    {
      email: 'moderator@boomscore.ai',
      username: 'moderator',
      password: await bcrypt.hash('Mod123!', 12),
      firstName: 'Content',
      lastName: 'Moderator',
      role: UserRole.MODERATOR,
      subscriptionPlan: SubscriptionPlan.PRO,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    {
      email: 'demo@boomscore.ai',
      username: 'demo_user',
      password: await bcrypt.hash('Demo123!', 12),
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.USER,
      subscriptionPlan: SubscriptionPlan.FREE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    {
      email: 'pro@boomscore.ai',
      username: 'pro_user',
      password: await bcrypt.hash('Pro123!', 12),
      firstName: 'Pro',
      lastName: 'User',
      role: UserRole.USER,
      subscriptionPlan: SubscriptionPlan.PRO,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
    console.log(`   Created user: ${user.email} (${user.role})`);
  }
}

async function seedSports() {
  const sportRepository = dataSource.getRepository(Sport);
  const leagueRepository = dataSource.getRepository(League);

  console.log('⚽ Seeding sports and leagues...');

  // Check if football already exists
  const existingFootball = await sportRepository.findOne({
    where: { slug: 'football' },
  });

  if (existingFootball) {
    console.log('   Sports already exist, skipping sports creation');
    return;
  }

  // Create Football sport
  const football = sportRepository.create({
    name: 'Football',
    slug: 'football',
    description: 'Association football, commonly known as soccer',
    apiId: 1, // Football ID in API-Football
    isActive: true,
    sortOrder: 1,
  });
  await sportRepository.save(football);
  console.log('   Created sport: Football');

  // Create major football leagues
  const leagues = [
    {
      name: 'Premier League',
      slug: 'premier-league',
      description: 'English Premier League',
      type: LeagueType.LEAGUE,
      country: 'England',
      countryCode: 'GB',
      apiId: 39,
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      currentSeason: 2024,
      sportId: football.id,
    },
    {
      name: 'La Liga',
      slug: 'la-liga',
      description: 'Spanish La Liga Santander',
      type: LeagueType.LEAGUE,
      country: 'Spain',
      countryCode: 'ES',
      apiId: 140,
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
      currentSeason: 2024,
      sportId: football.id,
    },
    {
      name: 'Serie A',
      slug: 'serie-a',
      description: 'Italian Serie A',
      type: LeagueType.LEAGUE,
      country: 'Italy',
      countryCode: 'IT',
      apiId: 135,
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
      currentSeason: 2024,
      sportId: football.id,
    },
    {
      name: 'Bundesliga',
      slug: 'bundesliga',
      description: 'German Bundesliga',
      type: LeagueType.LEAGUE,
      country: 'Germany',
      countryCode: 'DE',
      apiId: 78,
      isActive: true,
      isFeatured: true,
      sortOrder: 4,
      currentSeason: 2024,
      sportId: football.id,
    },
    {
      name: 'Ligue 1',
      slug: 'ligue-1',
      description: 'French Ligue 1',
      type: LeagueType.LEAGUE,
      country: 'France',
      countryCode: 'FR',
      apiId: 61,
      isActive: true,
      isFeatured: true,
      sortOrder: 5,
      currentSeason: 2024,
      sportId: football.id,
    },
    {
      name: 'Champions League',
      slug: 'champions-league',
      description: 'UEFA Champions League',
      type: LeagueType.CUP,
      country: 'Europe',
      countryCode: 'EU',
      apiId: 2,
      isActive: true,
      isFeatured: true,
      sortOrder: 6,
      currentSeason: 2024,
      sportId: football.id,
    },
    {
      name: 'NPFL',
      slug: 'npfl',
      description: 'Nigeria Professional Football League',
      type: LeagueType.LEAGUE,
      country: 'Nigeria',
      countryCode: 'NG',
      apiId: 565,
      isActive: true,
      isFeatured: true,
      sortOrder: 7,
      currentSeason: 2024,
      sportId: football.id,
    },
  ];

  for (const leagueData of leagues) {
    const league = leagueRepository.create(leagueData);
    await leagueRepository.save(league);
    console.log(`   Created league: ${league.name} (${league.country})`);
  }
}

// Run seeds if called directly
if (require.main === module) {
  runSeeds()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export { runSeeds };
