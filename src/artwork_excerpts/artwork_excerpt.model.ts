export enum ArtworkExcerptStatus {
  Draft = 'draft',
  Published = 'published',
  Deleted = 'deleted',
}

export interface ArtworkExcerpt {
  id: number;
  artworkTitle: string;
  shortDescription: string;
  artworkCreationDate: string;
  citationCount: number;
  status: ArtworkExcerptStatus;
  imageObjectKey: string;
  videoObjectKey: string;
  likedByUserIds: number[];
}

export const artworkExcerpts: ArtworkExcerpt[] = [
  {
    id: 1,
    artworkTitle: 'Преступление и наказание',
    shortDescription:
      'История нравственного выбора Раскольникова и последствий идеи о праве сильного человека переступить закон.',
    artworkCreationDate: '1866-01-01',
    citationCount: 12840,
    status: ArtworkExcerptStatus.Published,
    imageObjectKey: 'crime-and-punishment.jpg',
    videoObjectKey: 'crime-and-punishment.mp4',
    likedByUserIds: [2, 5, 9, 14, 21],
  },
  {
    id: 2,
    artworkTitle: 'Война и мир',
    shortDescription:
      'Роман соединяет судьбы нескольких семей с событиями Отечественной войны и размышлениями о ходе истории.',
    artworkCreationDate: '1869-01-01',
    citationCount: 15320,
    status: ArtworkExcerptStatus.Published,
    imageObjectKey: 'war-and-peace.jpg',
    videoObjectKey: 'war-and-peace.mp4',
    likedByUserIds: [1, 3, 4, 8, 11, 18, 25],
  },
  {
    id: 3,
    artworkTitle: 'Гамлет',
    shortDescription:
      'Трагедия о датском принце, который пытается открыть правду о смерти отца и определить границы личного долга.',
    artworkCreationDate: '1601-01-01',
    citationCount: 21950,
    status: ArtworkExcerptStatus.Published,
    imageObjectKey: 'hamlet.jpg',
    videoObjectKey: 'hamlet.mp4',
    likedByUserIds: [2, 4, 6, 7, 10, 12, 16, 23],
  },
  {
    id: 4,
    artworkTitle: 'Алиса в Стране чудес',
    shortDescription:
      'Путешествие Алисы по фантастическому миру стало источником образов для литературы, театра и кинематографа.',
    artworkCreationDate: '1865-11-26',
    citationCount: 9840,
    status: ArtworkExcerptStatus.Published,
    imageObjectKey: 'alice-in-wonderland.jpg',
    videoObjectKey: 'alice-in-wonderland.mp4',
    likedByUserIds: [1, 5, 7, 13, 19, 20],
  },
  {
    id: 5,
    artworkTitle: 'Божественная комедия',
    shortDescription:
      'Поэтическое путешествие Данте через загробный мир сформировало множество устойчивых образов европейской культуры.',
    artworkCreationDate: '1321-01-01',
    citationCount: 17610,
    status: ArtworkExcerptStatus.Published,
    imageObjectKey: 'divine-comedy.jpg',
    videoObjectKey: 'divine-comedy.mp4',
    likedByUserIds: [3, 6, 8, 15],
  },
  {
    id: 6,
    artworkTitle: 'Дон Кихот',
    shortDescription:
      'История странствующего рыцаря исследует столкновение идеала с реальностью и влияние литературы на человека.',
    artworkCreationDate: '1605-01-16',
    citationCount: 14270,
    status: ArtworkExcerptStatus.Published,
    imageObjectKey: 'don-quixote.jpg',
    videoObjectKey: 'don-quixote.mp4',
    likedByUserIds: [4, 9, 17],
  },
  {
    id: 7,
    artworkTitle: 'Фауст',
    shortDescription:
      'Трагедия о стремлении к знанию и цене договора, заключённого человеком ради выхода за пределы возможного.',
    artworkCreationDate: '1808-01-01',
    citationCount: 8650,
    status: ArtworkExcerptStatus.Draft,
    imageObjectKey: 'faust.jpg',
    videoObjectKey: 'faust.mp4',
    likedByUserIds: [],
  },
  {
    id: 8,
    artworkTitle: 'Евгений Онегин',
    shortDescription:
      'Роман в стихах о выборе, упущенных возможностях и жизни русского общества первой трети XIX века.',
    artworkCreationDate: '1833-01-01',
    citationCount: 11190,
    status: ArtworkExcerptStatus.Deleted,
    imageObjectKey: 'eugene-onegin.svg',
    videoObjectKey: 'eugene-onegin.mp4',
    likedByUserIds: [5, 10],
  },
];
