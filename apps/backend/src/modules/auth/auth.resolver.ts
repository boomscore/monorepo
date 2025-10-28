import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/modules/users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '@/modules/users/entities/user.entity';
import { CreateUserInput } from '@/modules/users/dto/user.dto';
import { LoginInput, AuthResponse } from './dto/auth.dto';
import { Request, Response } from 'express';
import { setAuthCookie, clearAuthCookie } from './utils/cookies';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => User, { nullable: true })
  async me(@Context() ctx: { req: Request }): Promise<User | null> {
    return this.authService.getUserFromRequest(ctx.req);
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: CreateUserInput,
    @Context() ctx: { res: Response },
  ): Promise<AuthResponse> {
    const existingUserByEmail = await this.usersService.findByEmail(input.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await this.usersService.findByUsername(input.username);
    if (existingUserByUsername) {
      throw new Error('Username is already taken');
    }

    const user = await this.usersService.create(input);

    const tokens = await this.authService.login(user);
    setAuthCookie(ctx.res, tokens.access_token);

    return {
      user,
      accessToken: tokens.access_token,
      message: 'Registration successful',
    };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: { res: Response },
  ): Promise<AuthResponse> {
    const user = await this.authService.validateUser(input.email, input.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.authService.login(user);
    setAuthCookie(ctx.res, tokens.access_token);

    await this.usersService.updateLastLogin(user.id);

    return {
      user,
      accessToken: tokens.access_token,
      message: 'Login successful',
    };
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: { res: Response }): Promise<boolean> {
    clearAuthCookie(ctx.res);
    return true;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Context() ctx: { user: User },
    @Args('firstName', { nullable: true }) firstName?: string,
    @Args('lastName', { nullable: true }) lastName?: string,
  ): Promise<User> {
    const updates: Partial<User> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;

    return this.usersService.update(ctx.user.id, updates);
  }
}
