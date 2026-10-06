import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
  @Length(3, 64)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  displayName!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}

export interface UserResponseDto {
  id: number;
  username: string;
  displayName: string;
}
