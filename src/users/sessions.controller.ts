import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LoginDto, UserResponseDto } from './users.dto';
import { UsersService } from './users.service';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';

@ApiTags('Сеансы пользователей')
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Вход пользователя и создание Redis-сессии' })
  @ApiOkResponse({ type: UserResponseDto })
  async authenticate(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response): Promise<{ id: number; username: string; displayName: string }> {
    const user = await this.users.authenticate(body);
    const sessionId = await this.sessions.create(user.id);
    response.cookie('sessionId', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('COOKIE_SECURE', 'false') === 'true',
      maxAge: this.sessions.ttlSeconds * 1000,
      path: '/',
    });
    return { id: user.id, username: user.username, displayName: user.displayName };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Удаление Redis-сессии и cookie' })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.sessions.destroy(request);
    response.clearCookie('sessionId', { path: '/' });
  }
}
