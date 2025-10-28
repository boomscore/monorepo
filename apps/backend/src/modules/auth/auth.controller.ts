import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { setAuthCookie } from './utils/cookies';
import { UsersService } from '@/modules/users/users.service';
import { CreateUserInput } from '@/modules/users/dto/user.dto';
import { LoginInput } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async restLogin(@Body() input: LoginInput, @Res() res: Response) {
    const user = await this.authService.validateUser(input.email, input.password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const tokens = await this.authService.login(user);
    setAuthCookie(res, tokens.access_token);
    return res.json({
      user: { id: user.id, email: user.email, username: user.username },
      message: 'Login successful',
    });
  }

  @Post('register')
  async restRegister(@Body() input: CreateUserInput, @Res() res: Response) {
    const existingUserByEmail = await this.usersService.findByEmail(input.email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const existingUserByUsername = await this.usersService.findByUsername(input.username);
    if (existingUserByUsername) {
      return res.status(409).json({ message: 'Username is already taken' });
    }

    const user = await this.usersService.create(input);
    const tokens = await this.authService.login(user);
    setAuthCookie(res, tokens.access_token);
    return res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      message: 'Registration successful',
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const tokens = await this.authService.login(user);

    // Issue httpOnly cookie and redirect without exposing token in URL
    setAuthCookie(res, tokens.access_token);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback`);
  }

  @Post('logout')
  async restLogout(@Res() res: Response) {
    const { clearAuthCookie } = await import('./utils/cookies');
    clearAuthCookie(res);
    return res.json({ success: true });
  }

  @Get('me')
  async me(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: 'Unauthenticated' });
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  }
}
