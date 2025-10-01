/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
    console.log('JwtAuthGuard constructor called');
  }

  getRequest(context: ExecutionContext) {
    console.log('JwtAuthGuard.getRequest called');
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    console.log('JwtAuthGuard - Request has Authorization header:', !!req.headers.authorization);
    return req;
  }

  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard.canActivate called');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('JwtAuthGuard.handleRequest called');
    console.log('JwtAuthGuard - err:', err);
    console.log('JwtAuthGuard - user:', user ? user.email : 'no user');
    console.log('JwtAuthGuard - info:', info);

    if (err || !user) {
      console.log('JwtAuthGuard - Throwing UnauthorizedException');
      throw err || new UnauthorizedException();
    }

    console.log('JwtAuthGuard - Returning user:', user.email);
    return user;
  }
}
