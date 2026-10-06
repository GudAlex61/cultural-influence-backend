import { Controller, HttpCode, Post } from '@nestjs/common';

@Controller('sessions')
export class SessionsController {
  @Post()
  @HttpCode(200)
  authenticate(): void {
    // Заглушка до ЛР-4: сессия не создаётся.
  }

  @Post('logout')
  @HttpCode(200)
  logout(): void {
    // Заглушка до ЛР-4: активной сессии пока нет.
  }
}
