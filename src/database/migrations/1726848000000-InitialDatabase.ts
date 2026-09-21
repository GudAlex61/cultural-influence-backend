import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDatabase1726848000000 implements MigrationInterface {
  name = 'InitialDatabase1726848000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "artwork_excerpts_status_enum"
       AS ENUM ('draft', 'published', 'deleted')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "username" VARCHAR(64) NOT NULL,
        "display_name" VARCHAR(100) NOT NULL,
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "artwork_excerpts" (
        "id" SERIAL NOT NULL,
        "artwork_title" VARCHAR(160) NOT NULL,
        "short_description" VARCHAR(500),
        "status" "artwork_excerpts_status_enum" NOT NULL,
        "image_url" VARCHAR(500) NOT NULL,
        "video_url" VARCHAR(500) NOT NULL,
        "artwork_creation_date" DATE,
        "citation_count" INTEGER,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "formation_date" TIMESTAMP WITH TIME ZONE,
        "creator_id" INTEGER NOT NULL,
        CONSTRAINT "CHK_artwork_excerpts_citation_count"
          CHECK ("citation_count" IS NULL OR "citation_count" >= 0),
        CONSTRAINT "PK_artwork_excerpts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_artwork_excerpts_creator"
          FOREIGN KEY ("creator_id") REFERENCES "users"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_artwork_excerpts_creator_draft"
      ON "artwork_excerpts" ("creator_id")
      WHERE "status" = 'draft'
    `);

    await queryRunner.query(`
      CREATE TABLE "artwork_excerpt_likes" (
        "id" SERIAL NOT NULL,
        "user_id" INTEGER NOT NULL,
        "artwork_excerpt_id" INTEGER NOT NULL,
        CONSTRAINT "PK_artwork_excerpt_likes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_artwork_excerpt_likes_user_excerpt"
          UNIQUE ("user_id", "artwork_excerpt_id"),
        CONSTRAINT "FK_artwork_excerpt_likes_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_artwork_excerpt_likes_excerpt"
          FOREIGN KEY ("artwork_excerpt_id") REFERENCES "artwork_excerpts"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      INSERT INTO "users" ("username", "display_name")
      SELECT 'reader_' || number, 'Читатель ' || number
      FROM generate_series(1, 25) AS number
    `);

    await queryRunner.query(`
      INSERT INTO "artwork_excerpts" (
        "id", "artwork_title", "short_description", "status",
        "image_url", "video_url", "artwork_creation_date",
        "citation_count", "created_at", "formation_date", "creator_id"
      ) VALUES
        (1, 'Преступление и наказание',
         'История нравственного выбора Раскольникова и последствий идеи о праве сильного человека переступить закон.',
         'published',
         'http://localhost:9000/artwork-excerpts/crime-and-punishment.jpg',
         'http://localhost:9000/artwork-excerpts/crime-and-punishment.mp4',
         '1866-01-01', 12840, NOW(), NOW(), 1),
        (2, 'Война и мир',
         'Роман соединяет судьбы нескольких семей с событиями Отечественной войны и размышлениями о ходе истории.',
         'published',
         'http://localhost:9000/artwork-excerpts/war-and-peace.jpg',
         'http://localhost:9000/artwork-excerpts/war-and-peace.mp4',
         '1869-01-01', 15320, NOW(), NOW(), 1),
        (3, 'Гамлет',
         'Трагедия о датском принце, который пытается открыть правду о смерти отца и определить границы личного долга.',
         'published',
         'http://localhost:9000/artwork-excerpts/hamlet.jpg',
         'http://localhost:9000/artwork-excerpts/hamlet.mp4',
         '1601-01-01', 21950, NOW(), NOW(), 1),
        (4, 'Алиса в Стране чудес',
         'Путешествие Алисы по фантастическому миру стало источником образов для литературы, театра и кинематографа.',
         'published',
         'http://localhost:9000/artwork-excerpts/alice-in-wonderland.jpg',
         'http://localhost:9000/artwork-excerpts/alice-in-wonderland.mp4',
         '1865-11-26', 9840, NOW(), NOW(), 1),
        (5, 'Божественная комедия',
         'Поэтическое путешествие Данте через загробный мир сформировало множество устойчивых образов европейской культуры.',
         'published',
         'http://localhost:9000/artwork-excerpts/divine-comedy.jpg',
         'http://localhost:9000/artwork-excerpts/divine-comedy.mp4',
         '1321-01-01', 17610, NOW(), NOW(), 1),
        (6, 'Дон Кихот',
         'История странствующего рыцаря исследует столкновение идеала с реальностью и влияние литературы на человека.',
         'published',
         'http://localhost:9000/artwork-excerpts/don-quixote.jpg',
         'http://localhost:9000/artwork-excerpts/don-quixote.mp4',
         '1605-01-16', 14270, NOW(), NOW(), 1),
        (7, 'Фауст', NULL, 'draft',
         '/media/default-artwork.jpg', '/media/default-artwork.mp4',
         NULL, NULL, NOW(), NULL, 2),
        (8, 'Евгений Онегин',
         'Роман в стихах о выборе, упущенных возможностях и жизни русского общества первой трети XIX века.',
         'deleted',
         'http://localhost:9000/artwork-excerpts/eugene-onegin.svg',
         'http://localhost:9000/artwork-excerpts/eugene-onegin.mp4',
         '1833-01-01', 11190, NOW(), NOW(), 1)
    `);

    await queryRunner.query(`
      SELECT setval(
        pg_get_serial_sequence('artwork_excerpts', 'id'),
        (SELECT MAX(id) FROM artwork_excerpts)
      )
    `);

    await queryRunner.query(`
      INSERT INTO "artwork_excerpt_likes" ("user_id", "artwork_excerpt_id")
      VALUES
        (2, 1), (5, 1), (9, 1), (14, 1), (21, 1),
        (1, 2), (3, 2), (4, 2), (8, 2), (11, 2), (18, 2), (25, 2),
        (2, 3), (4, 3), (6, 3), (7, 3), (10, 3), (12, 3), (16, 3), (23, 3),
        (1, 4), (5, 4), (7, 4), (13, 4), (19, 4), (20, 4),
        (3, 5), (6, 5), (8, 5), (15, 5),
        (4, 6), (9, 6), (17, 6),
        (5, 8), (10, 8)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "artwork_excerpt_likes"');
    await queryRunner.query('DROP INDEX "UQ_artwork_excerpts_creator_draft"');
    await queryRunner.query('DROP TABLE "artwork_excerpts"');
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TYPE "artwork_excerpts_status_enum"');
  }
}
