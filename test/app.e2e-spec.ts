import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import request = require('supertest');
import { AppModule } from '../src/app.module';

const hbs = require('hbs');

describe('Artwork excerpts pages (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    app.useStaticAssets(join(__dirname, '..', 'public'));
    hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /artwork-excerpts/feed/1?next=true opens the next card', async () => {
    const response = await request(app.getHttpServer())
      .get('/artwork-excerpts/feed/1?next=true')
      .expect(200);

    expect(response.text).toContain('Война и мир');
  });

  it('GET /artwork-excerpts/draft shows the draft form', async () => {
    const response = await request(app.getHttpServer())
      .get('/artwork-excerpts/draft')
      .expect(200);

    expect(response.text).toContain('Фауст');
    expect(response.text).toContain('Сохранение появится в ЛР2');
  });

  it('GET /artwork-excerpts filters cards and keeps the value', async () => {
    const response = await request(app.getHttpServer())
      .get('/artwork-excerpts?publicationYear=1866')
      .expect(200);

    expect(response.text).toContain('value="1866"');
    expect(response.text).toContain('Преступление и наказание');
    expect(response.text).not.toContain('Война и мир');
  });
});
