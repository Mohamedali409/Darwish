# Audex Backend

A modular backend service built with **Node.js, Express, TypeScript, MongoDB, Redis, and Docker**.

The project follows a **Modular Monolith architecture** with a focus on clean separation of responsibilities, request validation, centralized error handling, caching, API security, automated testing, and containerized development.

---

## Tech Stack

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| Node.js            | JavaScript runtime           |
| Express.js         | REST API framework           |
| TypeScript         | Type-safe development        |
| MongoDB            | Primary database             |
| Mongoose           | MongoDB ODM                  |
| Redis              | Caching                      |
| Zod                | Request validation           |
| express-rate-limit | API rate limiting            |
| Vitest             | Unit and integration testing |
| Supertest          | HTTP API testing             |
| Docker             | Containerization             |
| Docker Compose     | Local service orchestration  |

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
              ┌───────────────────────┐
              │   Reference Data      │
              │       Module          │
              ├───────────────────────┤
              │ Controller            │
              │ Service               │
              │ Repository            │
              │ Model                 │
              │ Validation            │
              └───────────┬───────────┘
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
              MongoDB            Redis
              Database            Cache
```

### Module Responsibilities

- **Controller** — Handles HTTP requests and responses.
- **Service** — Contains business logic.
- **Repository** — Handles database operations.
- **Model** — Defines MongoDB schemas.
- **Validation** — Validates incoming request data.
- **Infrastructure** — Provides external infrastructure such as MongoDB and Redis.
- **Middleware** — Handles validation, rate limiting, and centralized error handling.

---

## Features

### Reference Data

- Get countries
- Update countries
- Country validation
- MongoDB persistence
- Duplicate country-code protection

### Redis Caching

- Cache-aside strategy
- One-hour cache TTL
- Cache hit / miss handling
- Cache invalidation after updates

### API Security

- Configurable rate limiting
- Protected reference-data endpoint
- HTTP `429 Too Many Requests` response
- Standard rate-limit headers
- Clear client-facing throttling message

### Error Handling

- Centralized error middleware
- Request validation errors
- Invalid MongoDB ObjectId handling
- Resource not found handling
- Duplicate key handling

### Testing

- Unit tests for business logic
- Cache hit / miss testing
- Cache invalidation testing
- Validation and error scenario testing
- API health testing
- Rate limiting testing
- Allowed vs throttled request testing

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

## API Security — Rate Limiting

The countries endpoint is protected with configurable rate limiting.

### Configuration

```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

Default configuration:

- **10 requests**
- **60-second window**
- Limit is applied per client

### Protected Endpoint

```http
GET /api/reference-data/countries
```

### Rate Limit Flow

```text
Client
   │
   ▼
Rate Limiter
   │
   ├── Within limit ──────► Reference Data API
   │
   └── Limit exceeded ────► HTTP 429
```

### Rate Limit Exceeded

When the client exceeds the configured limit, the API returns:

```http
HTTP 429 Too Many Requests
```

Response:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

The API also returns standard rate-limit headers that allow clients to understand the configured limit and current request state.

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

The next request fetches the updated data from MongoDB and stores it in Redis again.

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
│   │   ├── rate-limit.middleware.ts
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
│   ├── rate-limit.test.ts
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

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
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

Run the complete test suite:

```bash
npm test
```

The current test suite covers:

- Cache miss behavior
- Cache hit behavior
- Cache invalidation
- Invalid country ID
- Country not found
- API health endpoint
- Rate limiting
- Allowed requests
- Throttled requests with HTTP `429`

Current result:

```text
Test Files  3 passed (3)
Tests       7 passed (7)
```

---

## Build

Compile the TypeScript project:

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

### Rate Limit Exceeded

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

HTTP status:

```text
429 Too Many Requests
```

---

## Development Principles

The project follows several backend development principles:

- Modular Monolith architecture
- Separation of concerns
- Service / Repository pattern
- Centralized error handling
- Request validation
- Cache-aside caching
- Cache invalidation
- Configurable API rate limiting
- Environment-based configuration
- Automated testing
- Dockerized development and deployment

---

## Status

**Project Status: Completed**

Current implementation includes:

- REST API
- MongoDB integration
- Redis caching
- Cache invalidation
- Request validation
- Centralized error handling
- API rate limiting
- Unit tests
- Integration tests
- Docker support
- Docker Compose orchestration
