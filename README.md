# PeopleCore HRIS

Human Resource Information System berbasis web dibangun dengan Go, React, dan PostgreSQL.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Go (Modular Monolith) |
| Frontend | React 19 + TypeScript + Vite |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |

## Quick Start (Development)

### Prasyarat
- Go 1.23+
- Node.js 20+
- Docker & Docker Compose
- golang-migrate CLI

### 1. Clone dan setup environment

```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` dan isi nilai yang sesuai, terutama:
- `JWT_ACCESS_SECRET` — minimal 32 karakter
- `JWT_REFRESH_SECRET` — minimal 32 karakter

### 2. Jalankan database

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 3. Jalankan database migrations

```bash
cd backend
migrate -path ./migrations -database "postgres://peoplecore_user:peoplecore_pass@localhost:5433/peoplecore?sslmode=disable" up
```

### 4. Seed data awal (roles, permissions, super admin)

```bash
cd backend
go run scripts/seed.go
```

Default super admin:
- Email: `admin@peoplecore.local`
- Password: `Admin@123456`

### 5. Jalankan backend

```bash
cd backend
go run cmd/api/main.go
```

Backend berjalan di: `http://localhost:8080`

### 6. Jalankan frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## Docker (Full Stack)

```bash
# Copy env
cp backend/.env.example backend/.env
# Edit backend/.env sesuai kebutuhan

# Build dan jalankan semua service
docker compose up --build
```

Akses:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- API Docs: `http://localhost:8080/docs`

---

## Struktur Proyek

```
hris-app/
├── backend/           # Go REST API (Modular Monolith)
│   ├── cmd/api/       # Entry point
│   ├── internal/      # Application code
│   │   ├── config/    # Configuration
│   │   ├── database/  # DB connection & migration
│   │   ├── server/    # HTTP server & routes
│   │   ├── middleware/# HTTP middleware
│   │   ├── platform/  # Shared utilities
│   │   ├── module/    # Business modules
│   │   └── app/       # Dependency wiring
│   ├── migrations/    # SQL migration files
│   └── scripts/       # Utility scripts
│
├── frontend/          # React + TypeScript SPA
│   └── src/
│       ├── app/       # App setup & routing
│       ├── components/# Reusable components
│       ├── features/  # Feature modules
│       ├── lib/       # Utilities & API client
│       └── stores/    # State management
│
├── docs/              # Dokumentasi proyek
├── docker-compose.yml          # Full stack
└── docker-compose.dev.yml      # Database only (dev)
```

---

## API Documentation

Swagger UI tersedia di: `http://localhost:8080/docs`

---

## Development Roadmap

Lihat [Implementation Plan](docs/implementation-plan.md) untuk detail fase pengembangan.

### Progress

- [x] **Phase 1** — Foundation (Auth, RBAC, Infrastructure)
- [ ] **Phase 2** — Core HR (Employee, Organization, Dashboard)
- [ ] **Phase 3** — Attendance & Leave
- [ ] **Phase 4** — Payroll & Contracts
- [ ] **Phase 5** — Performance & Development
- [ ] **Phase 6** — Reporting & Enhancement
- [ ] **Phase 7** — Deployment

