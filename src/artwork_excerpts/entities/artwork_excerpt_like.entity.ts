import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { ArtworkExcerpt } from './artwork_excerpt.entity';
import { User } from './user.entity';

@Entity({ name: 'artwork_excerpt_likes' })
@Index('UQ_artwork_excerpt_likes_user_excerpt', ['userId', 'artworkExcerptId'], {
  unique: true,
})
export class ArtworkExcerptLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'artwork_excerpt_id', type: 'integer' })
  artworkExcerptId!: number;

  @ManyToOne(() => User, (user) => user.artworkExcerptLikes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => ArtworkExcerpt, (excerpt) => excerpt.likes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'artwork_excerpt_id' })
  artworkExcerpt!: ArtworkExcerpt;
}
