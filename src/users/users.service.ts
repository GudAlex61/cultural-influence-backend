import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Repository } from 'typeorm';
import { User } from '../artwork_excerpts/entities/user.entity';
import { LoginDto, RegisterUserDto, UserResponseDto } from './users.dto';

const deriveKey = promisify(scrypt);

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async register(input: RegisterUserDto): Promise<UserResponseDto> {
    const username = input.username.trim();
    const displayName = input.displayName.trim();
    if (!displayName || await this.users.existsBy({ username })) {
      throw new BadRequestException();
    }
    const salt = randomBytes(16).toString('hex');
    const key = (await deriveKey(input.password, salt, 64)) as Buffer;
    try {
      const user = await this.users.save(this.users.create({
        username,
        displayName,
        passwordHash: `scrypt$${salt}$${key.toString('hex')}`,
      }));
      return { id: user.id, username: user.username, displayName: user.displayName };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        throw new BadRequestException();
      }
      throw error;
    }
  }

  async authenticate(input: LoginDto): Promise<User> {
    const user = await this.users.findOneBy({ username: input.username });
    if (!user) throw new UnauthorizedException();
    const [algorithm, salt, digest] = user.passwordHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !digest || !/^[a-f0-9]{128}$/.test(digest)) {
      throw new UnauthorizedException();
    }
    const candidate = (await deriveKey(input.password, salt, 64)) as Buffer;
    const expected = Buffer.from(digest, 'hex');
    if (!timingSafeEqual(candidate, expected)) throw new UnauthorizedException();
    return user;
  }
}
