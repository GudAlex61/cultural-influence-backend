import 'dotenv/config';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from 'redis';
import { In } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/artwork_excerpts/entities/user.entity';

async function showSessions(): Promise<void> {
  const redis = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
  redis.on('error', (error: Error) => process.stderr.write(`Redis: ${error.message}\n`));
  try {
    await redis.connect();
    const keys: string[] = [];
    for await (const key of redis.scanIterator({ MATCH: 'session:*', COUNT: 100 })) {
      if (/^session:[a-f0-9]{64}$/.test(key)) keys.push(key);
    }
    const script = await readFile(join(__dirname, 'active-sessions.lua'), 'utf8');
    const rows = keys.length
      ? await redis.eval(script, { keys: keys.sort(), arguments: [] }) as string[][]
      : [];
    if (!rows.length) {
      process.stdout.write('Нет активных сессий. Сначала выполните POST /api/sessions.\n');
      return;
    }
    await AppDataSource.initialize();
    const ids = [...new Set(rows.map((row) => Number(row[1])))];
    const users = await AppDataSource.getRepository(User).findBy({ id: In(ids) });
    const usernames = new Map(users.map((user) => [user.id, user.username]));
    console.table(rows.map(([key, id, ttl]) => ({
      session: key,
      userId: Number(id),
      username: usernames.get(Number(id)) ?? '(пользователь не найден)',
      ttlSeconds: Number(ttl),
    })));
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    if (redis.isOpen) await redis.quit();
  }
}

void showSessions().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
