import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ArtworkExcerpt,
  ArtworkExcerptStatus,
} from './entities/artwork_excerpt.entity';
import { ArtworkExcerptLike } from './entities/artwork_excerpt_like.entity';

export interface PublishArtworkExcerptInput {
  shortDescription?: string;
  artworkCreationDate?: string;
  citationCount?: string;
}

export interface PreparedArtworkExcerpt extends ArtworkExcerpt {
  formattedArtworkCreationDate: string;
  likeCount: number;
  displayImageUrl: string;
  displayVideoUrl: string;
}

@Injectable()
export class ArtworkExcerptsService {
  private readonly currentCreatorId = 1;
  private readonly defaultImageUrl = '/media/default-artwork.jpg';
  private readonly defaultVideoUrl = '/media/default-artwork.mp4';

  constructor(
    @InjectRepository(ArtworkExcerpt)
    private readonly artworkExcerptRepository: Repository<ArtworkExcerpt>,
    @InjectRepository(ArtworkExcerptLike)
    private readonly artworkExcerptLikeRepository: Repository<ArtworkExcerptLike>,
    private readonly dataSource: DataSource,
  ) {}

  async getFeedExcerpt(
    requestedId?: number,
    next = false,
  ): Promise<PreparedArtworkExcerpt> {
    let excerpt: ArtworkExcerpt | null;

    if (requestedId === undefined) {
      excerpt = await this.firstPublishedExcerpt();
    } else if (next) {
      excerpt = await this.artworkExcerptRepository
        .createQueryBuilder('excerpt')
        .where('excerpt.status = :status', {
          status: ArtworkExcerptStatus.Published,
        })
        .andWhere('excerpt.id > :requestedId', { requestedId })
        .orderBy('excerpt.id', 'ASC')
        .take(1)
        .getOne();

      excerpt ??= await this.firstPublishedExcerpt();
    } else {
      excerpt = await this.artworkExcerptRepository
        .createQueryBuilder('excerpt')
        .where('excerpt.status = :status', {
          status: ArtworkExcerptStatus.Published,
        })
        .andWhere('excerpt.id = :requestedId', { requestedId })
        .take(1)
        .getOne();
    }

    if (!excerpt) {
      throw new NotFoundException('Опубликованный отрывок не найден');
    }

    return this.prepareExcerpt(excerpt);
  }

  async getCurrentDraft(): Promise<PreparedArtworkExcerpt | null> {
    const draft = await this.artworkExcerptRepository.findOne({
      where: {
        creatorId: this.currentCreatorId,
        status: ArtworkExcerptStatus.Draft,
      },
    });

    return draft ? this.prepareExcerpt(draft) : null;
  }

  async getPublishedGallery(
    artworkCreationDate?: string,
  ): Promise<PreparedArtworkExcerpt[]> {
    const query = this.artworkExcerptRepository
      .createQueryBuilder('excerpt')
      .where('excerpt.status = :status', {
        status: ArtworkExcerptStatus.Published,
      })
      .orderBy('excerpt.id', 'ASC');

    if (artworkCreationDate) {
      query.andWhere('excerpt.artworkCreationDate = :artworkCreationDate', {
        artworkCreationDate,
      });
    }

    const excerpts = await query.getMany();
    return Promise.all(excerpts.map((excerpt) => this.prepareExcerpt(excerpt)));
  }

  async createDraft(artworkTitle?: string): Promise<ArtworkExcerpt> {
    const title = artworkTitle?.trim();
    if (!title) {
      throw new BadRequestException('Укажите название произведения');
    }

    const existingDraft = await this.artworkExcerptRepository.findOne({
      where: {
        creatorId: this.currentCreatorId,
        status: ArtworkExcerptStatus.Draft,
      },
    });
    if (existingDraft) {
      return existingDraft;
    }

    return this.artworkExcerptRepository.save(
      this.artworkExcerptRepository.create({
        artworkTitle: title,
        shortDescription: null,
        artworkCreationDate: null,
        citationCount: null,
        status: ArtworkExcerptStatus.Draft,
        imageUrl: this.defaultImageUrl,
        videoUrl: this.defaultVideoUrl,
        creatorId: this.currentCreatorId,
        formationDate: null,
      }),
    );
  }

  async publishDraft(
    excerptId: number,
    input: PublishArtworkExcerptInput,
  ): Promise<ArtworkExcerpt> {
    const draft = await this.artworkExcerptRepository.findOne({
      where: {
        id: excerptId,
        creatorId: this.currentCreatorId,
        status: ArtworkExcerptStatus.Draft,
      },
    });
    if (!draft) {
      throw new NotFoundException('Черновик не найден');
    }

    const shortDescription = input.shortDescription?.trim();
    const artworkCreationDate = input.artworkCreationDate?.trim();
    const citationCount = Number(input.citationCount);

    if (!shortDescription || !artworkCreationDate) {
      throw new BadRequestException(
        'Для публикации заполните описание и оба поля по теме',
      );
    }
    if (!Number.isInteger(citationCount) || citationCount < 0) {
      throw new BadRequestException(
        'Количество цитирований должно быть целым неотрицательным числом',
      );
    }

    draft.shortDescription = shortDescription;
    draft.artworkCreationDate = artworkCreationDate;
    draft.citationCount = citationCount;
    draft.status = ArtworkExcerptStatus.Published;
    draft.formationDate = new Date();

    return this.artworkExcerptRepository.save(draft);
  }

  async deleteExcerpt(excerptId: number): Promise<void> {
    const [rows] = (await this.dataSource.query(
      `UPDATE artwork_excerpts
       SET status = $1
       WHERE id = $2 AND status <> $1
       RETURNING id`,
      [ArtworkExcerptStatus.Deleted, excerptId],
    )) as [{ id: number }[], number];

    if (rows.length === 0) {
      throw new NotFoundException('Отрывок не найден');
    }
  }

  getDefaultMedia() {
    return {
      defaultImageUrl: this.defaultImageUrl,
      defaultVideoUrl: this.defaultVideoUrl,
    };
  }

  private firstPublishedExcerpt(): Promise<ArtworkExcerpt | null> {
    return this.artworkExcerptRepository
      .createQueryBuilder('excerpt')
      .where('excerpt.status = :status', {
        status: ArtworkExcerptStatus.Published,
      })
      .orderBy('excerpt.id', 'ASC')
      .take(1)
      .getOne();
  }

  private async prepareExcerpt(
    excerpt: ArtworkExcerpt,
  ): Promise<PreparedArtworkExcerpt> {
    const likeCount = await this.artworkExcerptLikeRepository.countBy({
      artworkExcerptId: excerpt.id,
    });
    const formattedArtworkCreationDate = excerpt.artworkCreationDate
      ? this.formatDate(excerpt.artworkCreationDate)
      : 'Не указана';

    const [displayImageUrl, displayVideoUrl] = await Promise.all([
      this.availableMediaUrl(excerpt.imageUrl, this.defaultImageUrl),
      this.availableMediaUrl(excerpt.videoUrl, this.defaultVideoUrl),
    ]);

    return Object.assign(excerpt, {
      formattedArtworkCreationDate,
      likeCount,
      displayImageUrl,
      displayVideoUrl,
    });
  }

  private formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  }

  private async availableMediaUrl(
    mediaUrl: string,
    fallbackUrl: string,
  ): Promise<string> {
    if (!mediaUrl) {
      return fallbackUrl;
    }
    if (mediaUrl.startsWith('/')) {
      return mediaUrl;
    }

    try {
      const response = await fetch(mediaUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(1500),
      });
      return response.ok ? mediaUrl : fallbackUrl;
    } catch {
      return fallbackUrl;
    }
  }
}
