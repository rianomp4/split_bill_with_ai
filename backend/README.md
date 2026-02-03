# split-bill-backend

Skeleton Node.js + Express (TypeScript) backend for `split_bill_with_ai` project.

Quick start (local):

1. Copy `.env.example` to `.env` and adjust variables.
2. Start database and MinIO (with root compose or use `docker compose up -d db minio` in repo root).
3. Install deps and generate prisma client:
   - `cd backend`
   - `npm ci`
   - `npx prisma generate`
4. Run migrations (dev): `npm run migrate:dev`
5. Start dev server: `npm run dev`

API endpoints (minimal):
- POST `/api/transactions` → create transaction draft
- GET `/api/transactions/:id` → get transaction
- POST `/api/payments/:id/evidence` → get presigned PUT URL (requires auth)
- GET `/api/health` → health check
- POST `/api/auth/register` → register new user (username, password, name, npp, phone)
- POST `/api/auth/login` → login (username + password) => returns `access_token` (JWT)
- GET `/api/auth/me` → current user (requires Bearer token)
- GET `/api/users/:id` → get user profile (requires auth, only self)

This is a starting point; add role-based access control, validation, tests, and worker processes as needed.

---

Auth & DB notes:
- After updating `prisma/schema.prisma`, run:
  - `npx prisma generate`
  - `npx prisma migrate dev --name add_user_auth`
- Set `JWT_SECRET` in env for production; use a secure value.
- Password hashes use `bcryptjs` (salt rounds = 10).
