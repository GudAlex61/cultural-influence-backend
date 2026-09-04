# Файлы бакета MinIO

В папке находятся восемь оригинальных векторных обложек, созданных специально для учебного приложения «Культурный след». Они не содержат скачанных фотографий, репродукций или чужих иллюстраций. Во всех файлах использована палитра интерфейса: `#ED2324`, `#3C3C3C`, `#FFFFFF`.

Имена файлов полностью совпадают со значениями `imageObjectKey` в массиве приложения:

| Файл | Произведение | Автор | Год в приложении |
|---|---|---|---:|
| `crime-and-punishment.svg` | «Преступление и наказание» | Фёдор Достоевский | 1866 |
| `war-and-peace.svg` | «Война и мир» | Лев Толстой | 1869 |
| `hamlet.svg` | «Гамлет» | Уильям Шекспир | 1603 |
| `alice-in-wonderland.svg` | «Алиса в Стране чудес» | Льюис Кэрролл | 1865 |
| `divine-comedy.svg` | «Божественная комедия» | Данте Алигьери | 1321 |
| `don-quixote.svg` | «Дон Кихот» | Мигель де Сервантес | 1605 |
| `faust.svg` | «Фауст» | Иоганн Вольфганг фон Гёте | 1808 |
| `eugene-onegin.svg` | «Евгений Онегин» | Александр Пушкин | 1833 |

Восемь коротких `.mp4`-заставок также находятся в этой папке под именами из полей `videoObjectKey`. Они созданы специально для учебного приложения и отличаются цветовым оформлением.

## Источники фактических сведений

Год означает год первой публикации, полного книжного издания или завершения — в зависимости от истории произведения. Для неоднозначных случаев это явно указано ниже.

- [«Преступление и наказание»](https://www.encyclopedia.com/history/modern-europe/ancient-history-middle-ages-and-feudalism/crime-and-punishment): роман Достоевского опубликован на русском языке в 1866 году.
- [«Война и мир»](https://www.encyclopedia.com/literature-and-arts/literature-other-modern-languages/russian-and-eastern-european-literature/war-and-peace): роман Толстого публиковался с 1865 по 1869 год; в приложении указан год завершения публикации — 1869.
- [«Гамлет», Folger Shakespeare Library](https://www.folger.edu/explore/shakespeares-works/hamlet/an-introduction-to-this-text/): первое кварто пьесы Шекспира появилось в 1603 году.
- [«Алиса в Стране чудес»](https://www.encyclopedia.com/arts/educational-magazines/alices-adventures-wonderland): произведение Льюиса Кэрролла опубликовано в 1865 году.
- [«Божественная комедия»](https://www.encyclopedia.com/people/literature-and-arts/music-popular-and-jazz-biographies/divine-comedy): поэма Данте завершена незадолго до его смерти в 1321 году; поскольку точная дата единого первого издания для рукописной эпохи неприменима, в приложении указан год завершения.
- [«Дон Кихот», Национальная библиотека Испании](https://www.bne.es/es/colecciones/cervantes/ingenioso-hidalgo-don-quixote-mancha): первое издание первой части напечатано с выходными данными 1605 года.
- [«Фауст»](https://germanhistorydocs.org/en/the-holy-roman-empire-1648-1815/johann-wolfgang-von-goethe-excerpts-from-faust-1808.pdf): Гёте опубликовал первую часть в 1808 году.
- [«Евгений Онегин», Государственный музей А. С. Пушкина](https://pushkinmuseum.ru/?q=content%2Fpushkin-evgeniy-onegin): первое отдельное полное издание романа Пушкина осуществлено в 1833 году.

## Автоматическая загрузка через Docker Compose

Из корня приложения выполнить:

```powershell
docker compose up -d
```

Сервис `create-bucket`:

1. создаёт бакет `cultural-excerpts`, если он ещё не существует;
2. включает публичное скачивание объектов;
3. копирует содержимое этой папки в корень бакета.

Проверить загрузку можно по адресу `http://localhost:9000/cultural-excerpts/crime-and-punishment.svg`. Консоль MinIO доступна на `http://localhost:9001`; имя пользователя — `root`, пароль — `rootpassword`.

## Ручная загрузка через MinIO Client

```powershell
mc alias set local http://localhost:9000 root rootpassword
mc mb --ignore-existing local/cultural-excerpts
mc anonymous set download local/cultural-excerpts
mc cp --recursive .\media\ local/cultural-excerpts/
```

Браузер должен получать SVG с типом содержимого `image/svg+xml`.
