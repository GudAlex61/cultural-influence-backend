# Культурный след — ЛР 4

Бэкенд для отрывков произведений искусства на NestJS, TypeORM, PostgreSQL, MinIO и Redis. Эта ветка `artwork-excerpts-sessions` продолжает ЛР 3 `artwork-excerpts-api`: вместо фиксированного пользователя действуют вход по паролю, сессия в Redis и cookie `sessionId`. HTML-шаблонов и страниц приложения в бэкенде нет.

## Запуск

```powershell
npm install
docker compose up -d
npm run migration:run
npm run start:dev
```

При свободном порте 3000 Swagger доступен по адресу <http://localhost:3000/api/docs>, API — по <http://localhost:3000/api>. Если порт занят, задайте `$env:PORT='3002'` перед запуском и замените порт в ссылках. Конфигурация PostgreSQL, MinIO и Redis находится в `.env.example`. Docker volumes сохраняют данные между перезапусками. Миграции не нужно откатывать после показа.

Для локального HTTP используется `COOKIE_SECURE=false`. При HTTPS установите `COOKIE_SECURE=true`; cookie также имеет `HttpOnly`, `SameSite=Lax`, срок жизни по умолчанию 3600 секунд. В Redis хранится `session:<случайный ID> → ID пользователя` с TTL. Выход удаляет ключ и очищает cookie. Пароль хранится в PostgreSQL только в виде `scrypt`-хеша. Старые демонстрационные пользователи ЛР 2 не имеют настоящего хеша и для входа не подходят: зарегистрируйте нового через `POST /api/users`.

## Методы

| Метод и адрес | Доступ | Вход и результат |
| --- | --- | --- |
| `POST /api/users` | гость | JSON `username`, `displayName`, `password`; `201`, ID и имена без пароля |
| `POST /api/sessions` | гость | JSON `username`, `password`; `200`, данные пользователя и `Set-Cookie: sessionId=...`; неверные данные — `401` |
| `POST /api/sessions/logout` | создатель | `200` без тела, сессия удаляется |
| `GET /api/artwork_excerpts` | все | необязательный `artworkCreationDate=YYYY-MM-DD`; `200`, только опубликованные отрывки |
| `GET /api/artwork_excerpts/feed` | все | `200`, первый опубликованный отрывок |
| `GET /api/artwork_excerpts/feed/:id?next=true` | все | `200`, следующий опубликованный отрывок |
| `GET /api/artwork_excerpts/draft` | создатель | `200`, свой черновик без ID в URL |
| `POST /api/artwork_excerpts` | создатель | `multipart/form-data`: `artworkTitle`, файлы `image`, `video`; `201`, черновик |
| `PUT /api/artwork_excerpts/:id/publication` | создатель | JSON `shortDescription`, `artworkCreationDate`, `citationCount`; `200`, публикация своего черновика |
| `POST /api/artwork_excerpts/:id/likes` | создатель | JSON `{"liked":1}` или `{"liked":0}`; `200`, лайк или отмена |
| `DELETE /api/artwork_excerpts/:id` | создатель | `200` без тела, логическое удаление своего опубликованного отрывка |

Публичное чтение работает без cookie: `isOwner` и `isLiked` равны `0`. Для методов создателя нужна действующая сессия, без неё ответ `401` с пустым телом. Некорректный ввод даёт `400`, недоступная или удалённая запись — `404`; HTTP-код и текст ошибки не дублируются в JSON. У ответов с отрывком постоянный состав полей: `id`, `artworkTitle`, `shortDescription`, `imageUrl`, `videoUrl`, `artworkCreationDate`, `citationCount`, `createdAt`, `formationDate`, `likeCount`, `isOwner`, `isLiked`. Не заполненные поля равны `null`, признаки — `0` или `1`. Статус записи хранится только в БД.

## Данные

- `users`: `id`, уникальный `username`, `display_name`, `password_hash`.
- `artwork_excerpts`: `id`, `artwork_title`, `short_description`, `status`, обязательные `image_url` и `video_url`, тематические `artwork_creation_date` и `citation_count`, `created_at`, `formation_date`, `creator_id`.
- `artwork_excerpt_likes`: `id`, `user_id`, `artwork_excerpt_id`, уникальная пара пользователя и отрывка.

Схема создаётся миграциями TypeORM (`synchronize: false`). Файлы JPEG/PNG/WebP до 10 МиБ и MP4/WebM до 50 МиБ хранятся в MinIO, в БД остаются URL. Если создание строки не удалось, загруженные объекты удаляются. Каскадное удаление записей не используется.

## Показ

Импортируйте коллекцию `documentation/ЛР4_Культурный_след.postman_collection.json` в Postman. В ней десять запросов с явными URL на порт `3002`, без переменных коллекции и query-параметров. Запустите сервер с `$env:PORT='3002'`. Запросы `01` и `05` создают данные и не рассчитаны на повторное выполнение с тем же именем пользователя и тем же черновиком: перед повторным показом используйте новое имя демонстрационного пользователя и замените ID в адресах запросов `07`–`08` на ID ответа `05`. Не используйте демонстрационный пароль для других учётных записей.

Порядок показа ЛР 4: вход и публичный список через Swagger в режиме инкогнито, затем cookie в инструментах разработчика; в Postman — публичный список с cookie и без неё, отказ гостю в публикации и успешную публикацию своего черновика. До выхода покажите соответствующий ключ Redis. Для проверки Redis:

```powershell
docker exec cultural_redis redis-cli --scan --pattern 'session:*'
docker exec cultural_redis redis-cli GET session:<ID_из_cookie>
docker exec cultural_redis redis-cli TTL session:<ID_из_cookie>
```

Редактируемые ER, классы и последовательность находятся в `documentation/Культурный_след_ЛР4.drawio`. В диаграмме последовательности показаны фронтенд и два домена, без БД. Реальные скриншоты и отчёт РИП хранятся отдельно от репозитория на рабочем столе.
