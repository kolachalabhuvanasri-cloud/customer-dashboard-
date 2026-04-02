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

### `GET /health`
Health check used by frontend preflight connectivity checks.

**Response 200**
```json
{
  "status": "ok",
  "service": "customer-dashboard-backend"
}
```

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

**Response 409 (duplicate email)**
```json
{
  "message": "Email already registered."
}
```

### `POST /login`
Login customer/developer.

**Body**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response 200**
```json
{
  "message": "Login successful.",
  "token": "<jwt>",
  "user": {
    "id": "ck...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER"
  }
}
```

**Response 401 (invalid credentials)**
```json
{
  "message": "Invalid credentials."
}
```

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

## Environment Configuration

### Backend (`backend/.env`)
Copy from example:

```bash
cp backend/.env.example backend/.env
```

Variables:
- `PORT` (default `4000`)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (required in non-test environments)
- `FRONTEND_ORIGIN` (default expected origin: `http://localhost:5173`)

### Frontend (`frontend/.env`)
Optional API override:

```bash
VITE_API_URL=http://localhost:4000
```

If `VITE_API_URL` is not set, frontend falls back to `http://localhost:4000` automatically.

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

## Auth Verification Steps

1. Open `http://localhost:5173`.
2. Register a new account (name, email, password).
3. Confirm you are logged in immediately after register (token persisted in browser storage).
4. Log out and log back in with same email/password.
5. Try wrong password and confirm `Invalid email or password.` is shown.
6. Try registering the same email and confirm duplicate-email message is shown.
7. Stop backend and retry login/register; frontend should show:
   - `Backend unreachable. Is API running on http://localhost:4000?`

---

## Automated Checks

Run backend auth tests:

```bash
cd backend
npm test
```

Tests cover:
- register happy path
- register duplicate email conflict
- login happy path
- login invalid credentials

---

## Auth Troubleshooting

### Symptom: `Failed to fetch` in browser
- Verify backend is running on `http://localhost:4000`.
- Verify `GET /health` returns 200:
  ```bash
  curl http://localhost:4000/health
  ```
- If using a custom API URL, ensure `frontend/.env` has a correct `VITE_API_URL` and restart Vite.

### Symptom: CORS errors in console
- Ensure backend `FRONTEND_ORIGIN` includes your frontend URL.
- Default allowed dev origins include:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

### Symptom: Duplicate email registration fails
- Expected behavior with HTTP 409 and message `Email already registered.`.

### Symptom: Login always fails
- Ensure password meets expected value for that user.
- Re-seed local DB if needed:
  ```bash
  cd backend
  npm run seed
  ```

---

## Production Readiness Notes

- Input validation with `zod`
- Proper HTTP status codes + error messages
- Password hashing with `bcryptjs`
- JWT authentication middleware
- CORS allowlist for trusted frontend origins
- API health preflight check from frontend
- Clean modular folders for scalability
- Responsive UI with loading & error states
