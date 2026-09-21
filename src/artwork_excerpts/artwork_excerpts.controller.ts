import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Redirect,
  Render,
} from '@nestjs/common';
import { ArtworkExcerptsService } from './artwork_excerpts.service';

@Controller('artwork_excerpts')
export class ArtworkExcerptsController {
  constructor(
    private readonly artworkExcerptsService: ArtworkExcerptsService,
  ) {}

  @Get(['feed', 'feed/:id'])
  @Render('artwork_excerpts/feed')
  async getFeed(@Param('id') id?: string, @Query('next') next?: string) {
    const requestedId = id === undefined ? undefined : Number(id);
    if (requestedId !== undefined && !Number.isInteger(requestedId)) {
      throw new NotFoundException('Отрывок не найден');
    }

    return {
      title: 'Лента — Культурный след',
      excerpt: await this.artworkExcerptsService.getFeedExcerpt(
        requestedId,
        next === 'true',
      ),
      activeFeed: true,
    };
  }

  @Get('draft')
  @Render('artwork_excerpts/draft')
  async getDraft() {
    const excerpt = await this.artworkExcerptsService.getCurrentDraft();

    return {
      title: 'Добавление — Культурный след',
      excerpt,
      hasDraft: excerpt !== null,
      ...this.artworkExcerptsService.getDefaultMedia(),
      activeDraft: true,
    };
  }

  @Get()
  @Render('artwork_excerpts/gallery')
  async getGallery(
    @Query('artworkCreationDate') artworkCreationDate?: string,
  ) {
    const creationDateFilter = artworkCreationDate?.trim() ?? '';

    return {
      title: 'Плитка — Культурный след',
      excerpts: await this.artworkExcerptsService.getPublishedGallery(
        creationDateFilter || undefined,
      ),
      artworkCreationDate: creationDateFilter,
      activeGallery: true,
    };
  }

  @Post()
  @Redirect('/artwork_excerpts/draft', 303)
  async createDraft(@Body('artworkTitle') artworkTitle?: string) {
    await this.artworkExcerptsService.createDraft(artworkTitle);
  }

  @Post(':id/publish')
  @Redirect('/artwork_excerpts', 303)
  async publishDraft(
    @Param('id') id: string,
    @Body('shortDescription') shortDescription?: string,
    @Body('artworkCreationDate') artworkCreationDate?: string,
    @Body('citationCount') citationCount?: string,
  ) {
    const excerptId = this.parseId(id);
    const excerpt = await this.artworkExcerptsService.publishDraft(excerptId, {
      shortDescription,
      artworkCreationDate,
      citationCount,
    });

    return { url: `/artwork_excerpts/feed/${excerpt.id}` };
  }

  @Post(':id/delete')
  @Redirect('/artwork_excerpts', 303)
  async deleteExcerpt(@Param('id') id: string) {
    await this.artworkExcerptsService.deleteExcerpt(this.parseId(id));
  }

  private parseId(id: string): number {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new NotFoundException('Отрывок не найден');
    }
    return parsedId;
  }
}
