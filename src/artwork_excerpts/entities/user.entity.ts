import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArtworkExcerptLike } from './artwork_excerpt_like.entity';
import { ArtworkExcerpt } from './artwork_excerpt.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'username', type: 'varchar', length: 64, unique: true })
  username!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName!: string;

  @OneToMany(() => ArtworkExcerpt, (excerpt) => excerpt.creator)
  artworkExcerpts!: ArtworkExcerpt[];

  @OneToMany(() => ArtworkExcerptLike, (like) => like.user)
  artworkExcerptLikes!: ArtworkExcerptLike[];
}
