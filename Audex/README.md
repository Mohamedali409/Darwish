# Audex Backend

A modular backend service built with **Node.js, Express, TypeScript, MongoDB, Redis, and Docker**.

The project implements a **Modular Monolith architecture** with a focus on clean separation of responsibilities, caching, validation, error handling, testing, and containerized development.

---

## Tech Stack

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| Node.js        | JavaScript runtime          |
| Express.js     | REST API framework          |
| TypeScript     | Type-safe development       |
| MongoDB        | Primary database            |
| Mongoose       | MongoDB ODM                 |
| Redis          | Caching                     |
| Zod            | Request validation          |
| Vitest         | Unit testing                |
| Supertest      | API integration testing     |
| Docker         | Containerization            |
| Docker Compose | Local service orchestration |

---

## Architecture

Audex follows a **Modular Monolith** architecture.

```text
                    Client
                      │
                      ▼
                Express API
                      │
                      ▼
          ┌──────────────────────┐
          │  Reference Data      │
          │      Module          │
          ├──────────────────────┤
          │ Controller           │
          │ Service              │
          │ Repository           │
          │ Model                │
          │ Validation           │
          └──────────┬───────────┘
                     │
             ┌───────┴────────┐
             ▼                ▼
         MongoDB            Redis
         Database           Cache
```

### Module Responsibilities

- **Controller** — Handles HTTP requests and responses.
- **Service** — Contains business logic.
- **Repository** — Handles database operations.
- **Model** — Defines the MongoDB schema.
- **Validation** — Validates incoming request data.
- **Infrastructure** — Provides external infrastructure such as MongoDB and Redis.
- **Middleware** — Handles validation and centralized errors.

---

## Features

### Reference Data

- Get countries
- Update country
- Country validation
- MongoDB persistence
- Duplicate country-code protection

### Redis Caching

- Cache-aside strategy
- One-hour cache TTL
- Cache hit / miss handling
- Cache invalidation after updates

### Error Handling

- Centralized error middleware
- Validation errors
- Invalid MongoDB ObjectId handling
- Resource not found handling
- Duplicate key handling

### Testing

- Unit tests for business logic
- Redis cache behavior testing
- Cache invalidation testing
- Error scenario testing
- API integration testing

### Docker

- Dockerized Node.js application
- MongoDB container
- Redis container
- Docker Compose orchestration
- Multi-stage production Docker image

---

## API

### Health Check

```http
GET /health
```

Response:

```json
{
  "success": true,
  "message": "Audex API is running"
}
```

---

### Get Countries

```http
GET /api/reference-data/countries
```

Example response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Egypt",
      "code": "EG"
    }
  ]
}
```

---

### Update Country

```http
PUT /api/reference-data/countries/:id
```

Request body:

```json
{
  "name": "Egypt Updated"
}
```

or:

```json
{
  "code": "EG"
}
```

Both fields can also be updated together.

---

## Caching Strategy

The countries endpoint uses a **Cache-Aside** pattern.

### Read Flow

```text
GET /countries
      │
      ▼
    Redis
      │
 ┌────┴────┐
 │         │
 HIT      MISS
 │         │
 ▼         ▼
Response  MongoDB
            │
            ▼
          Redis
            │
            ▼
         Response
```

### Update Flow

```text
PUT /countries/:id
        │
        ▼
    MongoDB
      UPDATE
        │
        ▼
   Redis DELETE
        │
        ▼
  Cache Invalidated
```

The next request will fetch the updated data from MongoDB and populate Redis again.

**Cache TTL:** `1 hour`

---

## Project Structure

```text
Audex/
│
├── src/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── mongodb.ts
│   │   │
│   │   └── redis/
│   │       ├── redis.ts
│   │       └── redis-cache.service.ts
│   │
│   ├── middlewares/
│   │   ├── app-error.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   │
│   ├── modules/
│   │   └── reference-data/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── repositories/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── validation/
│   │       └── reference-data.module.ts
│   │
│   ├── seeds/
│   │   └── country.seed.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── setup.ts
│   ├── app.test.ts
│   └── reference-data.service.test.ts
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

MONGODB_URI=mongodb://localhost:27017/audex

REDIS_URL=redis://localhost:6379
```

> `.env` is excluded from Git. Use `.env.example` as a reference.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB and Redis

Using Docker Compose:

```bash
docker compose up -d mongodb redis
```

### 3. Seed Countries

```bash
npm run seed:countries
```

### 4. Start the Application

Development mode:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## Running with Docker

Build and start all services:

```bash
docker compose up -d --build
```

Check service status:

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs app
```

Stop all services:

```bash
docker compose down
```

### Docker Services

| Service   |    Port | Description      |
| --------- | ------: | ---------------- |
| `app`     |  `3000` | Audex API        |
| `mongodb` | `27017` | MongoDB database |
| `redis`   |  `6379` | Redis cache      |

---

## Testing

Run the test suite:

```bash
npm test
```

Current tests cover:

- Cache miss behavior
- Cache hit behavior
- Cache invalidation
- Invalid country ID
- Country not found
- API health endpoint

Expected result:

```text
Test Files  2 passed
Tests       6 passed
```

---

## Build

Compile TypeScript:

```bash
npm run build
```

Run the production build:

```bash
npm start
```

---

## Available Scripts

| Command                  | Description              |
| ------------------------ | ------------------------ |
| `npm run dev`            | Start development server |
| `npm run build`          | Build TypeScript project |
| `npm start`              | Run production build     |
| `npm run seed:countries` | Seed country data        |
| `npm test`               | Run tests                |
| `npm run test:watch`     | Run tests in watch mode  |

---

## API Validation & Error Responses

### Invalid Country ID

```json
{
  "success": false,
  "message": "Invalid country ID"
}
```

### Country Not Found

```json
{
  "success": false,
  "message": "Country not found"
}
```

### Duplicate Country Code

```json
{
  "success": false,
  "message": "Country code already exists"
}
```

### Invalid Request

```json
{
  "success": false,
  "message": "At least one field is required"
}
```

---

## Development Principles

The project follows several backend development principles:

- Modular Monolith architecture
- Separation of concerns
- Service/Repository pattern
- Centralized error handling
- Request validation
- Cache-aside caching
- Cache invalidation
- Environment-based configuration
- Automated testing
- Dockerized development and deployment

---

## Status

**Project Status:** Completed

The current implementation includes:

- REST API
- MongoDB integration
- Redis caching
- Cache invalidation
- Validation
- Error handling
- Unit tests
- Integration tests
- Docker support
- Docker Compose orchestration
