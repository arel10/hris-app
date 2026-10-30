# PeopleCore HRIS — System Architecture

**Version:** 1.0  
**Status:** Initial Architecture Design  
**Architecture Style:** Modular Monolith  
**Backend:** Go  
**Frontend:** React + TypeScript  
**Database:** PostgreSQL  
**Infrastructure:** Docker & Docker Compose

---

## 1. Architecture Overview

PeopleCore HRIS menggunakan pendekatan **Modular Monolith**. Backend dibangun sebagai satu aplikasi Go, tetapi setiap domain bisnis memiliki batas tanggung jawab yang jelas.

Pendekatan ini dipilih karena:

- Lebih sederhana untuk dikembangkan dan di-deploy.
- Tidak membutuhkan infrastruktur microservices.
- Setiap domain tetap dapat dipisahkan secara logis.
- Database transaction lebih mudah dikelola.
- Struktur aplikasi dapat dikembangkan seiring bertambahnya kebutuhan.

Frontend dan backend berjalan sebagai service terpisah dan berkomunikasi melalui REST API.

### 1.1 High-Level Architecture

```mermaid
flowchart TB
    U[User / Browser]

    subgraph Frontend
        UI[React + TypeScript]
        ROUTER[React Router]
        API[API Client]
        STATE[State Management]
    end

    subgraph Backend
        HTTP[HTTP Server / Middleware]
        ROUTES[API Router]
        AUTH[Authentication & Authorization]

        subgraph Modules[Business Modules]
            EMP[Employee]
            ORG[Organization]
            ATT[Attendance]
            LEAVE[Leave]
            PAY[Payroll]
            CONTRACT[Contract]
            PERF[Performance]
            OTHER[Other HR Modules]
        end

        DBL[Database Layer]
    end

    subgraph Infrastructure
        PG[(PostgreSQL)]
        STORAGE[File / Object Storage]
        DOCKER[Docker Environment]
    end

    U --> UI
    UI --> ROUTER
    ROUTER --> API
    API --> HTTP
    HTTP --> ROUTES
    ROUTES --> AUTH
    AUTH --> Modules
    Modules --> DBL
    DBL --> PG
    Modules --> STORAGE
    DOCKER -. runs .-> Frontend
    DOCKER -. runs .-> Backend
    DOCKER -. runs .-> PG
```

---

## 2. Main Components

### 2.1 Frontend

Frontend bertanggung jawab untuk:

- Menampilkan antarmuka pengguna.
- Mengelola navigasi halaman.
- Mengirim request ke backend.
- Menampilkan data dari API.
- Mengelola loading, success, dan error state.
- Melakukan validasi awal untuk pengalaman pengguna.
- Menampilkan fitur berdasarkan permission.

Frontend tidak boleh menjadi sumber kebenaran untuk aturan bisnis dan authorization.

### 2.2 Backend

Backend bertanggung jawab untuk:

- Menyediakan REST API.
- Melakukan authentication dan authorization.
- Memvalidasi request.
- Menjalankan business logic.
- Mengelola transaksi database.
- Menjaga konsistensi dan integritas data.
- Menyimpan audit trail.
- Mengelola akses dokumen.

### 2.3 Database

PostgreSQL menjadi relational database utama.

Database menyimpan:

- User dan role.
- Data karyawan.
- Struktur organisasi.
- Absensi.
- Pengajuan dan saldo cuti.
- Payroll.
- Kontrak.
- Evaluasi kinerja.
- Recruitment dan training.
- Metadata dokumen.
- Notifikasi.
- Audit log.

### 2.4 File Storage

Dokumen seperti kontrak kerja, identitas, dan lampiran tidak disimpan langsung sebagai binary di tabel utama PostgreSQL.

PostgreSQL menyimpan metadata, sedangkan file disimpan pada file/object storage.

Contoh metadata:

```json
{
  "id": "UUID",
  "employee_id": "UUID",
  "document_type": "employment_contract",
  "file_name": "contract-001.pdf",
  "storage_key": "employees/EMP-0001/contracts/contract-001.pdf",
  "mime_type": "application/pdf",
  "file_size": 245000
}
```

Akses file harus melalui backend atau mekanisme signed URL yang aman.

---

## 3. Backend Architecture

Backend menggunakan pembagian layer agar HTTP handling, business logic, dan database access tidak tercampur.

### 3.1 Layer Architecture

```mermaid
flowchart TD
    A[HTTP Request]
    B[Router]
    C[Middleware]
    D[Handler]
    E[Service]
    F[Repository]
    G[(PostgreSQL)]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G

    G --> F
    F --> E
    E --> D
    D --> A
```

#### Handler Layer

Tanggung jawab:

- Menerima HTTP request.
- Membaca path parameter, query parameter, dan request body.
- Melakukan validasi format input.
- Memanggil service.
- Mengubah hasil service menjadi HTTP response.

Handler tidak boleh menyimpan business logic yang kompleks.

#### Service Layer

Tanggung jawab:

- Menjalankan business rules.
- Mengatur alur proses bisnis.
- Mengelola transaction boundary.
- Memanggil satu atau beberapa repository.
- Memastikan operasi bisnis konsisten.

Contoh: `LeaveService.ApproveLeave()` harus memvalidasi status request, kewenangan approver, saldo cuti, dan perubahan saldo dalam satu proses bisnis yang konsisten.

#### Repository Layer

Tanggung jawab:

- Berkomunikasi dengan PostgreSQL.
- Menjalankan query.
- Melakukan insert, update, delete, dan select.
- Mengembalikan data atau error database.

Repository tidak boleh memutuskan apakah sebuah pengajuan cuti boleh disetujui. Keputusan tersebut berada di service layer.

#### Model / Domain Layer

Berisi representasi domain, enum, dan aturan yang berkaitan erat dengan domain tertentu.

Tidak semua aplikasi membutuhkan domain layer yang kompleks sejak awal. Hindari membuat abstraksi hanya untuk menambah jumlah folder.

---

## 4. Recommended Backend Folder Structure

```text
backend/
├── cmd/
│   └── api/
│       └── main.go
│
├── internal/
│   ├── config/
│   │   └── config.go
│   │
│   ├── database/
│   │   ├── postgres.go
│   │   └── transaction.go
│   │
│   ├── server/
│   │   ├── server.go
│   │   └── routes.go
│   │
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── logger.go
│   │   ├── recovery.go
│   │   └── request_id.go
│   │
│   ├── platform/
│   │   ├── response/
│   │   ├── errors/
│   │   ├── validator/
│   │   ├── pagination/
│   │   └── storage/
│   │
│   ├── module/
│   │   ├── auth/
│   │   │   ├── handler.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   ├── model.go
│   │   │   └── dto.go
│   │   │
│   │   ├── employee/
│   │   │   ├── handler.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   ├── model.go
│   │   │   └── dto.go
│   │   │
│   │   ├── organization/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── payroll/
│   │   ├── contract/
│   │   ├── performance/
│   │   ├── recruitment/
│   │   ├── training/
│   │   ├── document/
│   │   └── notification/
│   │
│   └── app/
│       └── dependencies.go
│
├── migrations/
│   ├── 000001_create_auth_tables.up.sql
│   ├── 000001_create_auth_tables.down.sql
│   ├── 000002_create_organization_tables.up.sql
│   ├── 000002_create_organization_tables.down.sql
│   └── ...
│
├── seeders/
│   └── ...
│
├── tests/
│   ├── integration/
│   └── fixtures/
│
├── Dockerfile
├── go.mod
├── go.sum
└── .env.example
```

### 4.1 Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `cmd/api` | Application entry point |
| `config` | Environment configuration |
| `database` | Database connection dan transaction helper |
| `server` | HTTP server dan route registration |
| `middleware` | Cross-cutting HTTP middleware |
| `platform` | Shared technical utilities |
| `module` | Business domains |
| `app` | Dependency wiring |
| `migrations` | Database schema changes |
| `seeders` | Initial/reference data |
| `tests` | Integration test dan test fixtures |

### 4.2 Module Independence

Setiap module sebaiknya memiliki tanggung jawab yang jelas.

Contoh:

```text
module/
└── leave/
    ├── handler.go
    ├── service.go
    ├── repository.go
    ├── model.go
    └── dto.go
```

`leave` dapat menggunakan data employee melalui interface atau dependency yang jelas. Hindari membuat circular dependency antar-module.

Untuk versi awal, repository dapat menggunakan satu koneksi database bersama. Pemisahan module adalah pemisahan kode dan tanggung jawab, bukan pemisahan database.

---

## 5. Frontend Architecture

Frontend menggunakan React dan TypeScript dengan pendekatan feature-based structure.

### 5.1 Frontend Folder Structure

```text
frontend/
├── public/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── types/
│   │   │
│   │   ├── employees/
│   │   ├── organization/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── payroll/
│   │   ├── contracts/
│   │   ├── performance/
│   │   ├── recruitment/
│   │   ├── training/
│   │   └── documents/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── errors.ts
│   │   ├── utils/
│   │   └── constants/
│   │
│   ├── stores/
│   ├── types/
│   ├── styles/
│   └── main.tsx
│
├── Dockerfile
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

### 5.2 Frontend Responsibilities

- `app`: aplikasi utama, router, dan providers.
- `components/ui`: komponen UI reusable.
- `components/layout`: sidebar, navbar, dan page layout.
- `features`: kode berdasarkan domain bisnis.
- `lib/api`: HTTP client dan error handling.
- `stores`: global state jika dibutuhkan.
- `types`: tipe umum lintas fitur.

### 5.3 API Client

Semua komunikasi dengan backend harus melalui satu HTTP client wrapper.

Contoh tanggung jawab API client:

- Menentukan base URL dari environment variable.
- Menambahkan authentication header.
- Mengatur `Content-Type` sesuai tipe request.
- Parsing response.
- Menangani HTTP error.
- Menangani network error.
- Menangani `204 No Content`.
- Mengelola refresh token sesuai strategi authentication.

Frontend tidak boleh menyimpan URL backend secara hardcoded di setiap fitur.

Contoh environment:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 6. Request Lifecycle

Contoh alur ketika HR membuat data karyawan:

```mermaid
sequenceDiagram
    actor HR
    participant FE as React Frontend
    participant API as Go API
    participant MW as Middleware
    participant H as Employee Handler
    participant S as Employee Service
    participant R as Employee Repository
    participant DB as PostgreSQL

    HR->>FE: Submit employee form
    FE->>API: POST /api/v1/employees
    API->>MW: Validate token and permission
    MW->>H: Forward request
    H->>H: Parse and validate request
    H->>S: CreateEmployee(dto)
    S->>S: Validate business rules
    S->>R: Create employee
    R->>DB: INSERT employee
    DB-->>R: Created record
    R-->>S: Employee
    S-->>H: Result
    H-->>FE: 201 Created
    FE-->>HR: Show success message
```

Prinsip penting:

1. Frontend mengirim request.
2. Middleware memeriksa identitas dan akses.
3. Handler memproses format request.
4. Service menjalankan business rules.
5. Repository mengakses database.
6. Response dikembalikan dalam format standar.

---

## 7. Database Architecture

### 7.1 Database Strategy

- Menggunakan PostgreSQL sebagai relational database.
- UUID sebagai primary key.
- Foreign key untuk menjaga relasi.
- Unique constraint untuk data yang harus unik.
- Check constraint untuk aturan data sederhana.
- Index pada kolom yang sering digunakan untuk filter dan join.
- Transaction untuk operasi lintas tabel.
- Migration versioning untuk perubahan schema.

### 7.2 Database Domains

| Domain | Main Responsibility |
|---|---|
| Authentication | Users, roles, permissions |
| Employee | Employee profile dan employment history |
| Organization | Company, branch, department, position |
| Attendance | Attendance records dan corrections |
| Leave | Leave types, requests, balances, approvals |
| Payroll | Payroll periods, items, components |
| Contract | Employment contracts |
| Performance | Evaluation cycles dan reviews |
| Recruitment | Jobs dan applicants |
| Training | Programs dan participants |
| Documents | Metadata dokumen |
| Notification | Notifications dan audit trail |

### 7.3 Transaction Management

Transaction dikelola pada service layer karena service memahami batas satu proses bisnis.

Contoh approval cuti:

```text
BEGIN TRANSACTION

1. Lock leave request.
2. Validate request status.
3. Validate approver permission.
4. Lock leave balance.
5. Validate remaining balance.
6. Update leave request status.
7. Deduct leave balance.
8. Insert approval history.
9. Insert audit log.

COMMIT
```

Jika salah satu langkah gagal, seluruh perubahan harus di-rollback.

### 7.4 Historical Data

Data yang memiliki nilai historis harus disimpan sebagai histori atau snapshot.

Contoh:

- Riwayat jabatan.
- Riwayat departemen.
- Riwayat gaji.
- Riwayat kontrak.
- Payroll item snapshot.
- Riwayat persetujuan.

Jangan hanya mengandalkan nilai terbaru dari tabel employee untuk merekonstruksi data masa lalu.

---

## 8. Authentication & Security Architecture

### 8.1 Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React
    participant API as Go API
    participant DB as PostgreSQL

    User->>FE: Enter email and password
    FE->>API: POST /auth/login
    API->>DB: Find user
    DB-->>API: User data
    API->>API: Verify password
    API->>API: Issue tokens
    API-->>FE: Access and refresh token
    FE->>API: Request with access token
    API->>API: Validate token
    API-->>FE: Protected resource
```

### 8.2 Security Requirements

- Password hashing menggunakan algoritma yang sesuai untuk password.
- HTTPS digunakan pada production.
- Access token memiliki expiry.
- Refresh token dapat dicabut.
- Authorization dilakukan di backend.
- Validasi input dilakukan di backend.
- Query database menggunakan parameterized query.
- CORS dibatasi pada origin yang diizinkan.
- Rate limiting diterapkan pada endpoint sensitif.
- Secret disimpan melalui environment/secret management, bukan source code.
- Audit log mencatat perubahan penting.
- Data personal dan payroll hanya dapat diakses oleh pihak yang berwenang.
- Upload file memerlukan validasi MIME type, ukuran, dan izin akses.

### 8.3 Data Access Control

Akses tidak cukup hanya berdasarkan role. Backend juga perlu memeriksa data scope.

Contoh:

- Employee hanya dapat melihat profil dan payslip miliknya.
- Manager hanya dapat mengakses data karyawan yang berada dalam cakupan timnya.
- HR dapat mengakses data sesuai permission.
- Payroll staff dapat mengakses informasi kompensasi sesuai tanggung jawabnya.

---

## 9. Error Handling & Observability

### 9.1 Error Handling

Backend menggunakan error type yang konsisten.

Contoh kategori:

- Validation error.
- Authentication error.
- Authorization error.
- Not found.
- Conflict.
- Business rule violation.
- Internal error.

Handler mengubah kategori error menjadi HTTP status dan response contract yang sesuai.

### 9.2 Logging

Log minimal mencakup:

- Timestamp.
- Log level.
- Request ID.
- HTTP method dan route.
- Status code.
- Duration.
- Error category jika terjadi kegagalan.

Jangan mencatat password, token, atau informasi personal sensitif secara sembarangan.

### 9.3 Health Checks

- `/health`: memeriksa proses aplikasi.
- `/ready`: memeriksa kesiapan dependency seperti database.

Health check digunakan oleh Docker dan monitoring untuk mengetahui kondisi service.

---

## 10. Docker & Deployment Architecture

### 10.1 Development Environment

Docker Compose digunakan untuk menjalankan service yang dibutuhkan.

```mermaid
flowchart TB
    B[Developer Browser]

    subgraph DockerCompose
        FE[Frontend Container]
        BE[Backend Container]
        DB[(PostgreSQL Container)]
    end

    B --> FE
    FE --> BE
    BE --> DB
```

Service utama:

| Service | Responsibility |
|---|---|
| frontend | React application |
| backend | Go REST API |
| postgres | Relational database |

Migration dapat dijalankan melalui command/tool terpisah atau migration job sebelum backend menerima traffic.

### 10.2 Example Docker Compose Structure

Contoh konseptual:

```yaml
services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
    ports:
      - "8080:8080"
    env_file:
      - ./backend/.env
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: peoplecore
      POSTGRES_USER: peoplecore_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U peoplecore_user -d peoplecore"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Konfigurasi ini merupakan baseline development. Production memerlukan konfigurasi tambahan, terutama secret management, HTTPS, persistent storage, backup, dan reverse proxy.

### 10.3 Production Deployment

Arsitektur production yang disarankan:

```mermaid
flowchart TB
    USER[User]
    PROXY[Reverse Proxy / HTTPS]

    subgraph Application
        FE[Frontend]
        API[Go API]
    end

    DB[(PostgreSQL)]
    FILES[(Object Storage)]
    MON[Monitoring and Logs]

    USER --> PROXY
    PROXY --> FE
    PROXY --> API
    API --> DB
    API --> FILES
    API --> MON
```

Production deployment harus memperhatikan:

- HTTPS.
- Database backup.
- Database migration strategy.
- Application logging.
- Monitoring.
- Environment-specific configuration.
- File storage persistence.
- Database access restrictions.
- Least-privilege credentials.

---

## 11. Configuration Management

Konfigurasi dibaca dari environment variable.

Contoh backend `.env.example`:

```env
APP_ENV=development
APP_PORT=8080
APP_NAME=peoplecore-api

DATABASE_URL=postgres://peoplecore_user:password@localhost:5432/peoplecore?sslmode=disable

JWT_ACCESS_SECRET=replace_me
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=168h

CORS_ALLOWED_ORIGINS=http://localhost:5173

STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./storage
```

Ketentuan:

- `.env` tidak boleh di-commit.
- `.env.example` boleh di-commit.
- Production secret tidak boleh menggunakan nilai development.
- Environment variable harus divalidasi saat aplikasi startup.

---

## 12. Testing Strategy

### 12.1 Backend Testing

| Test Type | Scope |
|---|---|
| Unit test | Service, validation, business rules |
| Repository test | Query dan persistence |
| Handler test | HTTP request/response |
| Integration test | API dan PostgreSQL |
| Concurrency test | Operasi yang berpotensi race condition |

### 12.2 Frontend Testing

| Test Type | Scope |
|---|---|
| Unit test | Utility dan hooks |
| Component test | Form dan reusable components |
| Integration test | API interaction |
| End-to-end test | Alur bisnis dari sisi user |

### 12.3 Critical Scenarios

Prioritaskan pengujian untuk:

- Login dengan kredensial salah.
- User tanpa permission mengakses resource.
- Employee number duplikat.
- Clock-in berulang.
- Dua approver memproses cuti yang sama.
- Dua pengajuan cuti menggunakan saldo yang sama.
- Payroll dihitung dua kali.
- Payroll difinalisasi dua kali.
- User mencoba mengakses payslip milik employee lain.
- Upload file dengan tipe atau ukuran tidak valid.

---

## 13. Development Roadmap

### Phase 1 — Foundation

- Repository setup.
- Docker Compose.
- Go configuration.
- PostgreSQL connection.
- Migration runner.
- Standard API response.
- Middleware.
- Authentication.
- Authorization.

### Phase 2 — Core Employee Management

- Organization module.
- Employee module.
- Employment history.
- Employee frontend.
- Dashboard summary dasar.

### Phase 3 — HR Operations

- Attendance.
- Leave.
- Approval workflow.
- Notifications.
- Audit trail.

### Phase 4 — Compensation

- Contract.
- Salary history.
- Payroll.
- Payslip.
- Payroll authorization.

### Phase 5 — Advanced HR

- Performance.
- Recruitment.
- Training.
- Document management.

### Phase 6 — Production Readiness

- Integration tests.
- Concurrency tests.
- Security review.
- Logging and monitoring.
- Backup and restore test.
- Production deployment.

---

## 14. Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| Backend architecture | Modular monolith | Simpler deployment and clear domain boundaries |
| API style | REST | Straightforward frontend integration |
| Database | PostgreSQL | Relational consistency and transaction support |
| Primary key | UUID | Stable identifiers |
| Frontend | React + TypeScript | Component-based UI and type safety |
| Backend language | Go | Performance and simple deployment |
| Containerization | Docker | Consistent environments |
| File storage | Separate storage | Avoid storing large binary files in relational tables |
| Database migration | Versioned migrations | Controlled schema evolution |
| Authorization | Role + permission + data scope | More precise access control |

---

## 15. Important Architecture Constraints

1. Jangan memindahkan business logic ke handler atau frontend.
2. Jangan mengakses repository module lain secara sembarangan.
3. Jangan menggunakan floating-point untuk nominal payroll.
4. Jangan mengubah data historis tanpa mekanisme histori atau audit.
5. Jangan mengandalkan frontend untuk authorization.
6. Jangan menjalankan operasi multi-tabel yang harus konsisten tanpa transaction.
7. Jangan mengimplementasikan microservices sebelum ada kebutuhan nyata.
8. Jangan menyimpan file binary berukuran besar langsung di tabel utama.
9. Jangan mengirim seluruh data employee atau payroll ke frontend jika tidak dibutuhkan.
10. Jangan melakukan deployment production menggunakan credential development.

---

## 16. Final Architecture Summary

PeopleCore HRIS dibangun menggunakan React + TypeScript sebagai frontend, Go sebagai backend REST API, dan PostgreSQL sebagai database utama.

Backend menggunakan modular monolith dengan pemisahan handler, service, dan repository. Setiap domain bisnis memiliki batas tanggung jawab yang jelas, sementara database tetap dikelola secara terpusat.

Docker digunakan untuk menyamakan lingkungan development dan mempermudah deployment. Sistem dirancang agar dapat dikembangkan secara bertahap, dimulai dari authentication, employee management, dan organization management sebelum masuk ke proses HR yang lebih kompleks.

**End of Document — PeopleCore HRIS System Architecture v1.0**