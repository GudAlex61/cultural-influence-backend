import { IsDateString, IsIn, IsInt, IsNotEmpty, IsString, Length, Matches, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArtworkExcerptDto {
  @ApiProperty({ example: 'Цитата из романа' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  artworkTitle!: string;
}

export class PublishArtworkExcerptDto {
  @ApiProperty({ example: 'Краткое описание отрывка' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  shortDescription!: string;

  @ApiProperty({ example: '1866-01-01', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString()
  artworkCreationDate!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  @IsInt()
  @Min(0)
  citationCount!: number;
}

export class SetArtworkExcerptLikeDto {
  @ApiProperty({ enum: [0, 1], example: 1 })
  @IsIn([0, 1])
  liked!: 0 | 1;
}

export class ArtworkExcerptResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() artworkTitle!: string;
  @ApiProperty({ nullable: true, type: String }) shortDescription!: string | null;
  @ApiProperty() imageUrl!: string;
  @ApiProperty() videoUrl!: string;
  @ApiProperty({ nullable: true, type: String, format: 'date' }) artworkCreationDate!: string | null;
  @ApiProperty({ nullable: true, type: Number }) citationCount!: number | null;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' }) formationDate!: Date | null;
  @ApiProperty() likeCount!: number;
  @ApiProperty({ enum: [0, 1] }) isOwner!: 0 | 1;
  @ApiProperty({ enum: [0, 1] }) isLiked!: 0 | 1;
}
