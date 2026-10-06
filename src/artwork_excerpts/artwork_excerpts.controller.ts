import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ArtworkExcerptResponseDto,
  CreateArtworkExcerptDto,
  PublishArtworkExcerptDto,
  SetArtworkExcerptLikeDto,
} from './artwork_excerpts.dto';
import { ArtworkExcerptsService } from './artwork_excerpts.service';

interface ArtworkFiles {
  image?: Express.Multer.File[];
  video?: Express.Multer.File[];
}

@Controller('artwork_excerpts')
export class ArtworkExcerptsController {
  constructor(private readonly excerpts: ArtworkExcerptsService) {}

  @Get()
  getPublished(@Query('artworkCreationDate') date?: string): Promise<ArtworkExcerptResponseDto[]> {
    return this.excerpts.getPublished(date);
  }

  @Get('draft')
  getDraft(): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.getDraft();
  }

  @Get('feed')
  getFirstFeed(): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.getFeed();
  }

  @Get('feed/:id')
  getFeed(
    @Param('id', ParseIntPipe) id: number,
    @Query('next') next?: string,
  ): Promise<ArtworkExcerptResponseDto> {
    if (next !== undefined && next !== 'true') {
      throw new BadRequestException();
    }
    return this.excerpts.getFeed(id, next === 'true');
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }],
      { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  createDraft(
    @Body() body: CreateArtworkExcerptDto,
    @UploadedFiles() files: ArtworkFiles,
  ): Promise<ArtworkExcerptResponseDto> {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!image || !video) {
      throw new BadRequestException();
    }
    return this.excerpts.createDraft(body, image, video);
  }

  @Put(':id/publication')
  publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PublishArtworkExcerptDto,
  ): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.publish(id, body);
  }

  @Post(':id/likes')
  @HttpCode(200)
  setLike(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetArtworkExcerptLikeDto,
  ): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.setLike(id, body.liked);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excerpts.delete(id);
  }
}
