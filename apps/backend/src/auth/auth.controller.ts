import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role?: 'ADMIN' | 'COACH' | 'PLAYER';
      clubId?: string;
      position?: 'KALECI' | 'DEFANS' | 'ORTA_SAHA' | 'FORVET';
      birthDate?: string;
    },
  ) {
    const role = body.role || 'COACH';
    const user = await this.users.createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role,
      clubId: body.clubId,
      position: body.position,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
    });
    return { user };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }
}
