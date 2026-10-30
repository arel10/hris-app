# Product Requirements Document (PRD)
# PeopleCore HRIS

| Informasi | Detail |
|---|---|
| Product Name | PeopleCore HRIS |
| Product Type | Human Resource Information System |
| Document Version | 1.0 |
| Status | Draft |
| Backend | Golang |
| Frontend | React + TypeScript |
| Database | PostgreSQL |
| Containerization | Docker & Docker Compose |
| Architecture | Modular Monolith |
| API Architecture | REST API |

---

## 1. Product Overview

### 1.1 Introduction

PeopleCore HRIS adalah aplikasi berbasis web yang dirancang untuk membantu perusahaan mengelola seluruh aktivitas Human Resource (HR) dalam satu platform terintegrasi.

Aplikasi ini menyediakan sistem pengelolaan data karyawan, struktur organisasi, kehadiran, pengajuan cuti, penggajian, kontrak kerja, evaluasi kinerja, rekrutmen, pelatihan, dan pengelolaan dokumen karyawan.

PeopleCore HRIS bertujuan untuk mengurangi proses administrasi manual, meningkatkan efisiensi operasional HR, menjaga konsistensi data, dan memberikan transparansi informasi kepada karyawan maupun manajemen perusahaan.

### 1.2 Product Vision

Menjadi platform Human Resource Management yang terintegrasi, efisien, aman, dan mudah digunakan untuk mendukung pengelolaan sumber daya manusia perusahaan secara digital.

### 1.3 Product Objectives

Tujuan utama pengembangan PeopleCore HRIS:

1. Mendigitalisasi pengelolaan data dan administrasi karyawan.
2. Mengotomatisasi pencatatan kehadiran dan pengajuan cuti.
3. Mempermudah pengelolaan payroll dan administrasi penggajian.
4. Mengelola kontrak kerja dan riwayat pekerjaan karyawan.
5. Menyediakan sistem evaluasi performa karyawan.
6. Menyediakan dashboard dan laporan untuk mendukung pengambilan keputusan.
7. Menerapkan pengelolaan akses berdasarkan role dan permission.
8. Menjaga keamanan, konsistensi, dan integritas data perusahaan.

### 1.4 Target Users

- Human Resource Administrator
- HR Manager
- Department Manager
- Company Administrator
- Employees

---

## 2. Scope of Product

PeopleCore HRIS dikembangkan dengan pendekatan modular agar setiap modul memiliki tanggung jawab dan business logic masing-masing.

### 2.1 In-Scope Modules

| No. | Module | Description |
|---|---|---|
| 1 | Dashboard & Analytics | Ringkasan informasi dan statistik HR |
| 2 | Authentication & Authorization | Login, session, role, dan permission |
| 3 | Employee Management | Pengelolaan informasi karyawan |
| 4 | Organization Management | Pengelolaan struktur organisasi |
| 5 | Attendance Management | Pencatatan dan monitoring kehadiran |
| 6 | Leave Management | Pengajuan dan persetujuan cuti |
| 7 | Payroll Management | Pengelolaan dan pemrosesan gaji |
| 8 | Contract Management | Pengelolaan kontrak kerja |
| 9 | Performance Management | Evaluasi dan penilaian kinerja |
| 10 | Recruitment Management | Pengelolaan proses rekrutmen |
| 11 | Training & Development | Pengembangan kompetensi karyawan |
| 12 | Document Management | Pengelolaan dokumen karyawan |
| 13 | Reports & Notifications | Laporan dan notifikasi sistem |
| 14 | Audit Trail | Pencatatan aktivitas pengguna |

### 2.2 Out of Scope

Fitur berikut tidak termasuk dalam prioritas implementasi versi pertama:

- Native Android dan iOS application.
- Integrasi langsung dengan mesin fingerprint.
- Integrasi perbankan untuk transfer gaji otomatis.
- Integrasi dengan sistem akuntansi eksternal.
- Biometric facial recognition.
- AI-based recruitment dan performance scoring.
- Multi-tenant SaaS billing.
- Integrasi otomatis dengan sistem pemerintah.

Fitur tersebut dapat dipertimbangkan untuk pengembangan versi selanjutnya.

---

## 3. User Roles & Access Control

PeopleCore HRIS menggunakan Role-Based Access Control (RBAC) untuk membatasi akses berdasarkan tanggung jawab pengguna.

### 3.1 User Roles

#### A. Super Admin

Memiliki akses penuh terhadap sistem.

Permissions:
- Mengelola seluruh pengguna.
- Mengelola role dan permission.
- Mengelola konfigurasi sistem.
- Mengelola seluruh modul.
- Mengakses seluruh laporan.
- Melihat audit logs.

#### B. HR Administrator

Bertanggung jawab terhadap administrasi sumber daya manusia.

Permissions:
- Mengelola data karyawan.
- Mengelola struktur organisasi.
- Mengelola kehadiran.
- Mengelola pengajuan cuti.
- Mengelola kontrak kerja.
- Mengelola payroll.
- Mengelola dokumen.
- Mengakses laporan HR.

#### C. HR Manager

Bertanggung jawab terhadap pengawasan dan persetujuan proses HR.

Permissions:
- Melihat seluruh data HR.
- Menyetujui proses HR yang memerlukan otorisasi.
- Meninjau payroll.
- Meninjau kontrak.
- Mengakses laporan dan analitik.
- Mengelola evaluasi kinerja.

#### D. Department Manager

Bertanggung jawab terhadap karyawan dalam departemennya.

Permissions:
- Melihat data anggota tim.
- Melihat rekap kehadiran tim.
- Menyetujui pengajuan cuti bawahan.
- Meninjau performa bawahan.
- Memberikan feedback dan penilaian.

#### E. Employee

Pengguna dengan akses terbatas terhadap informasi pribadi.

Permissions:
- Melihat dan memperbarui informasi profil yang diizinkan.
- Melakukan check-in dan check-out.
- Melihat riwayat kehadiran.
- Mengajukan cuti.
- Melihat saldo cuti.
- Melihat status pengajuan.
- Melihat payslip pribadi.
- Melihat kontrak kerja pribadi.
- Mengakses informasi evaluasi kinerja.
- Mengakses dokumen pribadi.

### 3.2 Authorization Requirements

- Setiap endpoint harus memvalidasi autentikasi pengguna.
- Setiap endpoint yang dilindungi harus memeriksa permission.
- Employee hanya dapat mengakses data pribadi yang menjadi haknya.
- Department Manager hanya dapat mengakses data karyawan dalam cakupan departemennya.
- Payroll hanya dapat diakses oleh pengguna yang memiliki permission terkait.
- Hak akses harus divalidasi pada backend, bukan hanya melalui frontend.
- Perubahan role dan permission harus dicatat dalam audit logs.

---

## 4. Functional Requirements

## 4.1 Authentication & Authorization Module

### Description

Modul autentikasi dan otorisasi untuk mengelola akses pengguna ke dalam aplikasi.

### Features

- User login.
- User logout.
- Access token management.
- Refresh token management.
- Password hashing.
- Change password.
- Forgot password.
- Reset password.
- Role management.
- Permission management.
- User account activation.
- User account deactivation.
- Session invalidation.

### Business Rules

1. Setiap pengguna harus memiliki akun yang terdaftar.
2. Email harus unik.
3. Password harus disimpan menggunakan algoritma hashing yang aman.
4. Pengguna yang dinonaktifkan tidak dapat login.
5. Token harus memiliki masa berlaku.
6. Refresh token harus dapat dicabut.
7. Sistem harus membatasi percobaan login yang gagal.
8. Setiap pengguna hanya mendapatkan akses sesuai permission yang dimiliki.

---

## 4.2 Dashboard & Analytics Module

### Description

Dashboard menampilkan ringkasan informasi HR berdasarkan role pengguna.

### Features

- Total employees.
- Active employees.
- Inactive employees.
- New employees.
- Present employees.
- Absent employees.
- Late employees.
- Employees on leave.
- Active contracts.
- Expiring contracts.
- Monthly payroll summary.
- Employee growth chart.
- Attendance statistics.
- Department statistics.
- Upcoming events.
- Pending approvals.

### Business Rules

1. Data dashboard harus diperoleh dari database aktual.
2. Informasi dashboard harus mengikuti permission pengguna.
3. Employee hanya dapat melihat informasi yang relevan dengan dirinya.
4. Manager hanya dapat melihat informasi tim yang menjadi tanggung jawabnya.
5. HR memiliki akses ke statistik HR perusahaan.

---

## 4.3 Employee Management Module

### Description

Modul untuk mengelola informasi dan administrasi seluruh karyawan.

### Features

- Create employee.
- Read employee.
- Update employee.
- Deactivate employee.
- Employee directory.
- Employee profile.
- Employee search.
- Employee filtering.
- Employee pagination.
- Employee identification number.
- Personal information management.
- Contact information management.
- Employment information.
- Emergency contact.
- Bank account information.
- Employee document attachment.
- Employment history.
- Position history.
- Department transfer history.
- Promotion history.

### Employee Information

**Personal Information**
- Employee ID.
- Full name.
- Gender.
- Place of birth.
- Date of birth.
- National identification number.
- Marital status.
- Personal email.
- Phone number.
- Address.

**Employment Information**
- Department.
- Division.
- Position.
- Job level.
- Employment type.
- Employment status.
- Hire date.
- Reporting manager.
- Work location.

**Additional Information**
- Emergency contact.
- Bank information.
- Education history.
- Skills.
- Certifications.

### Business Rules

1. Setiap karyawan memiliki Employee ID unik.
2. Email karyawan harus unik sesuai kebijakan perusahaan.
3. Employee ID tidak boleh berubah setelah dibuat.
4. Karyawan yang sudah memiliki riwayat transaksi tidak boleh dihapus secara permanen melalui proses operasional biasa.
5. Penghapusan akun karyawan dilakukan melalui proses deactivation atau termination.
6. Perubahan informasi penting harus dicatat dalam audit logs.
7. Data sensitif hanya dapat diakses oleh pengguna yang berwenang.

---

## 4.4 Organization Management Module

### Description

Modul untuk mengelola struktur organisasi perusahaan.

### Features

- Company management.
- Branch management.
- Department management.
- Division management.
- Position management.
- Job grade management.
- Reporting hierarchy.
- Organization chart.
- Employee assignment.

### Business Rules

1. Satu department dapat memiliki banyak karyawan.
2. Satu position dapat digunakan oleh banyak karyawan.
3. Setiap karyawan memiliki penempatan organisasi.
4. Reporting manager harus merupakan karyawan aktif.
5. Sistem harus mencegah struktur reporting yang membentuk circular hierarchy.
6. Perubahan struktur organisasi tidak boleh menghapus riwayat penempatan sebelumnya.

---

## 4.5 Attendance Management Module

### Description

Modul untuk mencatat, memantau, dan mengelola kehadiran karyawan.

### Features

- Employee check-in.
- Employee check-out.
- Attendance history.
- Daily attendance recap.
- Monthly attendance recap.
- Late arrival tracking.
- Early departure tracking.
- Working duration calculation.
- Overtime recording.
- Attendance correction request.
- Attendance correction approval.
- Work shift management.
- Work schedule management.
- Holiday calendar.
- Attendance reports.

### Business Rules

1. Karyawan hanya dapat melakukan check-in jika memiliki jadwal kerja yang valid.
2. Sistem mencatat waktu check-in dan check-out berdasarkan waktu server.
3. Sistem harus mencegah check-in ganda yang tidak valid.
4. Check-out hanya dapat dilakukan setelah check-in yang valid.
5. Keterlambatan dihitung berdasarkan jadwal dan grace period perusahaan.
6. Hari libur dan hari cuti tidak dihitung sebagai ketidakhadiran.
7. Koreksi kehadiran harus melalui proses approval.
8. Perubahan data kehadiran harus memiliki audit trail.
9. Perhitungan overtime harus mengikuti kebijakan perusahaan.

### Attendance Status

- Present.
- Late.
- Absent.
- On Leave.
- Holiday.
- Incomplete.
- Remote Work (jika diaktifkan).

---

## 4.6 Leave Management Module

### Description

Modul untuk mengelola pengajuan, persetujuan, dan saldo cuti karyawan.

### Features

- Leave type management.
- Annual leave.
- Sick leave.
- Personal leave.
- Unpaid leave.
- Maternity leave.
- Paternity leave.
- Leave balance.
- Leave request.
- Leave cancellation.
- Leave approval.
- Leave rejection.
- Leave history.
- Leave calendar.
- Leave reports.

### Business Rules

1. Employee dapat mengajukan cuti berdasarkan jenis cuti yang tersedia.
2. Sistem harus memvalidasi saldo cuti sebelum pengajuan disetujui.
3. Setiap pengajuan harus memiliki tanggal mulai dan tanggal selesai.
4. Sistem harus menghitung durasi cuti berdasarkan hari kerja dan kalender perusahaan.
5. Pengajuan cuti harus melalui approval workflow.
6. Manager hanya dapat menyetujui cuti karyawan dalam cakupan departemennya.
7. HR dapat mengelola kebijakan cuti.
8. Saldo cuti diperbarui setelah pengajuan disetujui sesuai aturan jenis cuti.
9. Pengajuan yang ditolak tidak mengurangi saldo cuti.
10. Pembatalan cuti yang telah disetujui harus melalui proses yang ditentukan perusahaan.

### Leave Status

- Pending.
- Approved.
- Rejected.
- Cancelled.

### Approval Workflow

Employee Request → Department Manager Approval → HR Review (jika diperlukan) → Approved / Rejected.

---

## 4.7 Payroll Management Module

### Description

Modul untuk mengelola struktur gaji dan proses penggajian karyawan.

### Features

- Salary structure management.
- Basic salary.
- Fixed allowances.
- Variable allowances.
- Overtime pay.
- Bonus.
- Incentives.
- Deductions.
- BPJS components.
- PPh 21 components.
- Attendance-based deductions.
- Payroll period management.
- Payroll calculation.
- Payroll processing.
- Payroll approval.
- Payslip generation.
- Payroll history.
- Payroll reports.
- Payment status tracking.

### Payroll Components

**Earnings**
- Basic salary.
- Position allowance.
- Transport allowance.
- Meal allowance.
- Overtime.
- Bonus.
- Incentives.

**Deductions**
- BPJS components.
- PPh 21.
- Absence deductions (sesuai kebijakan).
- Other deductions.

### Business Rules

1. Setiap karyawan harus memiliki salary structure yang valid.
2. Payroll diproses berdasarkan periode yang ditentukan.
3. Payroll harus menggunakan data karyawan dan komponen gaji yang berlaku pada periode terkait.
4. Payroll calculation harus menggunakan perhitungan yang konsisten dan dapat diuji.
5. Setiap payroll record harus memiliki detail komponen penghasilan dan potongan.
6. Payroll tidak boleh diproses dua kali untuk karyawan dan periode yang sama.
7. Payroll harus melalui approval sebelum dinyatakan final.
8. Payroll yang telah difinalisasi tidak boleh diubah secara langsung.
9. Koreksi payroll harus menggunakan mekanisme adjustment yang tercatat.
10. Payslip hanya dapat diakses oleh karyawan terkait dan pengguna yang memiliki permission.
11. Perhitungan PPh 21 dan BPJS harus mengikuti ketentuan yang berlaku.
12. Sistem harus menyimpan snapshot komponen dan aturan perhitungan yang digunakan pada saat payroll diproses.

### Payroll Status

- Draft.
- Calculated.
- Pending Approval.
- Approved.
- Finalized.
- Paid.

### Payroll Calculation

Gross Salary = Total Earnings

Net Salary = Gross Salary - Total Deductions

---

## 4.8 Contract Management Module

### Description

Modul untuk mengelola kontrak kerja karyawan.

### Features

- Contract creation.
- Contract number generation.
- Permanent employment contract (PKWTT).
- Fixed-term employment contract (PKWT).
- Contract start date.
- Contract end date.
- Contract extension.
- Contract renewal.
- Contract termination.
- Contract status.
- Contract document upload.
- Contract history.
- Contract expiration reminder.

### Business Rules

1. Setiap kontrak harus terhubung dengan satu karyawan.
2. Nomor kontrak harus unik.
3. Kontrak harus memiliki tanggal mulai.
4. Kontrak PKWT harus memiliki tanggal berakhir.
5. Kontrak yang berakhir harus diperbarui statusnya.
6. Sistem harus memberikan notifikasi sebelum kontrak berakhir.
7. Perubahan kontrak harus disimpan sebagai riwayat.
8. Dokumen kontrak hanya dapat diakses oleh pengguna berwenang.

---

## 4.9 Performance Management Module

### Description

Modul untuk melakukan evaluasi dan pengukuran kinerja karyawan.

### Features

- KPI management.
- Performance target management.
- Evaluation period.
- Self-assessment.
- Manager assessment.
- Peer review.
- Performance scoring.
- Feedback management.
- Performance history.
- Evaluation reports.
- Promotion recommendations.

### Business Rules

1. Evaluasi harus memiliki periode yang jelas.
2. Setiap KPI harus memiliki indikator dan bobot.
3. Total bobot penilaian harus sesuai ketentuan perusahaan.
4. Penilaian harus dilakukan oleh evaluator yang memiliki otorisasi.
5. Hasil evaluasi harus tersimpan sebagai riwayat.
6. Hasil evaluasi yang telah diselesaikan tidak boleh diubah tanpa proses revisi.
7. Karyawan dapat melihat hasil evaluasi sesuai kebijakan perusahaan.

---

## 4.10 Recruitment Management Module

### Description

Modul untuk mengelola proses perekrutan karyawan baru.

### Features

- Job vacancy management.
- Job description.
- Applicant management.
- Candidate profile.
- CV upload.
- Recruitment pipeline.
- Interview scheduling.
- Interview evaluation.
- Candidate status management.
- Job offer management.
- Candidate conversion to employee.

### Recruitment Pipeline

Applied → Screening → Interview → Assessment → Offered → Hired.

### Business Rules

1. Setiap lowongan harus memiliki deskripsi pekerjaan.
2. Kandidat harus memiliki identitas dan informasi kontak.
3. Setiap kandidat harus memiliki status recruitment.
4. Perubahan status kandidat harus dapat ditelusuri.
5. Kandidat yang diterima dapat dikonversi menjadi data karyawan.
6. Proses konversi tidak boleh menghasilkan Employee ID ganda.

---

## 4.11 Training & Development Module

### Description

Modul untuk mengelola pelatihan dan pengembangan kompetensi karyawan.

### Features

- Training program management.
- Training schedule.
- Training registration.
- Training participants.
- Training attendance.
- Training materials.
- Training certificates.
- Skills management.
- Competency tracking.
- Training evaluation.
- Training history.

### Business Rules

1. Setiap training harus memiliki informasi program dan jadwal.
2. Karyawan dapat didaftarkan sebagai peserta.
3. Kehadiran training harus dapat dicatat.
4. Sertifikat hanya dapat diberikan sesuai persyaratan training.
5. Riwayat pelatihan harus tersimpan dalam profil karyawan.

---

## 4.12 Document Management Module

### Description

Modul untuk menyimpan dan mengelola dokumen perusahaan maupun dokumen karyawan.

### Features

- Document upload.
- Document download.
- Document categorization.
- Employee document storage.
- Document verification.
- Document expiration reminder.
- Document versioning.
- Document access control.
- Document deletion management.

### Supported Documents

- Curriculum Vitae.
- Identity Card.
- Tax Identification Number.
- Education Certificates.
- Employment Contracts.
- Training Certificates.
- Employment Letters.
- Other HR Documents.

### Business Rules

1. Format dan ukuran dokumen harus divalidasi.
2. Dokumen sensitif harus dilindungi dari akses tidak sah.
3. Setiap dokumen harus memiliki metadata.
4. Perubahan dokumen harus dapat ditelusuri.
5. Dokumen yang dihapus harus mengikuti kebijakan retensi perusahaan.

---

## 4.13 Reports & Notifications Module

### Reports

- Employee report.
- Attendance report.
- Leave report.
- Payroll report.
- Contract report.
- Performance report.
- Recruitment report.
- Training report.

### Export Formats

- PDF.
- Excel (XLSX).
- CSV.

### Notifications

- Leave request notification.
- Leave approval notification.
- Leave rejection notification.
- Attendance correction notification.
- Contract expiration reminder.
- Payroll processed notification.
- Payslip available notification.
- Performance review reminder.
- Training schedule reminder.

### Business Rules

1. Notifikasi harus dikirim kepada pengguna yang relevan.
2. Notifikasi harus memiliki status read/unread.
3. Sistem harus menyimpan riwayat notifikasi.
4. Pengguna hanya dapat mengakses notifikasi miliknya.
5. Pengiriman notifikasi gagal harus dapat ditangani tanpa merusak transaksi utama.

---

## 4.14 Audit Trail Module

### Description

Modul untuk mencatat aktivitas penting pengguna di dalam aplikasi.

### Features

- User activity logging.
- Login history.
- Create activity.
- Update activity.
- Delete or deactivate activity.
- Approval activity.
- Payroll processing activity.
- Role and permission changes.
- Data modification history.

### Audit Log Information

- User ID.
- Action.
- Module.
- Entity type.
- Entity ID.
- Previous value (jika relevan).
- New value (jika relevan).
- IP address (jika tersedia).
- Timestamp.

### Business Rules

1. Aktivitas penting harus dicatat secara otomatis.
2. Audit logs tidak boleh diubah melalui interface operasional biasa.
3. Hanya pengguna berwenang yang dapat melihat audit logs.
4. Data sensitif harus disaring sebelum dicatat dalam log.
5. Kegagalan pencatatan audit pada transaksi kritis harus ditangani sesuai kebijakan integritas sistem.

---

## 5. Core Business Workflows

### 5.1 Employee Onboarding

1. HR membuat data karyawan baru.
2. Sistem menghasilkan Employee ID.
3. HR melengkapi informasi pekerjaan.
4. HR menetapkan department dan position.
5. HR membuat kontrak kerja.
6. HR mengunggah dokumen karyawan.
7. Sistem mengaktifkan akun pengguna.
8. Karyawan dapat login dan mengakses portal.

### 5.2 Attendance Workflow

1. Karyawan login.
2. Karyawan melakukan check-in.
3. Sistem menyimpan waktu kehadiran.
4. Karyawan melakukan check-out.
5. Sistem menghitung durasi kerja.
6. Sistem menentukan status kehadiran.
7. HR dapat melihat laporan kehadiran.

### 5.3 Leave Request Workflow

1. Karyawan membuka menu Leave Management.
2. Karyawan memilih jenis cuti.
3. Karyawan menentukan tanggal cuti.
4. Sistem memvalidasi pengajuan.
5. Pengajuan dikirim kepada Manager.
6. Manager menyetujui atau menolak.
7. HR melakukan review jika diperlukan.
8. Sistem memperbarui status pengajuan.
9. Sistem memperbarui saldo cuti jika disetujui.
10. Karyawan menerima notifikasi.

### 5.4 Payroll Workflow

1. HR membuat payroll period.
2. Sistem mengambil data karyawan aktif.
3. Sistem mengambil salary structure.
4. Sistem mengambil data kehadiran dan lembur.
5. Sistem menghitung earnings.
6. Sistem menghitung deductions.
7. Sistem menghasilkan payroll records.
8. HR melakukan review.
9. HR Manager memberikan approval.
10. Payroll difinalisasi.
11. Payslip dibuat.
12. Status pembayaran diperbarui.

### 5.5 Contract Management Workflow

1. HR membuat kontrak kerja.
2. HR menentukan jenis kontrak.
3. HR menentukan periode kontrak.
4. HR mengunggah dokumen.
5. Kontrak disimpan.
6. Sistem memantau tanggal berakhir.
7. Sistem mengirimkan pengingat.
8. HR melakukan perpanjangan atau perubahan status sesuai kebijakan.

---

## 6. Non-Functional Requirements

### 6.1 Performance

- API harus memiliki response time yang wajar untuk operasi normal.
- Target response time untuk endpoint CRUD sederhana adalah maksimal 500 ms pada kondisi pengujian yang ditentukan.
- Dashboard harus menggunakan query yang efisien.
- Database harus memiliki indexing pada kolom yang sering digunakan untuk filtering dan searching.
- Pagination harus tersedia untuk daftar data berukuran besar.
- Proses berat seperti payroll dan export report dapat dijalankan secara asynchronous.

### 6.2 Security

- Password harus di-hash menggunakan algoritma yang aman.
- API harus menggunakan HTTPS pada production.
- Authentication harus menggunakan token dengan masa berlaku.
- Authorization harus divalidasi di backend.
- Input harus divalidasi dan disanitasi.
- SQL injection harus dicegah melalui parameterized queries.
- File upload harus memiliki validasi tipe dan ukuran.
- Data payroll dan informasi pribadi harus dilindungi.
- Secret dan credential tidak boleh disimpan dalam source code.
- Rate limiting harus diterapkan pada endpoint sensitif.

### 6.3 Reliability & Data Integrity

- Operasi bisnis kritis harus menggunakan database transactions.
- Foreign key constraints harus diterapkan.
- Unique constraints harus digunakan pada data yang membutuhkan keunikan.
- Sistem harus mencegah duplikasi transaksi.
- Sistem harus memiliki mekanisme backup database.
- Kegagalan proses tidak boleh menghasilkan data yang tidak konsisten.
- Operasi yang dapat diulang harus mempertimbangkan idempotency.

### 6.4 Scalability

- Backend menggunakan modular monolith.
- Setiap domain bisnis memiliki pemisahan tanggung jawab.
- Database harus mendukung pertumbuhan data.
- Aplikasi harus dapat dijalankan menggunakan beberapa instance backend jika dibutuhkan.
- Background jobs dapat ditambahkan untuk proses asynchronous.

### 6.5 Maintainability

- Source code harus memiliki struktur modular.
- Business logic dipisahkan dari HTTP handlers.
- Database access dipisahkan melalui repository layer.
- API contract harus terdokumentasi.
- Automated testing harus tersedia.
- Environment configuration harus dikelola melalui environment variables.

### 6.6 Usability

- Interface harus responsif.
- Navigasi harus konsisten.
- Form harus memiliki validasi.
- Error message harus mudah dipahami.
- Dashboard harus menampilkan informasi relevan.
- Pengguna hanya melihat menu sesuai permission.

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| UI Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| API State Management | TanStack Query |
| Form Management | React Hook Form |
| Validation | Zod |
| Backend | Golang |
| HTTP Framework | Chi / Gin |
| Database Driver | pgx |
| Query Management | sqlc |
| Database | PostgreSQL |
| Migration | golang-migrate |
| Authentication | JWT |
| API Documentation | Swagger / OpenAPI |
| Containerization | Docker |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx |
| Testing Backend | Go testing |
| Testing Frontend | Vitest |

### 7.2 Architecture Pattern

The application uses a Modular Monolith architecture with clear separation of concerns.

Backend layers:

- Handler Layer: Menangani HTTP requests dan responses.
- Service Layer: Menangani business logic.
- Repository Layer: Menangani database operations.
- Model Layer: Mendefinisikan struktur data dan domain entities.
- Middleware Layer: Menangani authentication, authorization, logging, dan request processing.

### 7.3 System Architecture

Client (React + TypeScript)
        |
        | HTTP / REST API
        |
Nginx Reverse Proxy
        |
        v
Golang Backend API
        |
        |-- Authentication Module
        |-- Employee Module
        |-- Organization Module
        |-- Attendance Module
        |-- Leave Module
        |-- Payroll Module
        |-- Contract Module
        |-- Performance Module
        |-- Recruitment Module
        |-- Training Module
        |-- Document Module
        |-- Reporting Module
        |
        v
PostgreSQL Database

All application services are managed through Docker Compose.

### 7.4 API Standards

- RESTful API conventions.
- JSON request and response.
- Consistent HTTP status codes.
- Centralized error response format.
- Request validation.
- Pagination.
- Filtering.
- Sorting.
- API versioning using `/api/v1`.

Example endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/login | User login |
| POST | /api/v1/auth/refresh | Refresh token |
| GET | /api/v1/employees | Employee list |
| POST | /api/v1/employees | Create employee |
| GET | /api/v1/employees/:id | Employee detail |
| PUT | /api/v1/employees/:id | Update employee |
| GET | /api/v1/attendance | Attendance list |
| POST | /api/v1/attendance/check-in | Employee check-in |
| POST | /api/v1/attendance/check-out | Employee check-out |
| POST | /api/v1/leaves | Submit leave request |
| PATCH | /api/v1/leaves/:id/approve | Approve leave |
| GET | /api/v1/payroll | Payroll list |
| POST | /api/v1/payroll/process | Process payroll |
| GET | /api/v1/contracts | Contract list |
| GET | /api/v1/reports/employees | Employee report |

---

## 8. Database Requirements

The application uses PostgreSQL as its primary relational database.

### 8.1 Database Domains

**Authentication**
- users
- roles
- permissions
- user_roles
- role_permissions
- refresh_tokens

**Employee**
- employees
- employee_contacts
- employee_addresses
- employee_emergency_contacts
- employee_bank_accounts
- employee_employment_histories

**Organization**
- companies
- branches
- departments
- divisions
- positions
- job_grades

**Attendance**
- attendance_records
- work_shifts
- work_schedules
- attendance_corrections
- holidays

**Leave**
- leave_types
- leave_policies
- leave_balances
- leave_requests
- leave_approvals

**Payroll**
- salary_structures
- salary_components
- payroll_periods
- payroll_records
- payroll_items
- payroll_adjustments
- payslips

**Contract**
- employee_contracts
- contract_documents

**Performance**
- kpis
- evaluation_periods
- performance_reviews
- performance_scores
- performance_feedback

**Recruitment**
- job_vacancies
- applicants
- interviews
- job_offers

**Training**
- training_programs
- training_participants
- training_attendances
- training_certificates

**Documents & System**
- documents
- employee_documents
- notifications
- audit_logs

### 8.2 Database Design Principles

1. Use UUID or another consistent identifier strategy for primary keys.
2. Use foreign keys to maintain relational integrity.
3. Use appropriate unique constraints.
4. Use indexes for frequently queried columns.
5. Use transactions for critical business operations.
6. Use timestamps for record tracking.
7. Use soft deletion where business history must be preserved.
8. Store monetary values using appropriate exact numeric types.
9. Store timestamps consistently and handle the company's timezone explicitly.
10. Maintain historical records for salary, contracts, and employment changes.

---

## 9. User Interface Requirements

### 9.1 General Layout

The application uses a dashboard-oriented interface consisting of:

- Sidebar navigation.
- Top navigation bar.
- Main content area.
- Breadcrumb navigation.
- Notification center.
- User profile menu.

### 9.2 Main Pages

| Page | Description |
|---|---|
| Login | Authentication page |
| Dashboard | HR overview |
| Employee List | Employee directory |
| Employee Detail | Employee profile |
| Organization | Organization structure |
| Attendance | Attendance monitoring |
| My Attendance | Personal attendance |
| Leave Management | Leave requests |
| My Leave | Personal leave |
| Payroll | Payroll administration |
| My Payslip | Personal payslip |
| Contracts | Contract management |
| Performance | Performance evaluation |
| Recruitment | Recruitment management |
| Training | Training management |
| Documents | Document management |
| Reports | Reports and analytics |
| Notifications | Notification center |
| User Management | User administration |
| Settings | System configuration |
| Audit Logs | Activity history |

### 9.3 UI/UX Principles

- Clean and professional enterprise design.
- Consistent color palette.
- Responsive layout.
- Accessible forms and controls.
- Clear status indicators.
- Reusable components.
- Consistent table and pagination behavior.
- Loading, empty, and error states.
- Confirmation dialogs for critical operations.

---

## 10. Acceptance Criteria

The product is considered to meet its initial functional requirements when the following conditions are satisfied.

### Authentication
- Users can log in and log out.
- Invalid credentials are rejected.
- Expired tokens are handled correctly.
- Access is restricted according to permissions.

### Employee Management
- HR can create, update, view, and deactivate employees.
- Employee IDs are unique.
- Employee data is stored persistently.
- Unauthorized users cannot access restricted employee information.

### Attendance
- Employees can check in and check out.
- Attendance timestamps are recorded correctly.
- Duplicate attendance actions are prevented.
- Attendance reports can be generated.

### Leave Management
- Employees can submit leave requests.
- Managers can approve or reject requests.
- Leave balances are updated correctly.
- Approval history is available.

### Payroll
- HR can create payroll periods.
- Payroll calculation produces consistent results.
- Duplicate payroll processing is prevented.
- Payroll requires approval before finalization.
- Employees can access their own payslips.

### Contract Management
- HR can create and update contracts.
- Contract dates and statuses are validated.
- Expiration reminders are generated.
- Contract history is preserved.

### Performance Management
- HR can define KPIs.
- Managers can evaluate employees.
- Performance scores are calculated consistently.
- Evaluation history is available.

### System
- Frontend consumes the actual backend API.
- Application runs using Docker Compose.
- Database migrations can be executed.
- API documentation is available.
- Critical operations have automated tests.
- Audit logs capture important activities.

---

## 11. Development Roadmap

Development will be divided into several phases.

### Phase 1 — Foundation

- Project initialization.
- Docker Compose setup.
- PostgreSQL configuration.
- Database migration setup.
- Backend architecture.
- Frontend architecture.
- Authentication.
- RBAC.
- API documentation.

### Phase 2 — Core HR Management

- Employee management.
- Organization management.
- Employee profile.
- Employee documents.
- Dashboard overview.

### Phase 3 — Attendance & Leave

- Attendance management.
- Work schedule.
- Shift management.
- Attendance correction.
- Leave management.
- Leave approval.
- Leave balance.

### Phase 4 — Payroll & Contracts

- Salary structure.
- Payroll period.
- Payroll processing.
- Payroll approval.
- Payslip.
- Contract management.
- Contract expiration notifications.

### Phase 5 — Performance & Development

- KPI management.
- Performance evaluation.
- Feedback.
- Recruitment.
- Training management.

### Phase 6 — Reporting & System Enhancement

- Reports and analytics.
- Export PDF and Excel.
- Notification system.
- Audit trail.
- Performance optimization.
- Security testing.
- Integration testing.

### Phase 7 — Deployment

- Production Docker configuration.
- Nginx configuration.
- HTTPS setup.
- Environment configuration.
- Database backup.
- CI/CD pipeline.
- Production deployment.

---

## 12. Testing Strategy

### 12.1 Backend Testing

- Unit testing for business logic.
- Integration testing for repositories.
- HTTP handler testing.
- Authentication and authorization testing.
- Database transaction testing.
- Payroll calculation testing.
- Concurrency testing for critical operations.

### 12.2 Frontend Testing

- Component testing.
- Form validation testing.
- API integration testing.
- Authentication flow testing.
- Role-based rendering testing.
- Error handling testing.

### 12.3 End-to-End Testing

Test important business workflows:

- Employee onboarding.
- Attendance check-in and check-out.
- Leave request and approval.
- Payroll processing and approval.
- Contract creation and expiration.
- Employee access restrictions.

---

## 13. Deployment Requirements

### 13.1 Docker Services

The initial application environment consists of:

- frontend: React application.
- backend: Golang API.
- database: PostgreSQL.
- nginx: Reverse proxy.

Optional services for future development:

- Redis: Caching and background job coordination.
- Object storage: Document and file storage.
- Background worker: Asynchronous processing.

### 13.2 Environment Configuration

Sensitive configuration must be provided through environment variables.

Example:

- APP_ENV
- APP_PORT
- DATABASE_URL
- JWT_SECRET
- JWT_ACCESS_TOKEN_EXPIRY
- JWT_REFRESH_TOKEN_EXPIRY
- STORAGE_PATH
- FRONTEND_URL

Production credentials must not be committed to version control.

### 13.3 Deployment Goals

- Application can be started using Docker Compose.
- Database persists across container restarts.
- Database migrations can be executed consistently.
- Services have health checks.
- Application logs are accessible.
- Production environment uses HTTPS.
- Backup and recovery procedures are documented.

---

## 14. Success Metrics

The success of PeopleCore HRIS will be evaluated using the following metrics:

| Metric | Target |
|---|---|
| Employee records | Successfully managed |
| Attendance recording | Accurate and consistent |
| Leave approval | Fully traceable |
| Payroll calculation | Reproducible and validated |
| Access control | No unauthorized access |
| API reliability | Stable under expected workload |
| Database integrity | No inconsistent critical transactions |
| Test coverage | Target at least 70% for critical backend business logic |
| Deployment | Successfully running through Docker Compose |

---

## 15. Assumptions & Constraints

### Assumptions

1. Initial implementation targets a single company.
2. The architecture should allow future multi-company expansion.
3. The application is primarily web-based.
4. Users have individual accounts.
5. Employees have access to a self-service portal.
6. HR administrators manage employee master data.
7. Managers participate in approval workflows.
8. Payroll rules are configurable.
9. Attendance initially uses web-based check-in and check-out.
10. Company policies determine working schedules, leave entitlements, and payroll components.

### Constraints

1. The application must use Golang for backend development.
2. The frontend must use React and TypeScript.
3. PostgreSQL is the primary database.
4. Docker is required for application containerization.
5. Frontend must communicate with the real backend API.
6. The initial architecture uses a modular monolith.
7. Business logic must be handled by the backend.
8. Critical business operations must preserve database integrity.

---

## 16. Future Enhancements

Potential features for future versions:

- Multi-company management.
- Multi-tenant SaaS architecture.
- GPS and geofencing attendance.
- QR Code attendance.
- Biometric integration.
- Mobile application.
- Automated payroll bank integration.
- Advanced HR analytics.
- Employee self-service enhancements.
- Email and WhatsApp notifications.
- AI-assisted recruitment.
- AI-based HR analytics.
- Advanced workforce planning.

---

## 17. Product Definition of Done

PeopleCore HRIS version 1.0 is considered ready when:

1. All MVP modules are implemented.
2. Core business workflows work end-to-end.
3. Frontend successfully integrates with the Golang backend.
4. PostgreSQL database migrations work correctly.
5. Authentication and authorization are implemented.
6. Critical business operations are protected by database transactions.
7. Required tests pass.
8. API documentation is available.
9. Docker Compose can run the application.
10. Deployment and configuration documentation are available.
11. No critical security or data integrity issues remain.

---

## 18. Conclusion

PeopleCore HRIS is designed as an integrated Human Resource Information System that centralizes employee management and HR operational processes.

By combining Golang, React, PostgreSQL, and Docker, the system aims to provide a maintainable, secure, and scalable foundation for enterprise human resource management.

The development approach prioritizes core HR operations before expanding into advanced modules, ensuring that every implemented feature delivers functional business value.

**End of Document — PeopleCore HRIS PRD v1.0**