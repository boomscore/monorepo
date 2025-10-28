import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
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
        const cookieName = process.env.AUTH_COOKIE_NAME || 'bs_token';
        const cookieToken = req?.cookies?.[cookieName];

        if (cookieToken) {
          return cookieToken;
        }

        const authHeader = req?.headers?.authorization;

        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          return token;
        }

        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
