import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkExcerptsController } from './artwork_excerpts.controller';
import { ArtworkExcerptsService } from './artwork_excerpts.service';
import { ArtworkExcerpt } from './entities/artwork_excerpt.entity';
import { ArtworkExcerptLike } from './entities/artwork_excerpt_like.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtworkExcerpt, ArtworkExcerptLike, User]),
  ],
  controllers: [ArtworkExcerptsController],
  providers: [ArtworkExcerptsService],
})
export class ArtworkExcerptsModule {}
