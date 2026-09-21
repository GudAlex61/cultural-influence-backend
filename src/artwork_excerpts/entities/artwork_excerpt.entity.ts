import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtworkExcerptLike } from './artwork_excerpt_like.entity';
import { User } from './user.entity';

export enum ArtworkExcerptStatus {
  Draft = 'draft',
  Published = 'published',
  Deleted = 'deleted',
}

@Entity({ name: 'artwork_excerpts' })
@Index('UQ_artwork_excerpts_creator_draft', ['creatorId'], {
  unique: true,
  where: '"status" = \'draft\'',
})
export class ArtworkExcerpt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'artwork_title', type: 'varchar', length: 160 })
  artworkTitle!: string;

  @Column({
    name: 'short_description',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  shortDescription!: string | null;

  @Column({ type: 'enum', enum: ArtworkExcerptStatus })
  status!: ArtworkExcerptStatus;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ name: 'video_url', type: 'varchar', length: 500 })
  videoUrl!: string;

  @Column({ name: 'artwork_creation_date', type: 'date', nullable: true })
  artworkCreationDate!: string | null;

  @Column({ name: 'citation_count', type: 'integer', nullable: true })
  citationCount!: number | null;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    name: 'formation_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  formationDate!: Date | null;

  @Column({ name: 'creator_id', type: 'integer' })
  creatorId!: number;

  @ManyToOne(() => User, (user) => user.artworkExcerpts, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @OneToMany(() => ArtworkExcerptLike, (like) => like.artworkExcerpt)
  likes!: ArtworkExcerptLike[];
}
