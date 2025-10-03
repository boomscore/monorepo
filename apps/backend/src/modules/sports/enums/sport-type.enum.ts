/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

export enum SportType {
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
}

export interface SportConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  apiId: number;
  isActive: boolean;
}

// Hardcoded sport configurations - no database queries needed!
export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  [SportType.FOOTBALL]: {
    id: '8ba61694-659e-419b-9fd0-da81e09648dd', // Use the actual UUID from database
    name: 'Football',
    slug: 'football',
    description: 'Association football (soccer)',
    apiId: 1,
    isActive: true,
  },
  [SportType.BASKETBALL]: {
    id: 'basketball-uuid-placeholder', // Will be set when we add basketball
    name: 'Basketball',
    slug: 'basketball',
    description: 'Professional basketball',
    apiId: 2, // API-Sports basketball ID
    isActive: false, // Not yet implemented
  },
};
