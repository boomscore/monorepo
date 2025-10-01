/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: req => {
        console.log('JWT Strategy - Extracting token from request');

        // Get authorization header
        const authHeader = req?.headers?.authorization;
        console.log('JWT Strategy - Authorization header:', authHeader);

        if (!authHeader) {
          console.log('JWT Strategy - No authorization header');
          return null;
        }

        // Handle "Bearer TOKEN" format
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          console.log('JWT Strategy - Token extracted from Bearer format');
          return token;
        }

        // Handle direct token format (no "Bearer " prefix)
        // Check if it looks like a JWT token (has two dots)
        if (authHeader.split('.').length === 3) {
          console.log('JWT Strategy - Token extracted directly (no Bearer prefix)');
          return authHeader;
        }

        console.log('JWT Strategy - No valid token found');
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy validate called with payload:', payload);
    const user = await this.usersService.findById(payload.sub);
    console.log('JWT Strategy found user:', user ? user.email : 'no user');

    if (!user || !user.isActive) {
      console.log('JWT Strategy: User not found or inactive');
      throw new UnauthorizedException('User not found or inactive');
    }

    console.log('JWT Strategy: Returning user:', user.email);
    return user;
  }
}
