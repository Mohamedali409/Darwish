# SANAD Backend

A modular backend service built with **Node.js, Express, TypeScript, MongoDB, and Docker**.

The project follows a **Modular Monolith architecture** with a focus on clean separation of responsibilities, database optimization, automated testing, and maintainable backend development.

---

## Tech Stack

| Technology     | Purpose                      |
| -------------- | ---------------------------- |
| Node.js        | JavaScript runtime           |
| Express.js     | REST API framework           |
| TypeScript     | Type-safe development        |
| MongoDB        | Primary database             |
| Mongoose       | MongoDB ODM                  |
| Vitest         | Testing framework            |
| Docker         | Containerization             |
| Docker Compose | Local database orchestration |

---

## Architecture

SANAD follows a **Modular Monolith** architecture.

```text
                         Client
                           │
                           ▼
                     Express API
                           │
                           ▼
              ┌───────────────────────┐
              │     Appointments      │
              │        Module         │
              ├───────────────────────┤
              │ Controller            │
              │ Service               │
              │ Repository            │
              │ Model                 │
              └───────────┬───────────┘
                          │
                          ▼
                       MongoDB
```

### Module Responsibilities

- **Controller** — Handles HTTP requests and responses.
- **Service** — Contains business logic.
- **Repository** — Handles database queries.
- **Model** — Defines MongoDB schemas.

---

## Features

### Appointment Management

- Retrieve appointments for a specific provider
- Filter appointments by date range
- Filter appointments by status
- Sort appointments by appointment date

### Database Optimization

- Compound MongoDB index for appointment queries
- Query analysis using MongoDB `EXPLAIN`
- Verification of index usage through execution statistics
- Reduced documents examined during appointment queries

### Testing

- Appointment query optimization test
- Compound index usage verification

### Docker

- MongoDB container
- Docker Compose setup for local development

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
  "message": "SANAD API is running"
}
```

---

### Get Provider Appointments

```http
GET /api/appointments/providers/:providerId/appointments
```

Query parameters:

```text
startDate
endDate
```

Example:

```http
GET /api/appointments/providers/6ac2b30452d5167758f7f367/appointments?startDate=2026-10-04&endDate=2026-11-03
```

The endpoint retrieves scheduled appointments for the requested provider within the specified date range.

---

## Database Optimization

### Appointment Query

The main appointment query filters records by:

```text
providerId
status
appointmentDate
```

and sorts the results by:

```text
appointmentDate ASC
```

Query pattern:

```text
providerId
+
status
+
appointmentDate range
+
sort by appointmentDate
```

---

## Problem Before Optimization

Before adding an index, MongoDB used a full collection scan:

```text
COLLSCAN
```

The query returned:

```text
334 documents
```

but examined:

```text
10,000 documents
```

Execution statistics:

```text
nReturned: 334
totalDocsExamined: 10000
totalKeysExamined: 0
executionTimeMillis: 45
```

This meant MongoDB had to scan the complete appointments collection and then sort the matching results.

---

## Index Added

A compound index was added:

```text
{
  providerId: 1,
  status: 1,
  appointmentDate: 1
}
```

Index name:

```text
providerId_1_status_1_appointmentDate_1
```

The index is created using:

```bash
npm run indexes
```

Implementation:

```ts
await AppointmentModel.collection.createIndex({
  providerId: 1,
  status: 1,
  appointmentDate: 1,
});
```

---

## EXPLAIN Evidence

The query plan was verified before and after adding the index.

### Before Index

```text
Winning Plan:
COLLSCAN + SORT

nReturned: 334
totalDocsExamined: 10000
totalKeysExamined: 0
executionTimeMillis: 45
```

### After Index

```text
Winning Plan:
IXSCAN → FETCH

nReturned: 334
totalDocsExamined: 334
totalKeysExamined: 334
executionTimeMillis: 27
```

### Optimization Result

```text
Before
─────────────────────────────
COLLSCAN
10,000 documents examined
0 index keys examined
334 results

            │
            ▼
     Compound Index
            │
            ▼

After
─────────────────────────────
IXSCAN
334 documents examined
334 index keys examined
334 results
```

The query now uses the compound index and examines only the matching documents instead of scanning the entire collection.

The measured execution time also decreased from **45 ms to 27 ms** in the local test environment. Execution time can vary depending on system load and database cache state, so the reduction in documents examined is the primary optimization evidence.

---

## Optimization Scripts

### Seed Database

Creates sample providers and **10,000 appointments** for realistic query analysis.

```bash
npm run seed
```

### Create Indexes

Creates the appointment compound index.

```bash
npm run indexes
```

### Explain Query

Runs the appointment query using MongoDB `executionStats`.

```bash
npm run explain
```

---

## Project Structure

```text
SANAD/
│
├── src/
│   ├── config/
│   │   └── env.ts
│   │
│   ├── infrastructure/
│   │   └── database/
│   │       └── mongodb.ts
│   │
│   ├── middlewares/
│   │   └── error.middleware.ts
│   │
│   ├── modules/
│   │   ├── appointments/
│   │   │   ├── controllers/
│   │   │   │   └── appointment.controller.ts
│   │   │   ├── models/
│   │   │   │   └── appointment.model.ts
│   │   │   ├── repositories/
│   │   │   │   └── appointment.repository.ts
│   │   │   ├── routes/
│   │   │   │   └── appointment.routes.ts
│   │   │   └── services/
│   │   │       └── appointment.service.ts
│   │   │
│   │   └── providers/
│   │       └── models/
│   │           └── provider.model.ts
│   │
│   ├── scripts/
│   │   ├── seed.ts
│   │   ├── create-indexes.ts
│   │   └── explain-appointments.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   └── appointment.query.test.ts
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sanad
```

> `.env` is excluded from Git. Use `.env.example` as a reference.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

Using Docker Compose:

```bash
docker compose up -d
```

### 3. Seed Sample Data

```bash
npm run seed
```

### 4. Create the Appointment Index

```bash
npm run indexes
```

### 5. Analyze the Query

```bash
npm run explain
```

### 6. Start the API

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

Start MongoDB:

```bash
docker compose up -d
```

Check service status:

```bash
docker compose ps
```

Stop the service:

```bash
docker compose down
```

### Docker Service

| Service   |    Port | Description      |
| --------- | ------: | ---------------- |
| `mongodb` | `27017` | MongoDB database |

---

## Testing

Run the test suite:

```bash
npm test
```

Current test coverage includes:

- Appointment query execution
- Compound index usage
- Query plan verification
- Reduced documents examined

Current result:

```text
Test Files  1 passed (1)
Tests       1 passed (1)
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

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server                 |
| `npm run build`      | Build TypeScript project                 |
| `npm start`          | Run production build                     |
| `npm run seed`       | Seed providers and appointments          |
| `npm run indexes`    | Create appointment indexes               |
| `npm run explain`    | Analyze appointment query execution plan |
| `npm test`           | Run tests                                |
| `npm run test:watch` | Run tests in watch mode                  |

---

## Development Principles

The project follows several backend development principles:

- Modular Monolith architecture
- Separation of concerns
- Service / Repository pattern
- Database query optimization
- Proper MongoDB indexing
- Evidence-based performance analysis
- Automated testing
- Environment-based configuration
- Dockerized local development

---

## Status

**Project Status: Completed**

Current implementation includes:

- REST API
- MongoDB integration
- Appointment module
- Provider model
- Appointment repository and service
- Compound database index
- Query optimization
- MongoDB `EXPLAIN` analysis
- Automated test
- Docker support
