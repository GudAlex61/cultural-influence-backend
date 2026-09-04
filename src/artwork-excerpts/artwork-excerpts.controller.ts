import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Render,
} from '@nestjs/common';
import { ArtworkExcerpt, artworkExcerpts, ExcerptStatus } from './artwork-excerpt.model';

@Controller('artwork-excerpts')
export class ArtworkExcerptsController {
  private readonly minioPublicUrl = 'http://localhost:9000/cultural-excerpts';

  // GET /artwork-excerpts/feed, GET /artwork-excerpts/feed/:id и ?next=true.
  @Get(['feed', 'feed/:id'])
  @Render('artwork-excerpts/feed')
  getFeed(@Param('id') id?: string, @Query('next') next?: string) {
    const publishedExcerpts = artworkExcerpts.filter(
      (excerpt) => excerpt.status === ExcerptStatus.Published,
    );

    let excerptIndex = 0;
    if (id !== undefined) {
      excerptIndex = publishedExcerpts.findIndex(
        (excerpt) => excerpt.id === Number(id),
      );
      if (excerptIndex === -1) {
        throw new NotFoundException('Опубликованный отрывок не найден');
      }
    }

    if (next === 'true') {
      excerptIndex = (excerptIndex + 1) % publishedExcerpts.length;
    }

    const orderedExcerpts = [
      ...publishedExcerpts.slice(excerptIndex),
      ...publishedExcerpts.slice(0, excerptIndex),
    ].map((excerpt) => this.prepareExcerpt(excerpt));

    return {
      title: 'Лента — Культурный след',
      excerpts: orderedExcerpts,
      activeFeed: true,
    };
  }

  // GET /artwork-excerpts/draft.
  @Get('draft')
  @Render('artwork-excerpts/draft')
  getDraft() {
    const draft = artworkExcerpts.find(
      (excerpt) => excerpt.status === ExcerptStatus.Draft,
    );
    if (!draft) {
      throw new NotFoundException('Черновик не найден');
    }

    return {
      title: 'Добавление — Культурный след',
      excerpt: this.prepareExcerpt(draft),
      activeDraft: true,
    };
  }

  // GET /artwork-excerpts?publicationYear=1866.
  @Get()
  @Render('artwork-excerpts/gallery')
  getGallery(@Query('publicationYear') publicationYear?: string) {
    let publishedExcerpts = artworkExcerpts.filter(
      (excerpt) => excerpt.status === ExcerptStatus.Published,
    );

    const yearFilter = publicationYear?.trim() ?? '';
    if (yearFilter !== '') {
      publishedExcerpts = publishedExcerpts.filter(
        (excerpt) => excerpt.publicationYear === Number(yearFilter),
      );
    }

    return {
      title: 'Плитка — Культурный след',
      excerpts: publishedExcerpts.map((excerpt) =>
        this.prepareExcerpt(excerpt),
      ),
      publicationYear: yearFilter,
      activeGallery: true,
    };
  }

  private prepareExcerpt(excerpt: ArtworkExcerpt) {
    return {
      ...excerpt,
      imageUrl: `${this.minioPublicUrl}/${excerpt.imageObjectKey}`,
      videoUrl: `${this.minioPublicUrl}/${excerpt.videoObjectKey}`,
      likeCount: excerpt.likedByUserIds.length,
    };
  }
}
