# SANAD Backend

A modular backend service built with **Node.js, Express, TypeScript, MongoDB, and Docker**.

The project follows a **Modular Monolith architecture** with a focus on clean separation of responsibilities, database optimization, transactional workflows, automated testing, and maintainable backend development.

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
| Supertest      | HTTP API testing             |
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
              │ Models                │
              └───────────┬───────────┘
                          │
                          ▼
                       MongoDB
```

### Module Responsibilities

- **Controller** — Handles HTTP requests and responses.
- **Service** — Contains business logic and transactional workflows.
- **Repository** — Handles database queries.
- **Model** — Defines MongoDB schemas and relationships.

---

## Features

### Appointment Management

- Retrieve appointments for a specific provider
- Filter appointments by date range
- Filter appointments by status
- Sort appointments by appointment date
- Book appointments through a transactional workflow
- Create appointment audit records

### Database Optimization

- Compound MongoDB index for appointment queries
- Query analysis using MongoDB `EXPLAIN`
- Verification of index usage through execution statistics
- Reduced documents examined during appointment queries

### Transactional Workflow

- MongoDB transaction support using Mongoose
- Atomic appointment and audit creation
- Automatic rollback on persistence failure
- Validation before transactional database operations
- Commit and rollback test coverage

### Testing

- Appointment query optimization test
- Compound index usage verification
- Transaction commit test
- Transaction rollback test
- Validation test

### Docker

- MongoDB container
- MongoDB Replica Set configuration
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

This meant MongoDB had to scan the complete appointments collection and sort the matching results.

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
IXSCAN → FETCH

334 documents examined
334 index keys examined
334 results
```

The query now uses the compound index and examines only the matching documents instead of scanning the entire collection.

The measured execution time decreased from **45 ms to 27 ms** in the local test environment. Execution time can vary depending on system load and database cache state, so the reduction in documents examined is the primary optimization evidence.

---

## Transactional Service Workflow

The appointment booking workflow uses a MongoDB transaction to keep related database operations atomic.

### Workflow

When an appointment is booked, the service performs the following operations inside the same transaction:

```text
Start Transaction
      │
      ▼
Validate Appointment Date
      │
      ▼
Verify Provider
      │
      ▼
Create Appointment
      │
      ▼
Create Appointment Audit
      │
   ┌──┴──────┐
   │         │
Success    Failure
   │         │
   ▼         ▼
COMMIT    ROLLBACK
```

The appointment and its audit record are committed together.

If any persistence operation fails, the transaction is rolled back and previously written records are reverted.

### Validation

Appointment validation is performed before starting the transactional workflow.

The service rejects appointments with a date in the past.

### Transaction Guarantees

The workflow ensures:

- Appointment and audit are committed atomically.
- Persistence failures trigger rollback.
- Partial writes are not left in the database.
- Validation happens before transactional database operations.

---

## Transaction Testing

The transactional workflow is covered by automated tests.

The tests verify:

```text
✓ Appointment and audit are committed together
✓ Appointment is rolled back when audit persistence fails
✓ Invalid appointment dates are rejected
```

Current result:

```text
Test Files  2 passed (2)
Tests       4 passed (4)
```

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
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── appointment.model.ts
│   │   │   │   └── appointment-audit.model.ts
│   │   │   │
│   │   │   ├── repositories/
│   │   │   │   └── appointment.repository.ts
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   └── appointment.routes.ts
│   │   │   │
│   │   │   └── services/
│   │   │       ├── appointment.service.ts
│   │   │       └── appointment-booking.service.ts
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
│   ├── appointment.query.test.ts
│   └── appointment.transaction.test.ts
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
MONGODB_URI=mongodb://localhost:27017/sanad?replicaSet=rs0&directConnection=true
```

> The MongoDB Replica Set is required for transaction support in the local development environment.

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

### 3. Initialize the Replica Set

After MongoDB starts for the first time:

```bash
docker exec sanad-mongodb mongosh --eval "rs.initiate()"
```

If the Replica Set is already initialized, this step can be skipped.

Check the Replica Set state:

```bash
docker exec sanad-mongodb mongosh --quiet --eval "rs.status().members.map(m => ({name:m.name,stateStr:m.stateStr}))"
```

The node should report:

```text
PRIMARY
```

### 4. Seed Sample Data

```bash
npm run seed
```

### 5. Create the Appointment Index

```bash
npm run indexes
```

### 6. Analyze the Query

```bash
npm run explain
```

### 7. Start the API

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

| Service   |    Port | Description         |
| --------- | ------: | ------------------- |
| `mongodb` | `27017` | MongoDB Replica Set |

---

## Testing

Run the complete test suite:

```bash
npm test
```

Current test coverage includes:

- Appointment query execution
- Compound index usage
- Query plan verification
- Reduced documents examined
- Transaction commit
- Transaction rollback
- Appointment validation

Current result:

```text
Test Files  2 passed (2)
Tests       4 passed (4)
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
- Atomic transactional workflows
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
- Appointment booking transaction
- Appointment audit records
- Compound database index
- Query optimization
- MongoDB `EXPLAIN` analysis
- Transaction commit and rollback handling
- Automated tests
- Docker support
- MongoDB Replica Set configuration
