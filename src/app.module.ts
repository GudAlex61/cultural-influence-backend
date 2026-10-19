import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkExcerptsModule } from './artwork_excerpts/artwork_excerpts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5455),
        username: config.get<string>('DB_USERNAME', 'cultural_user'),
        password: config.get<string>('DB_PASSWORD', 'cultural_password'),
        database: config.get<string>('DB_DATABASE', 'cultural_influence'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    ArtworkExcerptsModule,
    UsersModule,
  ],
})
export class AppModule {}
