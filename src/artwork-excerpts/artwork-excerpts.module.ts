import { Module } from '@nestjs/common';
import { ArtworkExcerptsController } from './artwork-excerpts.controller';

@Module({
  controllers: [ArtworkExcerptsController],
})
export class ArtworkExcerptsModule {}
