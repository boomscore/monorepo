import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.usersService.verifyPassword(user, password))) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify<{ sub: string; email: string }>(token);
      if (!decoded?.sub) return null;
      const user = await this.usersService.findById(decoded.sub);
      return user ?? null;
    } catch {
      return null;
    }
  }

  async getUserFromRequest(req: Request): Promise<User | null> {
    const cookieName = process.env.AUTH_COOKIE_NAME || 'bs_token';
    const token = (req.cookies?.[cookieName] as string | undefined) || undefined;
    if (!token) return null;
    return this.getUserFromToken(token);
  }
}
