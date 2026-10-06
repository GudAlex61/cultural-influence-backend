import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { currentUser } from '../shared/current-user';
import { ArtworkMediaService } from './artwork_media.service';
import {
  ArtworkExcerptResponseDto,
  CreateArtworkExcerptDto,
  PublishArtworkExcerptDto,
} from './artwork_excerpts.dto';
import { ArtworkExcerpt, ArtworkExcerptStatus } from './entities/artwork_excerpt.entity';
import { ArtworkExcerptLike } from './entities/artwork_excerpt_like.entity';

@Injectable()
export class ArtworkExcerptsService {
  constructor(
    @InjectRepository(ArtworkExcerpt)
    private readonly excerptRepository: Repository<ArtworkExcerpt>,
    @InjectRepository(ArtworkExcerptLike)
    private readonly likeRepository: Repository<ArtworkExcerptLike>,
    private readonly media: ArtworkMediaService,
  ) {}

  async getPublished(date?: string): Promise<ArtworkExcerptResponseDto[]> {
    if (date !== undefined && !this.validDate(date)) {
      throw new BadRequestException();
    }
    const query = this.excerptRepository
      .createQueryBuilder('excerpt')
      .where('excerpt.status = :status', { status: ArtworkExcerptStatus.Published })
      .orderBy('excerpt.id', 'ASC');
    if (date) {
      query.andWhere('excerpt.artworkCreationDate = :date', { date });
    }
    return Promise.all((await query.getMany()).map((excerpt) => this.toResponse(excerpt)));
  }

  async getDraft(): Promise<ArtworkExcerptResponseDto> {
    const draft = await this.excerptRepository.findOneBy({
      creatorId: currentUser().id,
      status: ArtworkExcerptStatus.Draft,
    });
    if (!draft) {
      throw new NotFoundException();
    }
    return this.toResponse(draft);
  }

  async getFeed(id?: number, next = false): Promise<ArtworkExcerptResponseDto> {
    if (id !== undefined && (!Number.isInteger(id) || id <= 0)) {
      throw new NotFoundException();
    }
    if (id !== undefined && next) {
      await this.publishedById(id);
    }
    const query = this.excerptRepository
      .createQueryBuilder('excerpt')
      .where('excerpt.status = :status', { status: ArtworkExcerptStatus.Published })
      .orderBy('excerpt.id', 'ASC')
      .take(1);
    if (id !== undefined) {
      query.andWhere(`excerpt.id ${next ? '>' : '='} :id`, { id });
    }
    let excerpt = await query.getOne();
    if (!excerpt && next) {
      excerpt = await this.excerptRepository
        .createQueryBuilder('excerpt')
        .where('excerpt.status = :status', { status: ArtworkExcerptStatus.Published })
        .orderBy('excerpt.id', 'ASC')
        .take(1)
        .getOne();
    }
    if (!excerpt) {
      throw new NotFoundException();
    }
    return this.toResponse(excerpt);
  }

  async createDraft(
    body: CreateArtworkExcerptDto,
    image: Express.Multer.File,
    video: Express.Multer.File,
  ): Promise<ArtworkExcerptResponseDto> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.mimetype) ||
        image.size > 10 * 1024 * 1024 ||
        !['video/mp4', 'video/webm'].includes(video.mimetype)) {
      throw new BadRequestException();
    }
    const title = body.artworkTitle.trim();
    if (!title || await this.excerptRepository.existsBy({
      creatorId: currentUser().id,
      status: ArtworkExcerptStatus.Draft,
    })) {
      throw new BadRequestException();
    }

    const uploaded: string[] = [];
    let saved = false;
    try {
      const imageObject = await this.media.upload(image, 'image');
      uploaded.push(imageObject.key);
      const videoObject = await this.media.upload(video, 'video');
      uploaded.push(videoObject.key);
      const excerpt = await this.excerptRepository.save(this.excerptRepository.create({
        artworkTitle: title,
        shortDescription: null,
        artworkCreationDate: null,
        citationCount: null,
        status: ArtworkExcerptStatus.Draft,
        imageUrl: imageObject.url,
        videoUrl: videoObject.url,
        creatorId: currentUser().id,
        formationDate: null,
      }));
      saved = true;
      return this.toResponse(excerpt);
    } catch (error) {
      if (!saved) {
        await Promise.allSettled(uploaded.map((key) => this.media.remove(key)));
      }
      throw error;
    }
  }

  async publish(id: number, body: PublishArtworkExcerptDto): Promise<ArtworkExcerptResponseDto> {
    const draft = await this.excerptRepository.findOneBy({
      id,
      creatorId: currentUser().id,
      status: ArtworkExcerptStatus.Draft,
    });
    if (!draft) {
      throw new NotFoundException();
    }
    if (!body.shortDescription.trim() || !this.validDate(body.artworkCreationDate)) {
      throw new BadRequestException();
    }
    draft.shortDescription = body.shortDescription.trim();
    draft.artworkCreationDate = body.artworkCreationDate;
    draft.citationCount = body.citationCount;
    draft.formationDate = new Date();
    draft.status = ArtworkExcerptStatus.Published;
    return this.toResponse(await this.excerptRepository.save(draft));
  }

  async setLike(id: number, liked: 0 | 1): Promise<ArtworkExcerptResponseDto> {
    const excerpt = await this.publishedById(id);
    const pair = { userId: currentUser().id, artworkExcerptId: id };
    if (liked === 1) {
      await this.likeRepository.upsert(pair, ['userId', 'artworkExcerptId']);
    } else {
      await this.likeRepository.delete(pair);
    }
    return this.toResponse(excerpt);
  }

  async delete(id: number): Promise<void> {
    const excerpt = await this.excerptRepository.findOneBy({
      id,
      creatorId: currentUser().id,
      status: ArtworkExcerptStatus.Published,
    });
    if (!excerpt) {
      throw new NotFoundException();
    }
    excerpt.status = ArtworkExcerptStatus.Deleted;
    await this.excerptRepository.save(excerpt);
  }

  private async publishedById(id: number): Promise<ArtworkExcerpt> {
    const excerpt = await this.excerptRepository.findOneBy({
      id,
      status: ArtworkExcerptStatus.Published,
    });
    if (!excerpt) {
      throw new NotFoundException();
    }
    return excerpt;
  }

  private async toResponse(excerpt: ArtworkExcerpt): Promise<ArtworkExcerptResponseDto> {
    const [likeCount, ownLike] = await Promise.all([
      this.likeRepository.countBy({ artworkExcerptId: excerpt.id }),
      this.likeRepository.existsBy({ artworkExcerptId: excerpt.id, userId: currentUser().id }),
    ]);
    return {
      id: excerpt.id,
      artworkTitle: excerpt.artworkTitle,
      shortDescription: excerpt.shortDescription,
      imageUrl: excerpt.imageUrl,
      videoUrl: excerpt.videoUrl,
      artworkCreationDate: excerpt.artworkCreationDate,
      citationCount: excerpt.citationCount,
      createdAt: excerpt.createdAt,
      formationDate: excerpt.formationDate,
      likeCount,
      isOwner: excerpt.creatorId === currentUser().id ? 1 : 0,
      isLiked: ownLike ? 1 : 0,
    };
  }

  private validDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }
}
