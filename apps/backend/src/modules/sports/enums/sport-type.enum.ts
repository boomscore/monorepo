export enum SportType {
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
}

export interface SportConfig {
  name: string;
  slug: string;
  description: string;
  apiId: number;
  isActive: boolean;
}

export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  [SportType.FOOTBALL]: {
    name: 'Football',
    slug: 'football',
    description: 'Association football (soccer)',
    apiId: 1,
    isActive: true,
  },
  [SportType.BASKETBALL]: {
    name: 'Basketball',
    slug: 'basketball',
    description: 'Professional basketball',
    apiId: 2,
    isActive: false, // Not yet implemented
  },
};
