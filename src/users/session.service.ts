import { Injectable, OnModuleDestroy, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SessionService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: RedisClientType;
  readonly ttlSeconds: number;

  constructor(config: ConfigService) {
    this.redis = createClient({ url: config.get<string>('REDIS_URL', 'redis://localhost:6379') });
    this.redis.on('error', () => undefined);
    this.ttlSeconds = Number(config.get<string>('SESSION_TTL_SECONDS', '3600'));
  }

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  async create(userId: number): Promise<string> {
    const id = randomBytes(32).toString('hex');
    await this.redis.set(`session:${id}`, String(userId), { EX: this.ttlSeconds });
    return id;
  }

  async getUserId(request: Request): Promise<number | null> {
    const id = request.cookies?.sessionId;
    if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) return null;
    const value = await this.redis.get(`session:${id}`);
    if (!value) return null;
    const userId = Number(value);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  }

  async requireUserId(request: Request): Promise<number> {
    const userId = await this.getUserId(request);
    if (userId === null) throw new UnauthorizedException();
    return userId;
  }

  async destroy(request: Request): Promise<void> {
    const id = request.cookies?.sessionId;
    if (typeof id === 'string' && /^[a-f0-9]{64}$/.test(id)) {
      await this.redis.del(`session:${id}`);
    }
  }
}
