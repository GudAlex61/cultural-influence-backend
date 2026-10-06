# Культурный след — ЛР-3

REST API на NestJS, TypeORM, PostgreSQL и MinIO для отрывков произведений искусства. Ветка `artwork-excerpts-api` создана от ветки ЛР-2 `database`. Интерфейс ЛР-3 проверяется в Postman; сервер не выдаёт HTML-страницы и не использует шаблоны.

## Запуск

```powershell
npm install
docker compose up -d
npm run migration:run
npm run start:dev
```

Повторный `migration:run` не пересоздаёт таблицы. Базовый адрес API: `http://localhost:3000/api`. Для Postman импортируйте `documentation/ЛР3_Культурный_след.postman_collection.json`; файлы для запроса создания находятся в `demo-media/`. Если Postman после импорта не находит файлы по относительным путям, выберите их вручную в запросе 03.

Параметры подключения указаны в `.env.example`: PostgreSQL доступен на `localhost:5455`, MinIO — на `localhost:9000`. Данные PostgreSQL и объекты MinIO хранятся в Docker volumes. Не удаляйте volumes перед показом.

## HTTP-методы

| Метод и адрес | Вход | Результат |
| --- | --- | --- |
| `GET /api/artwork_excerpts` | необязательный `artworkCreationDate=YYYY-MM-DD` | опубликованные отрывки, `200` |
| `GET /api/artwork_excerpts/draft` | без ID | черновик фиксированного пользователя, `200` или `404` |
| `GET /api/artwork_excerpts/feed` | без ID | первый опубликованный отрывок, `200` или `404` |
| `GET /api/artwork_excerpts/feed/:id?next=true` | ID, необязательный `next=true` | отрывок по ID либо следующий, `200` или `404` |
| `POST /api/artwork_excerpts` | `multipart/form-data`: `artworkTitle`, `image` (файл), `video` (файл) | новый черновик, `201` |
| `PUT /api/artwork_excerpts/:id/publication` | JSON: `shortDescription`, `artworkCreationDate`, `citationCount` | опубликованный отрывок, `200` |
| `POST /api/artwork_excerpts/:id/likes` | JSON: `{"liked":1}` или `{"liked":0}` | обновлённый отрывок, `200` |
| `DELETE /api/artwork_excerpts/:id` | ID своего опубликованного отрывка | мягкое удаление, `200` без тела |
| `POST /api/users` | JSON: `username`, `displayName`, `password` | ID, имя входа и отображаемое имя, `201` |
| `POST /api/sessions` | заглушка ЛР-4 | `200` без тела, сессия пока не создаётся |
| `POST /api/sessions/logout` | заглушка ЛР-4 | `200` без тела |

Некорректный ввод возвращает `400`, недоступная или удалённая запись — `404`; тело ошибки пустое. Создатель в ЛР-3 фиксирован функцией `currentUser()` с ID `1`. Клиенту запрещено задавать ID, статус, создателя и системные даты. Статус отрывка остаётся только в БД: `draft → published → deleted`, обратных переходов нет. Удалять можно лишь свой опубликованный отрывок. Восстанавливать его миграцией не нужно.

Во всех ответах с отрывком присутствуют одинаковые поля: `id`, `artworkTitle`, `shortDescription`, `imageUrl`, `videoUrl`, `artworkCreationDate`, `citationCount`, `createdAt`, `formationDate`, `likeCount`, `isOwner`, `isLiked`. Пустые поля представлены `null`; `isOwner` и `isLiked` — `0` или `1`. Статус записи и HTTP-код в JSON не дублируются. `GET` ленты выбирает в БД не более одной записи.

При создании принимаются именно два файла. Сервер создаёт латинские имена объектов, загружает оба файла в бакет MinIO `artwork-excerpts` и сохраняет URL в БД. При неудаче создания строки уже загруженные объекты удаляются. Наименование объекта — последняя часть URL. Поддерживаются JPEG/PNG/WebP до 10 МиБ и MP4/WebM до 50 МиБ.

## Таблицы

- `users`: `id` (PK), `username` (уникальное), `display_name`, `password_hash` (обязательное). Новая регистрация сохраняет хеш `scrypt`, открытый пароль не сохраняется. У старых демонстрационных пользователей ЛР-2 остаются тестовые значения поля до появления полноценной авторизации в ЛР-4.
- `artwork_excerpts`: `id` (PK), `artwork_title`, `short_description` (может быть `NULL` у черновика), `status` (только БД), обязательные `image_url` и `video_url`, тематические `artwork_creation_date` и `citation_count` (могут быть `NULL` у черновика), `created_at`, `formation_date`, `creator_id` (FK). На одного создателя допускается не более одного черновика.
- `artwork_excerpt_likes`: `id` (PK), `user_id` (FK), `artwork_excerpt_id` (FK); пара пользователя и отрывка уникальна.

Схема создаётся миграциями TypeORM, `synchronize: false`. Каскадное удаление таблиц не используется. Взаимодействие API с БД выполнено через TypeORM. Короткое объяснение архитектуры и контрольных вопросов — в `documentation/ЛР3_контрольные_вопросы.md`. В `documentation/Культурный_след_ЛР3.drawio` находятся редактируемые ER и диаграмма классов.

## Порядок показа

Покажите 10 запросов коллекции Postman в порядке их номеров: список, фильтр, создание с двумя файлами, черновик, публикация, лента без ID, следующий отрывок, лайк, удаление, регистрация. Затем в терминале выполните `SELECT` по трём таблицам, покажите модели и сериализатор, функцию `currentUser()` и этот README. Снимки и документ с пояснениями следует хранить на рабочем столе отдельно от репозитория.

Для трёх `SELECT` используйте команды:

```powershell
docker exec cultural_postgres psql -U cultural_user -d cultural_influence -c 'SELECT id, artwork_title, status, image_url, video_url, creator_id FROM artwork_excerpts ORDER BY id DESC LIMIT 8;'
docker exec cultural_postgres psql -U cultural_user -d cultural_influence -c 'SELECT id, user_id, artwork_excerpt_id FROM artwork_excerpt_likes ORDER BY id DESC LIMIT 8;'
docker exec cultural_postgres psql -U cultural_user -d cultural_influence -c 'SELECT id, username, display_name, LEFT(password_hash, 7) AS hash_prefix FROM users ORDER BY id DESC LIMIT 8;'
```
