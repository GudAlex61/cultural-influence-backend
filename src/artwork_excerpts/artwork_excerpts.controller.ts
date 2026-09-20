import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Render,
} from '@nestjs/common';
import {
  ArtworkExcerpt,
  artworkExcerpts,
  ArtworkExcerptStatus,
} from './artwork_excerpt.model';

@Controller('artwork_excerpts')
export class ArtworkExcerptsController {
  private readonly minioPublicUrl = 'http://localhost:9000/artwork-excerpts';

  // GET /artwork_excerpts/feed, GET /artwork_excerpts/feed/:id и ?next=true.
  @Get(['feed', 'feed/:id'])
  @Render('artwork_excerpts/feed')
  getFeed(@Param('id') id?: string, @Query('next') next?: string) {
    const publishedExcerpts = artworkExcerpts.filter(
      (excerpt) => excerpt.status === ArtworkExcerptStatus.Published,
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

    return {
      title: 'Лента — Культурный след',
      excerpt: this.prepareExcerpt(publishedExcerpts[excerptIndex]),
      activeFeed: true,
    };
  }

  // GET /artwork_excerpts/draft.
  @Get('draft')
  @Render('artwork_excerpts/draft')
  getDraft() {
    const draft = artworkExcerpts.find(
      (excerpt) => excerpt.status === ArtworkExcerptStatus.Draft,
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

  // GET /artwork_excerpts?artworkCreationDate=1865-11-26.
  @Get()
  @Render('artwork_excerpts/gallery')
  getGallery(@Query('artworkCreationDate') artworkCreationDate?: string) {
    let publishedExcerpts = artworkExcerpts.filter(
      (excerpt) => excerpt.status === ArtworkExcerptStatus.Published,
    );

    const creationDateFilter = artworkCreationDate?.trim() ?? '';
    if (creationDateFilter !== '') {
      publishedExcerpts = publishedExcerpts.filter(
        (excerpt) => excerpt.artworkCreationDate === creationDateFilter,
      );
    }

    return {
      title: 'Плитка — Культурный след',
      excerpts: publishedExcerpts.map((excerpt) =>
        this.prepareExcerpt(excerpt),
      ),
      artworkCreationDate: creationDateFilter,
      activeGallery: true,
    };
  }

  private prepareExcerpt(excerpt: ArtworkExcerpt) {
    const [year, month, day] = excerpt.artworkCreationDate.split('-');

    return {
      ...excerpt,
      formattedArtworkCreationDate: `${day}.${month}.${year}`,
      imageUrl: `${this.minioPublicUrl}/${excerpt.imageObjectKey}`,
      videoUrl: `${this.minioPublicUrl}/${excerpt.videoObjectKey}`,
      likeCount: excerpt.likedByUserIds.length,
    };
  }
}
