import { IsDateString, IsIn, IsInt, IsNotEmpty, IsString, Length, Matches, Min } from 'class-validator';

export class CreateArtworkExcerptDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  artworkTitle!: string;
}

export class PublishArtworkExcerptDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  shortDescription!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString()
  artworkCreationDate!: string;

  @IsInt()
  @Min(0)
  citationCount!: number;
}

export class SetArtworkExcerptLikeDto {
  @IsIn([0, 1])
  liked!: 0 | 1;
}

export interface ArtworkExcerptResponseDto {
  id: number;
  artworkTitle: string;
  shortDescription: string | null;
  imageUrl: string;
  videoUrl: string;
  artworkCreationDate: string | null;
  citationCount: number | null;
  createdAt: Date;
  formationDate: Date | null;
  likeCount: number;
  isOwner: 0 | 1;
  isLiked: 0 | 1;
}
