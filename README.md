# Репозиторий backend по курсу «Разработка интернет-приложений»

## «Культурный след» — лабораторная работа № 1

Приложение на Node.js, NestJS, TypeScript и Handlebars. Данные хранятся в одном массиве без базы данных и клиентского JavaScript.

## Запуск

Требуется Node.js 18 LTS, npm и Docker Desktop.

```bash
npm install
docker compose up -d
npm run start:dev
```

Приложение: `http://localhost:3000/artwork-excerpts`

MinIO: `http://localhost:9001` (логин `root`, пароль `rootpassword`). Изображения и видео хранятся в публичном бакете `cultural-excerpts`; в модели указаны только их объектные ключи.

## Три GET-маршрута

- `/artwork-excerpts/feed/:id?next=true` — лента по ID и следующая карточка;
- `/artwork-excerpts/draft` — единственный черновик;
- `/artwork-excerpts?publicationYear=1866` — плитка и серверная фильтрация.

Для нижней навигации лента также открывается без ID: `/artwork-excerpts/feed`. Это тот же метод контроллера.

## Материалы для защиты

- `design` — три SVG-макета для импорта в один файл Figma;
- `documentation/uml/cultural-influence.mdj` — единый проект StarUML;
- `documentation/technical-specification-module-1.docx` — ТЗ первого модуля;
- `documentation/control-questions-lab1.docx` — письменные ответы;
- `documentation/lecture-01-web-mvc.docx` — конспект первой лекции;

Локальный Git-репозиторий находится в ветке `ssr_imMemory`, как в методических указаниях для лабораторной № 1. Для отправки на GitHub достаточно создать пустой удалённый репозиторий, добавить его как `origin` и выполнить `git push -u origin ssr_imMemory`.
