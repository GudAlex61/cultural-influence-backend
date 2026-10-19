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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { memoryStorage } from 'multer';
import { AuthenticatedRequest, SessionGuard } from '../users/session.guard';
import { SessionService } from '../users/session.service';
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

@ApiTags('Отрывки произведений искусства')
@Controller('artwork_excerpts')
export class ArtworkExcerptsController {
  constructor(private readonly excerpts: ArtworkExcerptsService, private readonly sessions: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'Плитка опубликованных отрывков с фильтром по дате создания произведения' })
  @ApiOkResponse({ type: ArtworkExcerptResponseDto, isArray: true })
  async getPublished(@Req() request: Request, @Query('artworkCreationDate') date?: string): Promise<ArtworkExcerptResponseDto[]> {
    return this.excerpts.getPublished(date, await this.sessions.getUserId(request));
  }

  @Get('draft')
  @UseGuards(SessionGuard)
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Черновик вошедшего пользователя' })
  @ApiOkResponse({ type: ArtworkExcerptResponseDto })
  getDraft(@Req() request: AuthenticatedRequest): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.getDraft(request.userId);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Первый опубликованный отрывок ленты' })
  @ApiOkResponse({ type: ArtworkExcerptResponseDto })
  async getFirstFeed(@Req() request: Request): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.getFeed(undefined, false, await this.sessions.getUserId(request));
  }

  @Get('feed/:id')
  @ApiOperation({ summary: 'Отрывок ленты по ID или следующий опубликованный' })
  @ApiOkResponse({ type: ArtworkExcerptResponseDto })
  async getFeed(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Query('next') next?: string,
  ): Promise<ArtworkExcerptResponseDto> {
    if (next !== undefined && next !== 'true') {
      throw new BadRequestException();
    }
    return this.excerpts.getFeed(id, next === 'true', await this.sessions.getUserId(request));
  }

  @Post()
  @UseGuards(SessionGuard)
  @ApiCookieAuth('sessionId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['artworkTitle', 'image', 'video'], properties: {
    artworkTitle: { type: 'string', example: 'Цитата из романа' },
    image: { type: 'string', format: 'binary' },
    video: { type: 'string', format: 'binary' },
  } } })
  @ApiOperation({ summary: 'Создать черновик с фото и видео в MinIO' })
  @ApiCreatedResponse({ type: ArtworkExcerptResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }],
      { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  createDraft(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateArtworkExcerptDto,
    @UploadedFiles() files: ArtworkFiles,
  ): Promise<ArtworkExcerptResponseDto> {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!image || !video) {
      throw new BadRequestException();
    }
    return this.excerpts.createDraft(body, image, video, request.userId);
  }

  @Put(':id/publication')
  @UseGuards(SessionGuard)
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Опубликовать свой черновик' })
  @ApiOkResponse({ type: ArtworkExcerptResponseDto })
  publish(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PublishArtworkExcerptDto,
  ): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.publish(id, body, request.userId);
  }

  @Post(':id/likes')
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Поставить или отменить лайк' })
  @ApiOkResponse({ type: ArtworkExcerptResponseDto })
  setLike(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetArtworkExcerptLikeDto,
  ): Promise<ArtworkExcerptResponseDto> {
    return this.excerpts.setLike(id, body.liked, request.userId);
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth('sessionId')
  @ApiOperation({ summary: 'Логически удалить свой опубликованный отрывок' })
  delete(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excerpts.delete(id, request.userId);
  }
}
