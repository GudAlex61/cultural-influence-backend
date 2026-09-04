import { Module } from '@nestjs/common';
import { ArtworkExcerptsModule } from './artwork-excerpts/artwork-excerpts.module';

@Module({
  imports: [ArtworkExcerptsModule],
})
export class AppModule {}
