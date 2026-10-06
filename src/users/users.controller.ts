import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto, UserResponseDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  register(@Body() body: RegisterUserDto): Promise<UserResponseDto> {
    return this.users.register(body);
  }
}
