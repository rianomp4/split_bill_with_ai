# Deployment Guide — split_bill_with_ai 🔧

Dokumen ini menjelaskan langkah‑per‑langkah teknikal untuk menyiapkan dan mendeploy project **split_bill_with_ai** secara containerized (local → production). Fokus: PostgreSQL, MinIO (S3 compatible), Backend (Node.js + Express, TypeScript), Frontend (Next.js, TypeScript), Docker Compose, dan opsi Kubernetes + CI/CD.

---

## Prasyarat ✅
- macOS dengan Docker & Docker Compose terinstal
- (Opsional) kubectl & Helm jika ingin deploy ke Kubernetes
- Registry Docker (Docker Hub / GHCR / private)
- Akses terminal & editor

---

## 1) Struktur dan environment
- Buat file `.env` (tidak di-commit) berisi variabel:
  - DATABASE_URL=postgresql://split:secret@db:5432/splitbill
  - MINIO_ENDPOINT=minio:9000
  - MINIO_ACCESS_KEY=minioadmin
  - MINIO_SECRET_KEY=minioadmin
  - SECRET_KEY=<random_jwt_or_secret>
  - NEXT_PUBLIC_API_URL=http://localhost:8000
  - NODE_ENV=development

> Simpan secrets di Secret Manager untuk production (AWS Secrets Manager, Vault, k8s Secrets).

---

## 2) Database — PostgreSQL (container) 🐘
- Docker Compose service (contoh):

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: split
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: splitbill
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
volumes:
  db_data:
```

- Perintah:
  - `docker compose up -d db`
  - Cek logs: `docker compose logs -f db`
- Migrasi (Prisma / TypeORM contoh): `docker compose exec backend npx prisma migrate deploy` (atau `docker compose exec backend npm run typeorm:migrate` sesuai tool yang dipilih)
- Backup: `docker exec -t <db> pg_dumpall -c -U split > dump.sql`

---

## 3) Object Storage — MinIO (S3 API) 📦
- Compose snippet:

```yaml
minio:
  image: minio/minio
  command: server /data
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  volumes:
    - minio_data:/data
  ports:
    - "9000:9000"
    - "9001:9001"
```

- Buat bucket via web console (`http://localhost:9001`) atau `mc` cli.
- Dari backend gunakan AWS SDK for JavaScript (S3 client) atau MinIO JS SDK dengan endpoint override.
- Gunakan presigned URLs untuk upload langsung dari frontend (direkomendasikan).

---

## 4) Backend — Node.js + Express (TypeScript) ⚙️
- Contoh `Dockerfile` singkat (multi-stage):

```dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 8000
CMD ["node", "dist/server.js"]
```

- Gunakan TypeScript + ORM (mis. Prisma atau TypeORM). Untuk migrasi contoh Prisma: `npx prisma migrate deploy`.
- Endpoint penting: `/health`, auth (JWT), bills/splits, upload/presign
- Startup: jalankan migrasi sebelum ready (migration command dijalankan di container init atau job)
- Health check memeriksa DB & MinIO.

---

## 5) Frontend — Next.js (TypeScript) 🖥️
- Build Dockerfile (prod) contoh (multi-stage):

```dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

- Di dev gunakan `NEXT_PUBLIC_API_URL` untuk proxied API.
- Upload flow: frontend meminta presigned URL ke backend, lalu PUT ke MinIO (direkomendasikan untuk efisiensi dan keamanan).

---

## 6) Docker Compose (local orchestration) 🧩
- Contoh `docker-compose.yml` services: `db`, `minio`, `backend`, `frontend`, `redis` (opsional), `worker` (opsional).
- Build & run:
  - `docker compose build`
  - `docker compose up -d`
- Run migrasi: `docker compose exec backend npx prisma migrate deploy` (atau `docker compose exec backend npm run migrate`)

---

## 7) Production options
- Small infra: `docker compose -f docker-compose.prod.yml up -d`
- Scalable: Kubernetes with Helm
  - Use Deployments, Services, PVCs for DB & MinIO, Ingress + TLS
  - Create Job for migrations (run once per deploy)
  - Store secrets in k8s Secrets or external vault

---

## 8) CI/CD (contoh GitHub Actions minimal) 🔁
- Steps: checkout → tests → build images → push to registry → run migrations → deploy (kubectl/ssh/docker compose)
- Always run smoke tests after deploy.

---

## 9) Operasional & Best Practices 🔐
- Always TLS for public endpoints
- Automated DB backups & MinIO snapshots
- Monitoring: Prometheus + Grafana, centralized logs (Loki/ELK)
- Use presigned URLs for client uploads
- Don't expose MinIO credentials to frontend

---

## 10) Quick checklist ⚡
1. Buat `.env` lokal
2. `docker compose up -d db minio`
3. `docker compose build && docker compose up -d`
4. `docker compose exec backend npx prisma migrate deploy` (atau `docker compose exec backend npm run migrate`)
5. Cek `http://localhost:8000/health` dan frontend

---

Jika ingin, saya bisa membuat skeleton file contoh (Dockerfile, docker-compose.yml, template Alembic migration, presign endpoint). Mau saya tambahkan? 🚀
