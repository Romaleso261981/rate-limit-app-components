# Rate-Limited Client-Server Application (Component-Based)

Цей проект демонструє клієнт-серверний додаток з обмеженням швидкості запитів та контролем конкурентності, побудований з використанням функціональних React компонентів.

## Особливості

- **Client**: React + TypeScript frontend з конфігурованою конкурентністю та rate limiting
  - Модульна архітектура з окремими компонентами
  - Custom хук `useRequestHandler` для управління станом
  - Окремі утиліти для RateLimiter та ConcurrencyLimiter
- **Server**: Express + TypeScript backend з Redis-based rate limiting
- **Infrastructure**: Docker Compose з Node.js та Redis контейнерами

## Структура проекту

```
rate-limit-app-components/
├── client/
│   ├── src/
│   │   ├── components/          # Функціональні компоненти
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── StatsPanel.tsx
│   │   │   └── ResultsList.tsx
│   │   ├── hooks/               # Custom hooks
│   │   │   └── useRequestHandler.ts
│   │   ├── services/            # API сервіси
│   │   │   └── api.ts
│   │   ├── types/               # TypeScript типи
│   │   │   └── index.ts
│   │   ├── utils/               # Утиліти
│   │   │   └── limiters.ts
│   │   ├── App.tsx              # Головний компонент
│   │   ├── main.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── Dockerfile
│   └── package.json
├── server/
│   ├── src/
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── Makefile
└── README.md
```

## Вимоги

- Docker
- Docker Compose (або Docker з вбудованим compose)
- Make (GNU Make)

## Швидкий старт

### Збудувати та запустити

```bash
make up
```

Це зробить:
- Збудує всі Docker образи
- Запустить Redis, Server та Client контейнери
- Зробить додаток доступним за адресами:
  - Client: http://localhost:3000
  - Server: http://localhost:3001

### Зупинити

```bash
make down
```

### Повне очищення

```bash
make clean
```

Видаляє всі контейнери, volumes та images.

### Переглянути логи

```bash
make logs
```

## Як це працює

### Client

1. Введіть значення конкурентності (1-100) - це контролює:
   - Максимальну кількість одночасних запитів
   - Ліміт запитів за секунду
2. Натисніть "Start" щоб надіслати 1000 запитів на сервер
3. Переглядайте результати в реальному часі

### Компоненти

- **ControlPanel**: Управління параметрами та запуском
- **StatsPanel**: Відображення прогресу та статистики
- **ResultsList**: Список результатів запитів
- **useRequestHandler**: Хук для управління логікою запитів

### Server

- Обробляє запити до `/api` endpoint
- Випадкова затримка: 1-1000ms на запит
- Повертає 429 (Too Many Requests) при отриманні >50 запитів/секунду
- Використовує Redis для відстеження rate limiting

## Технологічний стек

- **Мова**: TypeScript
- **Frontend**: React (функціональні компоненти + hooks)
- **Backend**: Express
- **Storage**: Redis
- **Container Orchestration**: Docker Compose
- **Build Tool**: Makefile

## Архітектурні переваги

- 🎯 **Модульність**: Кожен компонент має єдину відповідальність
- 🔄 **Переisіспользуваність**: Компоненти та хуки можна легко використовувати повторно
- 🧪 **Тестованість**: Окремі компоненти легше тестувати
- 📦 **Масштабованість**: Легко додавати нові функції
- 🛠️ **Підтримка**: Чистий код, легкий у читанні та модифікації


