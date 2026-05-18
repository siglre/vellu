# Vellu — Мягкие игрушки и подарки

Vellu — интернет-магазин мягких игрушек и подарков с полноценным фронтендом на Vue 3 и REST API на Node.js/Express. Поддерживаются корзина, избранное, заказы и административная панель.

## Стек технологий

| Часть | Технологии |
|-------|-----------|
| Frontend | Vue 3, Vite, Pinia, Vue Router |
| Backend | Node.js, Express, PostgreSQL, JWT |

## Структура проекта

```
vellu/
├── frontend/          ← Vue 3 + Vite SPA
│   ├── src/
│   │   ├── api/       ← Axios-клиент и API-методы
│   │   ├── components/← Переиспользуемые компоненты
│   │   ├── stores/    ← Pinia-сторы (auth, cart, ui)
│   │   ├── views/     ← Страницы приложения
│   │   └── router/    ← Vue Router
│   └── public/        ← Статические файлы (изображения товаров)
└── backend/           ← Express REST API
    └── src/
        ├── routes/    ← Маршруты API
        ├── middleware/← Auth, errorHandler
        └── db/        ← Пул соединений, миграции, сиды
```

## Быстрый старт

**Требования:** Node.js 18+, PostgreSQL

```bash
# 1. Бэкенд
cd backend
npm install
cp .env.example .env      # заполнить DB_* и JWT_SECRET
npm run db:migrate
npm run db:seed
npm run dev               # http://localhost:4000

# 2. Фронтенд (в другом терминале)
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:4000
npm run dev               # http://localhost:5173
```

## Демо-аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@vellu.ru | admin123 |
| Пользователь | user@vellu.ru | 123456 |

## Страницы

| URL | Описание | Авторизация |
|-----|----------|-------------|
| `/` | Главная — герой, категории, хиты, новинки | — |
| `/catalog` | Каталог с фильтрами и сортировкой | — |
| `/product/:id` | Карточка товара | — |
| `/cart` | Корзина | Требуется |
| `/wishlist` | Избранное | Требуется |
| `/orders` | История заказов | Требуется |
| `/account` | Профиль пользователя | Требуется |
| `/admin` | Панель администратора | Только admin |

## API эндпоинты

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/api/auth/register` | Регистрация | — |
| POST | `/api/auth/login` | Вход | — |
| GET | `/api/auth/me` | Текущий пользователь | JWT |
| PATCH | `/api/auth/me` | Обновить профиль | JWT |
| GET | `/api/products` | Список товаров (фильтры) | — |
| GET | `/api/products/:id` | Один товар | — |
| POST | `/api/products` | Создать товар | Admin |
| PATCH | `/api/products/:id` | Обновить товар | Admin |
| DELETE | `/api/products/:id` | Удалить товар | Admin |
| GET | `/api/categories` | Список категорий | — |
| POST | `/api/categories` | Создать категорию | Admin |
| GET | `/api/cart` | Корзина пользователя | JWT |
| POST | `/api/cart` | Добавить товар | JWT |
| PATCH | `/api/cart/:itemId` | Изменить количество | JWT |
| DELETE | `/api/cart/:itemId` | Удалить из корзины | JWT |
| DELETE | `/api/cart` | Очистить корзину | JWT |
| GET | `/api/orders` | Заказы пользователя | JWT |
| POST | `/api/orders` | Оформить заказ | JWT |
| GET | `/api/orders/admin/all` | Все заказы | Admin |
| PATCH | `/api/orders/admin/:id/status` | Статус заказа | Admin |
| GET | `/api/wishlist` | Избранное | JWT |
| POST | `/api/wishlist/:id` | Добавить в избранное | JWT |
| DELETE | `/api/wishlist/:id` | Убрать из избранного | JWT |
| GET | `/api/admin/stats` | Статистика | Admin |
| POST | `/api/upload` | Загрузить изображение | Admin |
| GET | `/api/health` | Проверка работы API | — |

## Деплой

### БД — Neon.tech (бесплатный PostgreSQL)
1. Создать проект на [neon.tech](https://neon.tech)
2. Скопировать строку подключения
3. Запустить миграции: `npm run db:migrate`

### Бэкенд — Render.com
1. New → Web Service → подключить репозиторий
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Переменные окружения:

| Переменная | Значение |
|-----------|---------|
| `DATABASE_URL` | строка подключения Neon |
| `JWT_SECRET` | случайная строка 32+ символа |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | URL фронтенда на Vercel |

### Фронтенд — Vercel
1. Import Git Repository → выбрать репозиторий
2. Root directory: `frontend`
3. Framework: Vite (определится автоматически)
4. Переменные окружения:

| Переменная | Значение |
|-----------|---------|
| `VITE_API_URL` | URL бэкенда на Render |
