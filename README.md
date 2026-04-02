# Customer Dashboard (Frontend + Backend + PostgreSQL)

Complete production-ready starter for a **Customer Dashboard** integrated with a **Developer Dashboard** data flow.

## Folder Structure

- `frontend/` → React + Vite customer dashboard UI
- `backend/` → Express API + authentication + request management
- `backend/prisma/` → PostgreSQL schema + seed data

---

## Tech Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- DB: PostgreSQL + Prisma ORM
- Auth: JWT (Bearer token)

---

## API Documentation

Base URL: `http://localhost:4000`

### `POST /register`
Create a customer account.

**Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response 201**
```json
{
  "message": "Registered successfully.",
  "token": "<jwt>",
  "user": {
    "id": "ck...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER"
  }
}
```

### `POST /login`
Login customer/developer.

### `POST /request`
Submit issue/task (auth required).

### `GET /requests`
Get current customer's requests (auth required).

### `PUT /request/:id`
Update own request status (auth required).

Body example:
```json
{
  "status": "IN_PROGRESS"
}
```

### `GET /profile`
Get customer profile with request count.

### Developer Integration Endpoints

These are used by the Developer Dashboard to consume all customer data and update statuses globally:

- `GET /developer/requests` (developer auth required)
- `PUT /developer/request/:id/status` (developer auth required)

This ensures status updates are reflected in both dashboards.

---

## Database Schema

### User
- `id`
- `name`
- `email` (unique)
- `password` (hashed)
- `role` (`CUSTOMER` | `DEVELOPER`)
- `createdAt`

### Request
- `id`
- `userId`
- `title`
- `description`
- `status` (`PENDING` | `IN_PROGRESS` | `COMPLETED`)
- `createdAt`
- `updatedAt`

---

## Sample Data

Seed script generates:
- 8 customer users
- 1 developer user
- 24 realistic requests

Default credentials after seed:
- Customer password: `customer123`
- Developer email/password: `developer.dashboard@example.com` / `dev12345`

---

## Setup & Run (End-to-End)

### 1) Start PostgreSQL
```bash
docker compose up -d
```

### 2) Setup backend
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```
Backend runs on `http://localhost:4000`

### 3) Setup frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## Full Flow Demonstration

1. Customer logs in on frontend.
2. Customer submits request using `POST /request`.
3. Developer Dashboard fetches all requests via `GET /developer/requests`.
4. Developer updates status via `PUT /developer/request/:id/status`.
5. Customer refreshes dashboard and sees updated status via `GET /requests`.

---

## Example API Response (Developer Dashboard fetch)

`GET /developer/requests`
```json
{
  "requests": [
    {
      "id": "clx...",
      "userId": "clu...",
      "title": "Payment failure on checkout",
      "description": "I attempted checkout with Visa and Mastercard...",
      "status": "IN_PROGRESS",
      "createdAt": "2026-03-30T10:10:10.000Z",
      "updatedAt": "2026-03-30T12:10:10.000Z",
      "user": {
        "id": "clu...",
        "name": "Aarav Patel",
        "email": "aarav.patel@example.com"
      }
    }
  ]
}
```

---

## Production Readiness Notes

- Input validation with `zod`
- Proper HTTP status codes + error messages
- Password hashing with `bcryptjs`
- JWT authentication middleware
- Clean modular folders for scalability
- Responsive UI with loading & error states
