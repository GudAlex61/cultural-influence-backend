# Культурный след — лабораторная работа №1

Приложение на Node.js, NestJS, TypeScript и Handlebars. Данные хранятся в одном массиве без базы данных и клиентского JavaScript.

## Запуск

Требуется Node.js 18 LTS, npm и Docker Desktop.

```bash
npm install
docker compose up -d
npm run start:dev
```

Приложение: `http://localhost:3000/artwork-excerpts`

MinIO: `http://localhost:9001` (логин `root`, пароль `rootpassword`).

Перед первым запуском MinIO положите медиафайлы в папку `media`. Их имена перечислены в модели `src/artwork-excerpts/artwork-excerpt.model.ts`. Если MinIO уже был запущен, повторите загрузку командой:

```bash
docker compose run --rm create-bucket
```

## Три GET-маршрута

- `/artwork-excerpts/feed/:id?next=true` — лента по ID и следующая карточка;
- `/artwork-excerpts/draft` — единственный черновик;
- `/artwork-excerpts?publicationYear=1866` — плитка и серверная фильтрация.

Для нижней навигации лента также открывается без ID: `/artwork-excerpts/feed`. Это тот же метод контроллера.

## Проверка

```bash
npm run build
npm test
npm run test:e2e
```
