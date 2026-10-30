# PeopleCore HRIS — API Specification

**Version:** 1.0  
**Status:** Initial Design  
**Backend:** Go  
**Frontend:** React + TypeScript  
**Database:** PostgreSQL  
**API Style:** RESTful JSON API  
**Base Path:** `/api/v1`

---

## 1. Overview

PeopleCore HRIS menyediakan REST API untuk mengelola proses Human Resource Management, mulai dari data karyawan, struktur organisasi, absensi, cuti, penggajian, kontrak kerja, hingga evaluasi kinerja.

Dokumen ini menjadi kontrak antara frontend dan backend. Implementasi endpoint harus mengikuti format request, response, status code, dan aturan bisnis yang ditentukan di sini.

### 1.1 Design Principles

- Menggunakan RESTful resource-based endpoints.
- Seluruh komunikasi menggunakan JSON, kecuali upload dokumen.
- Menggunakan UUID sebagai identifier.
- Menggunakan UTC untuk penyimpanan timestamp.
- Menggunakan pagination untuk daftar data.
- Validasi utama dan aturan bisnis dilakukan di backend.
- Operasi yang mengubah beberapa tabel harus menggunakan database transaction.
- Endpoint sensitif harus dilindungi autentikasi dan authorization.
- Data historis tidak boleh diubah sembarangan.

### 1.2 API Versioning

Seluruh endpoint versi pertama menggunakan prefix:

`/api/v1`

Jika terjadi perubahan kontrak yang tidak kompatibel, perubahan dilakukan pada versi API berikutnya.

---

## 2. General Convention

### 2.1 HTTP Methods

| Method | Purpose |
|---|---|
| GET | Mengambil data |
| POST | Membuat resource atau menjalankan action |
| PUT | Mengganti keseluruhan data resource |
| PATCH | Mengubah sebagian data resource |
| DELETE | Menghapus resource jika diizinkan |

### 2.2 Common Headers

Request yang membutuhkan autentikasi:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

Untuk endpoint upload:

```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### 2.3 Standard Success Response

Response untuk mengambil satu resource:

```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "id": "UUID",
    "employee_number": "EMP-0001",
    "full_name": "John Doe"
  }
}
```

Response untuk membuat resource menggunakan HTTP `201 Created`.

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": "UUID",
    "employee_number": "EMP-0001"
  }
}
```

### 2.4 Standard Error Response

Seluruh error API menggunakan format:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

Error response tidak boleh mengekspos SQL query, database credentials, stack trace, atau informasi internal server.

### 2.5 HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Request berhasil |
| 201 | Resource berhasil dibuat |
| 204 | Berhasil tanpa response body |
| 400 | Request tidak valid |
| 401 | Belum terautentikasi |
| 403 | Tidak memiliki izin |
| 404 | Resource tidak ditemukan |
| 409 | Konflik data atau state |
| 422 | Validasi aturan bisnis gagal |
| 429 | Terlalu banyak request |
| 500 | Internal server error |
| 503 | Service tidak tersedia |

---

## 3. Pagination, Filtering, and Sorting

Endpoint list menggunakan query parameters berikut jika relevan.

```http
GET /api/v1/employees?page=1&limit=20&search=john&status=active&sort_by=created_at&sort_order=desc
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| page | integer | 1 | Halaman |
| limit | integer | 20 | Jumlah data |
| search | string | - | Pencarian |
| sort_by | string | created_at | Kolom pengurutan yang diizinkan |
| sort_order | string | desc | asc atau desc |

Backend wajib membatasi nilai `limit`, misalnya maksimum 100, dan hanya menerima kolom sorting yang telah diizinkan.

Contoh response:

```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "total_pages": 7
  }
}
```

Filter khusus seperti `department_id`, `employment_status`, `start_date`, dan `end_date` dapat ditambahkan pada endpoint terkait.

---

## 4. Authentication & Authorization

### 4.1 Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Memperbarui access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Informasi user yang sedang login |
| POST | `/auth/change-password` | Mengubah password |

#### Login

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "admin@peoplecore.local",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "<token>",
    "refresh_token": "<token>",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "UUID",
      "email": "admin@peoplecore.local",
      "roles": ["admin"]
    }
  }
}
```

Catatan keamanan:

- Password disimpan menggunakan password hashing yang aman.
- Access token memiliki masa berlaku pendek.
- Refresh token harus dapat dicabut saat logout.
- Jika refresh token menggunakan cookie, gunakan konfigurasi `HttpOnly`, `Secure`, dan `SameSite` yang sesuai.
- Jangan menyimpan password dalam log.

### 4.2 Authorization

Role dan permission menentukan akses ke resource.

Contoh role awal:

- `super_admin`
- `hr_admin`
- `hr_staff`
- `manager`
- `employee`
- `payroll_staff`

Authorization harus diperiksa di backend, bukan hanya dengan menyembunyikan menu pada frontend.

Contoh:

| Resource | HR Admin | Manager | Employee |
|---|---|---|---|
| Employee list | Full access | Scoped access | Own profile |
| Attendance | Full access | Team access | Own records |
| Leave requests | Manage | Approve team | Submit own |
| Payroll | Manage | Restricted | Own payslips |
| Contracts | Manage | Restricted | Own documents |

Akses final mengikuti permission yang dikonfigurasi, bukan hanya nama role.

---

## 5. Employee Management

### 5.1 Employee Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | Daftar karyawan |
| POST | `/employees` | Membuat karyawan |
| GET | `/employees/{id}` | Detail karyawan |
| PATCH | `/employees/{id}` | Memperbarui data karyawan |
| PATCH | `/employees/{id}/status` | Mengubah status karyawan |
| GET | `/employees/{id}/employment-history` | Riwayat pekerjaan |
| GET | `/employees/{id}/salary-history` | Riwayat gaji |
| GET | `/employees/me` | Profil karyawan yang login |

### 5.2 Create Employee

`POST /api/v1/employees`

Request:

```json
{
  "employee_number": "EMP-0001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+628123456789",
  "department_id": "UUID",
  "position_id": "UUID",
  "employment_type": "permanent",
  "join_date": "2026-01-01"
}
```

Ketentuan:

- Employee number harus unik.
- Email harus valid dan mengikuti aturan keunikan yang ditetapkan.
- Department dan position harus tersedia.
- Join date harus valid.
- Pembuatan employee dan data employment awal harus konsisten dalam satu transaksi jika dibuat bersamaan.

### 5.3 Update Employee

`PATCH /api/v1/employees/{id}`

Request:

```json
{
  "phone": "+628123456789",
  "department_id": "UUID",
  "position_id": "UUID"
}
```

Field yang tidak dikirim tidak boleh berubah.

Perubahan jabatan, departemen, atau status kerja yang membutuhkan histori harus menggunakan business action khusus, bukan sekadar menimpa data historis.

---

## 6. Organization Management

### 6.1 Organization Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/companies` | Daftar perusahaan |
| POST | `/companies` | Membuat perusahaan |
| GET | `/branches` | Daftar cabang |
| POST | `/branches` | Membuat cabang |
| GET | `/departments` | Daftar departemen |
| POST | `/departments` | Membuat departemen |
| GET | `/departments/{id}` | Detail departemen |
| PATCH | `/departments/{id}` | Memperbarui departemen |
| GET | `/positions` | Daftar jabatan |
| POST | `/positions` | Membuat jabatan |
| PATCH | `/positions/{id}` | Memperbarui jabatan |

Filter dapat menggunakan `company_id`, `branch_id`, dan `department_id`.

---

## 7. Attendance Management

### 7.1 Attendance Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/attendance` | Daftar absensi |
| GET | `/attendance/{id}` | Detail absensi |
| POST | `/attendance/clock-in` | Clock in |
| POST | `/attendance/clock-out` | Clock out |
| POST | `/attendance/corrections` | Mengajukan koreksi absensi |
| GET | `/attendance/corrections` | Daftar koreksi |
| POST | `/attendance/corrections/{id}/approve` | Menyetujui koreksi |
| POST | `/attendance/corrections/{id}/reject` | Menolak koreksi |
| GET | `/attendance/summary` | Ringkasan absensi |

### 7.2 Clock In

`POST /api/v1/attendance/clock-in`

Request:

```json
{
  "attendance_date": "2026-10-30",
  "notes": "Office attendance"
}
```

Server menentukan waktu aktual clock-in. Client tidak boleh menjadi sumber waktu resmi untuk pencatatan kehadiran.

### 7.3 Clock Out

`POST /api/v1/attendance/clock-out`

Request:

```json
{
  "notes": "End of working day"
}
```

### 7.4 Business Rules

- Karyawan hanya dapat mencatat absensinya sendiri, kecuali role tertentu memiliki izin khusus.
- Clock-in kedua pada shift yang sama harus ditolak atau ditangani berdasarkan kebijakan shift.
- Clock-out hanya dapat dilakukan setelah clock-in.
- Koreksi absensi membutuhkan alasan.
- Koreksi yang disetujui harus menyimpan informasi approver dan waktu persetujuan.
- Operasi yang bersamaan harus dilindungi dari duplicate attendance records.

Catatan: rancangan ERD awal menggunakan satu record absensi per karyawan per shift/hari. Jika nantinya dibutuhkan banyak punch dalam satu hari, tambahkan konsep attendance events.

---

## 8. Leave Management

### 8.1 Leave Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/leave-types` | Daftar jenis cuti |
| POST | `/leave-types` | Membuat jenis cuti |
| GET | `/leave-balances` | Saldo cuti |
| GET | `/leave-balances/me` | Saldo cuti sendiri |
| GET | `/leave-requests` | Daftar pengajuan |
| POST | `/leave-requests` | Mengajukan cuti |
| GET | `/leave-requests/{id}` | Detail pengajuan |
| POST | `/leave-requests/{id}/approve` | Menyetujui cuti |
| POST | `/leave-requests/{id}/reject` | Menolak cuti |
| POST | `/leave-requests/{id}/cancel` | Membatalkan pengajuan |

### 8.2 Create Leave Request

`POST /api/v1/leave-requests`

Request:

```json
{
  "leave_type_id": "UUID",
  "start_date": "2026-11-10",
  "end_date": "2026-11-12",
  "reason": "Personal matters"
}
```

### 8.3 Approve Leave Request

`POST /api/v1/leave-requests/{id}/approve`

Request:

```json
{
  "notes": "Approved"
}
```

### 8.4 Reject Leave Request

`POST /api/v1/leave-requests/{id}/reject`

Request:

```json
{
  "reason": "Insufficient supporting information"
}
```

### 8.5 Business Rules

- Tanggal akhir tidak boleh lebih awal dari tanggal mulai.
- Saldo cuti harus mencukupi sesuai kebijakan cuti.
- Pengajuan yang sudah diproses tidak boleh disetujui ulang.
- Approver tidak boleh menyetujui request yang tidak berada dalam cakupan kewenangannya.
- Saldo cuti diperbarui secara konsisten saat approval.
- Pemeriksaan saldo dan perubahan saldo harus dilakukan secara transaksional untuk mencegah saldo negatif akibat request bersamaan.
- Pembatalan cuti yang sudah disetujui mengikuti kebijakan pembatalan dan harus mencatat histori.

---

## 9. Payroll Management

### 9.1 Payroll Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/payroll/periods` | Daftar periode payroll |
| POST | `/payroll/periods` | Membuat periode |
| GET | `/payroll/periods/{id}` | Detail periode |
| POST | `/payroll/periods/{id}/calculate` | Menghitung payroll |
| GET | `/payroll/periods/{id}/items` | Daftar hasil payroll |
| GET | `/payroll/items/{id}` | Detail payroll karyawan |
| POST | `/payroll/periods/{id}/finalize` | Finalisasi payroll |
| POST | `/payroll/periods/{id}/cancel` | Membatalkan periode jika diizinkan |
| GET | `/payroll/me/payslips` | Payslip milik sendiri |
| GET | `/payroll/me/payslips/{id}` | Detail payslip sendiri |

### 9.2 Create Payroll Period

`POST /api/v1/payroll/periods`

Request:

```json
{
  "period_name": "October 2026",
  "start_date": "2026-10-01",
  "end_date": "2026-10-31",
  "payment_date": "2026-11-05"
}
```

### 9.3 Calculate Payroll

`POST /api/v1/payroll/periods/{id}/calculate`

Request:

```json
{
  "recalculate": false
}
```

Perhitungan payroll harus menggunakan data dan aturan yang berlaku pada periode tersebut.

### 9.4 Finalize Payroll

`POST /api/v1/payroll/periods/{id}/finalize`

Request:

```json
{
  "confirmation": true
}
```

### 9.5 Business Rules

- Periode payroll tidak boleh tumpang tindih jika kebijakan perusahaan melarangnya.
- Payroll yang telah difinalisasi tidak boleh dihitung ulang secara langsung.
- Setiap payroll item harus menyimpan snapshot komponen gaji dan nilai perhitungan.
- Perhitungan dan finalisasi harus transaksional.
- Akses payroll dibatasi berdasarkan permission.
- Karyawan hanya dapat melihat payslip miliknya sendiri.
- Koreksi payroll setelah finalisasi harus menggunakan proses adjustment atau periode koreksi, bukan mengubah histori tanpa jejak.

---

## 10. Contract Management

### 10.1 Contract Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/contracts` | Daftar kontrak |
| POST | `/contracts` | Membuat kontrak |
| GET | `/contracts/{id}` | Detail kontrak |
| PATCH | `/contracts/{id}` | Memperbarui metadata kontrak |
| POST | `/contracts/{id}/terminate` | Mengakhiri kontrak |
| GET | `/employees/{id}/contracts` | Riwayat kontrak karyawan |

Kontrak yang telah ditandatangani sebaiknya tidak diubah langsung. Perubahan substansial dibuat sebagai versi atau kontrak baru sesuai kebijakan perusahaan.

---

## 11. Performance Management

### 11.1 Performance Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/performance/cycles` | Daftar siklus evaluasi |
| POST | `/performance/cycles` | Membuat siklus |
| GET | `/performance/cycles/{id}` | Detail siklus |
| GET | `/performance/reviews` | Daftar evaluasi |
| POST | `/performance/reviews` | Membuat evaluasi |
| GET | `/performance/reviews/{id}` | Detail evaluasi |
| PATCH | `/performance/reviews/{id}` | Memperbarui evaluasi |
| POST | `/performance/reviews/{id}/submit` | Mengirim evaluasi |
| POST | `/performance/reviews/{id}/finalize` | Finalisasi evaluasi |

Akses evaluasi harus mengikuti relasi employee, reviewer, dan permission.

---

## 12. Recruitment Management

### 12.1 Recruitment Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/recruitment/jobs` | Daftar lowongan |
| POST | `/recruitment/jobs` | Membuat lowongan |
| GET | `/recruitment/jobs/{id}` | Detail lowongan |
| PATCH | `/recruitment/jobs/{id}` | Memperbarui lowongan |
| GET | `/recruitment/applicants` | Daftar kandidat |
| POST | `/recruitment/applicants` | Membuat kandidat |
| GET | `/recruitment/applicants/{id}` | Detail kandidat |
| PATCH | `/recruitment/applicants/{id}/status` | Mengubah status kandidat |

Data kandidat dan dokumen lamaran harus dibatasi berdasarkan permission recruitment.

---

## 13. Training Management

### 13.1 Training Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/training/programs` | Daftar program |
| POST | `/training/programs` | Membuat program |
| GET | `/training/programs/{id}` | Detail program |
| POST | `/training/programs/{id}/participants` | Menambahkan peserta |
| GET | `/training/participants` | Daftar peserta |
| PATCH | `/training/participants/{id}/status` | Memperbarui status peserta |

---

## 14. Document Management

### 14.1 Document Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/documents` | Daftar dokumen |
| POST | `/documents` | Upload dokumen |
| GET | `/documents/{id}` | Metadata dokumen |
| GET | `/documents/{id}/download` | Download dokumen |
| DELETE | `/documents/{id}` | Menghapus dokumen sesuai izin |

Upload menggunakan `multipart/form-data`.

Field yang disarankan:

- `file`
- `employee_id` jika relevan
- `document_type`
- `description`
- `expires_at` jika relevan

File disimpan di object/file storage. PostgreSQL hanya menyimpan metadata dan storage key.

Validasi tipe file, ukuran maksimum, nama file, dan hak akses wajib dilakukan di backend. File tidak boleh diakses hanya dengan menebak storage key.

---

## 15. Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Daftar notifikasi |
| GET | `/notifications/unread-count` | Jumlah notifikasi belum dibaca |
| POST | `/notifications/{id}/read` | Menandai sudah dibaca |
| POST | `/notifications/read-all` | Menandai semua sudah dibaca |

Notifikasi dapat dibuat oleh backend ketika terjadi event bisnis, seperti pengajuan cuti, approval, atau perubahan status kontrak.

---

## 16. Audit Trail

| Method | Endpoint | Description |
|---|---|---|
| GET | `/audit-logs` | Daftar audit log |
| GET | `/audit-logs/{id}` | Detail audit log |

Audit log bersifat read-only bagi pengguna biasa. Catatan audit minimal memuat:

- Actor/user ID
- Action
- Resource type
- Resource ID
- Timestamp
- Metadata perubahan yang aman
- IP address atau request metadata jika diperlukan

Jangan mencatat password, access token, refresh token, atau data rahasia lainnya.

---

## 17. Dashboard & Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | Ringkasan dashboard |
| GET | `/dashboard/attendance` | Ringkasan kehadiran |
| GET | `/dashboard/leave` | Ringkasan cuti |
| GET | `/dashboard/payroll` | Ringkasan payroll sesuai izin |

Response dashboard harus disesuaikan dengan role pengguna. Jangan mengirimkan data payroll atau informasi personal yang tidak boleh dilihat oleh role tersebut.

---

## 18. Concurrency & Data Integrity

Operasi berikut membutuhkan perlindungan transaksi database:

| Operation | Required Protection |
|---|---|
| Create employee | Unique constraints dan transaction |
| Clock in | Unique constraint atau locking sesuai model shift |
| Approve leave | Transaction dan row-level locking |
| Update leave balance | Atomic update dan validasi saldo |
| Calculate payroll | Transaction dan kontrol status periode |
| Finalize payroll | Transaction dan pencegahan finalisasi ganda |
| Change salary | Historical record dan audit trail |
| Contract termination | Transaction dan validasi status |

### 18.1 Optimistic Concurrency

Untuk resource yang dapat diedit oleh beberapa pengguna, pertimbangkan kolom `version` atau mekanisme `updated_at` sebagai concurrency token.

Contoh request:

```json
{
  "reason": "Updated information",
  "version": 3
}
```

Jika versi sudah berubah, backend mengembalikan `409 Conflict`.

### 18.2 Idempotency

Action yang berisiko dipanggil berulang, seperti proses payroll atau pembayaran, perlu memiliki mekanisme idempotency.

Contoh:

```http
Idempotency-Key: <unique-request-key>
```

Backend menyimpan hasil request yang telah diproses dan mengembalikan hasil yang sama ketika key yang sama digunakan kembali dalam konteks yang sama.

---

## 19. Validation Rules

- UUID harus memiliki format valid.
- Email harus memiliki format valid.
- Tanggal menggunakan format `YYYY-MM-DD`.
- Timestamp menggunakan ISO 8601.
- Nominal uang menggunakan numeric/decimal, bukan floating-point untuk perhitungan finansial.
- Field wajib harus divalidasi.
- Enum harus berasal dari nilai yang diizinkan.
- ID relasi harus merujuk ke resource yang tersedia.
- User hanya dapat mengakses data dalam cakupan permission-nya.

Validasi frontend hanya untuk pengalaman pengguna. Backend tetap menjadi sumber kebenaran.

---

## 20. Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Status aplikasi |
| GET | `/ready` | Kesiapan aplikasi dan dependency |

`/health` dapat digunakan untuk memeriksa proses aplikasi.

`/ready` memeriksa apakah dependency penting seperti PostgreSQL tersedia.

---

## 21. Implementation Priority

Agar pengembangan tidak terlalu besar sejak awal, implementasi dibagi menjadi beberapa fase.

### Phase 1 — Core HRIS

- Authentication & authorization
- Employee management
- Organization management
- Dashboard summary dasar

### Phase 2 — Daily HR Operations

- Attendance
- Leave management
- Notifications
- Audit trail

### Phase 3 — Compensation & Employment

- Contract management
- Payroll
- Salary history
- Payslip

### Phase 4 — Employee Development

- Performance management
- Recruitment
- Training
- Document management

---

## 22. Definition of Done

Sebuah endpoint dianggap selesai jika:

1. Request dan response sesuai kontrak.
2. Validasi input berjalan di backend.
3. Authentication dan authorization diterapkan.
4. Error response menggunakan format standar.
5. Database operation aman dan konsisten.
6. Operasi multi-tabel menggunakan transaction jika diperlukan.
7. Unit test atau integration test tersedia.
8. Dokumentasi endpoint diperbarui.
9. Frontend dapat menggunakan API tanpa mock data untuk alur yang sudah diimplementasikan.

---

**End of Document — PeopleCore HRIS API Specification v1.0**