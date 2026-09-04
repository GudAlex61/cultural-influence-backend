export enum ExcerptStatus {
  Draft = 'draft',
  Published = 'published',
  Deleted = 'deleted',
}

export interface ArtworkExcerpt {
  id: number;
  workTitle: string;
  excerptText: string;
  creatorName: string;
  publicationYear: number;
  workType: string;
  status: ExcerptStatus;
  imageObjectKey: string;
  videoObjectKey: string;
  likedByUserIds: number[];
}

// Единственная коллекция данных лабораторной работы. База данных не используется.
export const artworkExcerpts: ArtworkExcerpt[] = [
  {
    id: 1,
    workTitle: 'Преступление и наказание',
    excerptText:
      'Тварь ли я дрожащая или право имею? Вопрос Раскольникова стал одной из самых узнаваемых формул русской литературы.',
    creatorName: 'Фёдор Достоевский',
    publicationYear: 1866,
    workType: 'Роман',
    status: ExcerptStatus.Published,
    imageObjectKey: 'crime-and-punishment.jpg',
    videoObjectKey: 'crime-and-punishment.mp4',
    likedByUserIds: [2, 5, 9, 14, 21],
  },
  {
    id: 2,
    workTitle: 'Война и мир',
    excerptText:
      'Нет величия там, где нет простоты, добра и правды. Эта мысль связывает исторический размах романа с нравственным выбором человека.',
    creatorName: 'Лев Толстой',
    publicationYear: 1869,
    workType: 'Роман-эпопея',
    status: ExcerptStatus.Published,
    imageObjectKey: 'war-and-peace.jpg',
    videoObjectKey: 'war-and-peace.mp4',
    likedByUserIds: [1, 3, 4, 8, 11, 18, 25],
  },
  {
    id: 3,
    workTitle: 'Гамлет',
    excerptText:
      'Быть или не быть — таков вопрос. Монолог Гамлета превратился в универсальный образ размышления о выборе и человеческом существовании.',
    creatorName: 'Уильям Шекспир',
    publicationYear: 1603,
    workType: 'Трагедия',
    status: ExcerptStatus.Published,
    imageObjectKey: 'hamlet.jpg',
    videoObjectKey: 'hamlet.mp4',
    likedByUserIds: [2, 4, 6, 7, 10, 12, 16, 23],
  },
  {
    id: 4,
    workTitle: 'Алиса в Стране чудес',
    excerptText:
      'Всё страньше и страньше! Приключения Алисы повлияли на язык, иллюстрацию, театр и кинематограф разных стран.',
    creatorName: 'Льюис Кэрролл',
    publicationYear: 1865,
    workType: 'Повесть-сказка',
    status: ExcerptStatus.Published,
    imageObjectKey: 'alice-in-wonderland.jpg',
    videoObjectKey: 'alice-in-wonderland.mp4',
    likedByUserIds: [1, 5, 7, 13, 19, 20],
  },
  {
    id: 5,
    workTitle: 'Божественная комедия',
    excerptText:
      'Земную жизнь пройдя до половины, я очутился в сумрачном лесу. Путешествие Данте стало основой множества образов мировой культуры.',
    creatorName: 'Данте Алигьери',
    publicationYear: 1321,
    workType: 'Поэма',
    status: ExcerptStatus.Published,
    imageObjectKey: 'divine-comedy.jpg',
    videoObjectKey: 'divine-comedy.mp4',
    likedByUserIds: [3, 6, 8, 15],
  },
  {
    id: 6,
    workTitle: 'Дон Кихот',
    excerptText:
      'Свобода есть одна из самых драгоценных щедрот, которые небо изливает на людей. Образ странствующего рыцаря живёт далеко за пределами романа.',
    creatorName: 'Мигель де Сервантес',
    publicationYear: 1605,
    workType: 'Роман',
    status: ExcerptStatus.Published,
    imageObjectKey: 'don-quixote.jpg',
    videoObjectKey: 'don-quixote.mp4',
    likedByUserIds: [4, 9, 17],
  },
  {
    id: 7,
    workTitle: 'Фауст',
    excerptText:
      'Лишь тот достоин жизни и свободы, кто каждый день за них идёт на бой. Карточка подготовлена, но ещё не опубликована.',
    creatorName: 'Иоганн Вольфганг фон Гёте',
    publicationYear: 1808,
    workType: 'Трагедия',
    status: ExcerptStatus.Draft,
    imageObjectKey: 'faust.jpg',
    videoObjectKey: 'faust.mp4',
    likedByUserIds: [],
  },
  {
    id: 8,
    workTitle: 'Евгений Онегин',
    excerptText:
      'Удалённая карточка оставлена в коллекции для демонстрации логического удаления.',
    creatorName: 'Александр Пушкин',
    publicationYear: 1833,
    workType: 'Роман в стихах',
    status: ExcerptStatus.Deleted,
    imageObjectKey: 'eugene-onegin.svg',
    videoObjectKey: 'eugene-onegin.mp4',
    likedByUserIds: [5, 10],
  },
];
