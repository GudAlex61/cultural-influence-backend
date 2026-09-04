import { Test } from '@nestjs/testing';
import { ArtworkExcerptsController } from './artwork-excerpts.controller';

describe('ArtworkExcerptsController', () => {
  let controller: ArtworkExcerptsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ArtworkExcerptsController],
    }).compile();
    controller = module.get(ArtworkExcerptsController);
  });

  it('shows the first published excerpt in the feed', () => {
    const result = controller.getFeed();

    expect(result.excerpt.id).toBe(1);
    expect(result.excerpt.likeCount).toBe(5);
    expect(result.excerpts).toHaveLength(6);
    expect(result.excerpts[0].id).toBe(1);
  });

  it('opens the next published excerpt', () => {
    const result = controller.getFeed('1', 'true');

    expect(result.excerpt.id).toBe(2);
  });

  it('shows exactly one draft', () => {
    const result = controller.getDraft();

    expect(result.excerpt.status).toBe('draft');
    expect(result.excerpt.id).toBe(7);
  });

  it('filters published excerpts by publication year', () => {
    const result = controller.getGallery('1866');

    expect(result.excerpts).toHaveLength(1);
    expect(result.excerpts[0].workTitle).toBe('Преступление и наказание');
    expect(result.publicationYear).toBe('1866');
  });

  it('does not show draft and deleted excerpts in the gallery', () => {
    const result = controller.getGallery();

    expect(result.excerpts).toHaveLength(6);
    expect(result.excerpts.every((excerpt) => excerpt.status === 'published')).toBe(
      true,
    );
  });
});
