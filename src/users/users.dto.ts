import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'art_reader' })
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
  @Length(3, 64)
  username!: string;

  @ApiProperty({ example: 'Читатель искусства' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  displayName!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @Length(8, 128)
  password!: string;
}

export class UserResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() username!: string;
  @ApiProperty() displayName!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'art_reader' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
