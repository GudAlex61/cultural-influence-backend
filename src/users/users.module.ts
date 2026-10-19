import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../artwork_excerpts/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SessionsController } from './sessions.controller';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, SessionsController],
  providers: [UsersService, SessionService, SessionGuard],
  exports: [UsersService, SessionService, SessionGuard],
})
export class UsersModule {}
