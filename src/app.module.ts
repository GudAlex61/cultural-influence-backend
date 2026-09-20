import { Module } from '@nestjs/common';
import { ArtworkExcerptsModule } from './artwork_excerpts/artwork_excerpts.module';

@Module({
  imports: [ArtworkExcerptsModule],
})
export class AppModule {}
