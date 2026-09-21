import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ArtworkExcerpt } from '../artwork_excerpts/entities/artwork_excerpt.entity';
import { ArtworkExcerptLike } from '../artwork_excerpts/entities/artwork_excerpt_like.entity';
import { User } from '../artwork_excerpts/entities/user.entity';
import { InitialDatabase1726848000000 } from './migrations/1726848000000-InitialDatabase';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5455),
  username: process.env.DB_USERNAME ?? 'cultural_user',
  password: process.env.DB_PASSWORD ?? 'cultural_password',
  database: process.env.DB_DATABASE ?? 'cultural_influence',
  entities: [User, ArtworkExcerpt, ArtworkExcerptLike],
  migrations: [InitialDatabase1726848000000],
  synchronize: false,
});
