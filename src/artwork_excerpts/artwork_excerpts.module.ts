import { Module } from '@nestjs/common';
import { ArtworkExcerptsController } from './artwork_excerpts.controller';

@Module({
  controllers: [ArtworkExcerptsController],
})
export class ArtworkExcerptsModule {}
