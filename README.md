# Репозиторий backend по курсу «Разработка интернет-приложений»

## «Культурный след» — лабораторная работа № 1

Приложение на Node.js, NestJS, TypeScript и Handlebars. Данные хранятся в одном массиве без базы данных и клиентского JavaScript.

## Запуск

Требуется Node.js, npm и Docker Desktop.

```bash
npm install
docker compose up -d
npm run start:dev
```

Приложение: `http://localhost:3000/artwork-excerpts`

MinIO: `http://localhost:9001` (логин `root`, пароль `rootpassword`). Изображения и видео хранятся в публичном бакете `cultural-excerpts`;

## Три GET-маршрута

- `/artwork-excerpts/feed/:id?next=true` — лента по ID и следующая карточка;
- `/artwork-excerpts/draft` — единственный черновик;
- `/artwork-excerpts?publicationYear=1866` — плитка и серверная фильтрация.
