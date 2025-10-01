/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    // Always call super, but use dummy values if not configured
    super({
      clientID: clientID && clientID !== 'your-google-client-id' ? clientID : 'dummy',
      clientSecret:
        clientSecret && clientSecret !== 'your-google-client-secret' ? clientSecret : 'dummy',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile'],
    });

    // Log if not properly configured
    if (!clientID || !clientSecret || clientID === 'your-google-client-id') {
      console.log('Google OAuth credentials not configured, Google authentication will not work');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const email = emails[0].value;

    // Try to find existing user
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user
      user = await this.usersService.create({
        email,
        username: `google_${id}`,
        password: `google_oauth_${Date.now()}`, // Temporary password, user won't use it
        firstName: name.givenName,
        lastName: name.familyName,
        avatar: photos[0]?.value,
      });
    }

    done(null, user);
  }
}
