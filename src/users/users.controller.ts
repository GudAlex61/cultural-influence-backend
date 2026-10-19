import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto, UserResponseDto } from './users.dto';
import { UsersService } from './users.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Регистрация создателя отрывков' })
  @ApiCreatedResponse({ type: UserResponseDto })
  register(@Body() body: RegisterUserDto): Promise<UserResponseDto> {
    return this.users.register(body);
  }
}
