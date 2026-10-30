---
name: dealdeck-design-system
description: Design system wajib untuk semua halaman dashboard/UI di proyek ini (PeopleCore HRIS). Gunakan SETIAP KALI membuat atau mengubah halaman, komponen, layout, atau styling. Berisi token warna, tipografi, spacing, radius, shadow, pola komponen (sidebar, header, card, badge, chart, list), dan aturan anti-"slop". Sumber kebenaran: style.css + index.html DealDeck.
---

# DealDeck Design System

Skill ini adalah **sumber kebenaran visual** untuk seluruh UI. Referensi aslinya adalah `index.html` dan `style.css` (DealDeck Sales Report). Jangan mengarang gaya baru. Jika ragu, tiru pola yang sudah ada di bagian "Komponen" di bawah.

## 0. Cara memakai skill ini

1. Sebelum menulis UI apa pun, baca bagian **Token** dan **Komponen**.
2. Semua warna, ukuran font, spacing, radius, dan shadow **harus** berasal dari token. Dilarang hardcode hex baru di luar daftar token.
3. Susun halaman baru dari komponen yang sudah didefinisikan (card, metric card, badge, dropdown, list row, dsb.) sebelum membuat komponen baru.
4. Sebelum selesai, jalankan **Checklist akhir** (bagian 9).

Karakter visual: **bersih, padat-tapi-lega, flat, modern SaaS**. Ciri utamanya:
- Latar abu kebiruan sangat muda, kartu putih, tanpa border pada kartu.
- Satu warna aksen kuat (biru `#1B51F4`).
- Radius besar dan membulat (12–28px).
- Teks kecil dan rapi (10–14px untuk isi), judul tebal (700–800).
- Shadow nyaris tak terlihat.

---

## 1. Design Tokens

Salin blok ini ke `:root` pada stylesheet global. Semua komponen mengacu ke variabel ini.

```css
:root {
    /* Surface */
    --bg-app: #EDF1F7;        /* latar halaman & area konten utama */
    --bg-sidebar: #F7FAFC;    /* latar sidebar */
    --bg-card: #FFFFFF;       /* kartu, dropdown, tombol ikon */
    --bg-subtle: #F1F4FA;     /* latar ikon bulat/persegi di dalam kartu */
    --bg-dark: #0F1219;       /* promo box, tooltip */

    /* Brand & semantic */
    --primary: #1B51F4;
    --primary-hover: #1541C7;
    --primary-soft: #5C7EFF;
    --primary-light: #90A1FF;
    --purple: #7A52F4;
    --gold: #FFB800;
    --success: #10D050;
    --success-bg: rgba(16, 208, 80, 0.12);
    --danger: #FF4A55;
    --danger-bg: rgba(255, 74, 85, 0.12);

    /* Text */
    --dark: #1A1E29;          /* teks utama */
    --muted: #7E879C;         /* teks sekunder, label, ikon nav */
    --gray-icon: #A0A5B5;

    /* Lines & tracks */
    --border: #ECEFF5;
    --track: #EBECF2;         /* track progress bar / gauge */
    --bar-neutral: #CCD4E5;   /* batang chart non-utama */

    /* Layout */
    --sidebar-width: 260px;
    --app-padding: 24px;
}
```

**Aturan warna**
- `--primary` = aksi utama, item nav aktif, kartu sorotan, data utama chart. Satu layar hanya punya **satu** kartu sorotan biru.
- Hijau/merah **hanya** untuk tren naik/turun dan status positif/negatif. Jangan dipakai untuk dekorasi.
- Ungu dan emas hanya sebagai warna kategori sekunder (ikon, seri chart), bukan warna tombol.
- Kontras teks: judul `--dark`, keterangan `--muted`. Jangan membuat abu ketiga.

---

## 2. Tipografi

**Font:** `Plus Jakarta Sans` (400, 500, 600, 700, 800). Fallback `sans-serif`.
Jangan memakai Inter, Roboto, Arial, atau font monospace untuk teks UI. Kode karyawan (mis. `EMP-202610-0001`) tetap memakai Plus Jakarta Sans dengan `font-variant-numeric: tabular-nums`, bukan monospace.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Skala tipografi

| Peran | Ukuran | Weight | Warna | Catatan |
|---|---|---|---|---|
| Judul halaman (h1) | 26px | 800 | `--dark` | `letter-spacing: -0.5px` |
| Nilai metrik besar | 26px | 800 | `--dark` | `letter-spacing: -0.5px` |
| Nama brand | 18px | 800 | `--dark` | `letter-spacing: -0.3px` |
| Judul card (h3) | 16px | 700 | `--dark` | |
| Angka tengah gauge | 18px | 800 | `--dark` | |
| Nav item | 14px | 600 | `--muted` | aktif: putih |
| Subjudul halaman / tanggal | 13px | 400 | `--muted` | `margin-top: 2px` |
| Tombol kecil, dropdown, baris list | 12px | 600–700 | `--dark` / `--muted` | |
| Subjudul card, label metrik | 11px | 600 (label) / 400 (subjudul) | `--muted` | |
| Label section sidebar (MENU) | 11px | 700 | `--muted` | `letter-spacing: 1px`, UPPERCASE |
| Badge tren | 11px | 700 | semantik | |
| Teks pendukung metrik | 10px | 400 | `--muted` | |
| Username / role | 12px / 10px | 700 / 400 | `--dark` / `--muted` | |
| Tooltip chart | 9px | 700 | putih | |

**Aturan tipografi**
- Hanya weight 400, 500, 600, 700, 800. Jangan 300 atau 900.
- Hierarki dibangun dari **weight + warna**, bukan hanya ukuran. Judul tebal gelap, keterangan tipis dan muted.
- Angka besar selalu 800 dengan letter-spacing negatif.
- Label section selalu uppercase kecil dengan tracking lebar.
- Jangan memakai ukuran di luar skala di atas. Jika perlu ukuran baru, pilih yang terdekat.
- Line-height default browser, kecuali teks multi-baris kecil (promo) yang memakai `1.4`.

---

## 3. Spacing, Radius, Shadow

### Skala spacing
Gunakan kelipatan ini saja: **4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 35**.

| Konteks | Nilai |
|---|---|
| Padding body / jarak luar container | 24px |
| Padding area konten utama | 30px |
| Gap antar section vertikal di konten | 24px |
| Gap grid kartu metrik | 18px |
| Gap kolom insights (kiri–kanan) | 20px |
| Jarak antar card bertumpuk | 20px (`margin-top-md`) |
| Padding card | 24px |
| Padding sidebar | 30px 24px |
| Padding nav item | 12px 16px, gap ikon–teks 14px |
| Gap antar nav item | 6px |
| Jarak antar nav group | 28px |
| Jarak brand ke nav | 35px |
| Margin bawah header card | 20px |
| Gap header actions | 16px |

### Radius

| Elemen | Radius |
|---|---|
| Container dashboard utama | 28px |
| Card | 20px |
| Promo box | 18px |
| Nav item, ikon persegi, promo icon | 10–12px |
| Dropdown, tombol dalam card | 10px |
| Badge, pill profil | 100px / 30px (pill penuh) |
| Tombol ikon bulat, avatar | 50% |
| Batang chart, progress bar | 10px / 2px |

### Shadow (sangat halus)
- Container: `0 10px 40px rgba(0,0,0,0.03)`
- Card: `0 4px 20px rgba(0,0,0,0.015)`
- Tombol ikon / pill profil: `0 4px 10px rgba(0,0,0,0.02)`
- Nav aktif: `0 4px 15px rgba(27,81,244,0.25)` (satu-satunya shadow berwarna)
- Tooltip: `0 4px 12px rgba(0,0,0,0.15)`

**Kartu tidak punya border.** Pemisahan dibuat oleh kontras `--bg-card` (putih) terhadap `--bg-app`. Border (`--border`) hanya untuk: pemisah sidebar, dropdown, dan garis dasar chart.

---

## 4. Layout Shell

```
body (bg --bg-app, padding 24px, flex center)
└── .dashboard-container (max-width 1400px, min-height 850px, putih, radius 28px, overflow hidden, flex)
    ├── .sidebar (260px, --bg-sidebar, border-right 1px --border)
    └── .main-content (flex-grow, --bg-app, padding 30px, flex column, gap 24px)
        ├── .content-header
        ├── .metrics-grid (4 kolom)
        └── .insights-grid (flex: kiri 1.8 : kanan 1)
```

**Responsive**
- `≤1024px`: container jadi kolom, radius 0, sidebar full-width dengan `border-bottom`, metrics 2 kolom, insights bertumpuk.
- `≤580px`: metrics 1 kolom.

---

## 5. Komponen

Gunakan nama kelas yang sama agar konsisten antar halaman.

### 5.1 Sidebar
- Brand: ikon 26px `--primary` + nama 18px/800, `gap: 12px`.
- Grup nav diberi label uppercase (`MENU`, `FINANCIAL`, `TOOLS`, dst.). Menu dikelompokkan, bukan satu daftar panjang.
- `.nav-item`: flex, `gap 14px`, `padding 12px 16px`, `radius 12px`, 14px/600, warna `--muted`, ikon 16px.
- Hover: `background rgba(27,81,244,0.05)`, teks `--primary`.
- **Aktif:** `background --primary`, teks putih, shadow biru. Hanya satu item aktif.
- Promo box (opsional) menempel di bawah dengan `margin-top: auto`, latar `--bg-dark`, teks putih.

### 5.2 Header konten
- Kiri: `h1` 26px/800 + subjudul 13px muted.
- Kanan: tombol ikon bulat 42px (putih, shadow halus), badge dot merah 8px untuk notifikasi, lalu pill profil (avatar 36px + nama 12px/700 + role 10px muted).

### 5.3 Card
```css
.card { background: var(--bg-card); border-radius: 20px; padding: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.015); display: flex; flex-direction: column; }
```

### 5.4 Metric card
- Tinggi tetap 155px, `justify-content: space-between`.
- Baris atas: ikon 36×36 radius 10 (`--bg-subtle`, ikon 16px muted) di kiri, badge tren di kanan.
- Lalu label 11px/600 muted, nilai 26px/800, keterangan 10px muted.
- Varian sorotan `.primary-blue`: latar `--primary`, teks putih, label/sub putih 70%, ikon dalam bulatan `rgba(255,255,255,0.2)`. **Hanya kartu pertama** (metrik terpenting).

### 5.5 Badge tren
- Pill 11px/700, padding `4px 8px`.
- Positif: `--success-bg` + `--success`. Negatif: `--danger-bg` + `--danger`.
- Format: `+2.08%` / `-2.08%` (tanda selalu eksplisit).
- Versi kecil `.trend-sm` untuk dalam baris: 9px, padding `2px 4px`, radius 4px.

### 5.6 Header card (chart-header)
Flex `space-between`, `align-items: flex-start`, `margin-bottom: 20px`. Kiri: judul 16px/700 + subjudul 11px muted. Kanan: **dropdown** filter.

### 5.7 Dropdown
`padding 8px 12px`, `border 1px --border`, radius 10px, 12px/600, putih, ikon chevron-down. Varian `.small`: `6px 10px`, 11px.

### 5.8 Chart
- Legenda: 11px/600 muted, dot 8px, gap 16px.
- Batang: lebar 10px, radius 10px, dua seri berdampingan (`--bar-neutral` + `--primary`), label sumbu 11px/600 muted, garis dasar `1.5px --border`.
- Sumbu Y 10px/600 muted, rata kanan.
- Tooltip: latar `--bg-dark`, teks putih 9px/700, radius 8px, dengan pin segitiga.
- Gauge radial SVG: track `--track`, arc `--primary` / `--purple` / `--primary-light`, stroke 6px, `stroke-linecap: round`, diputar `-90deg`; angka di tengah.
- Progress bar: tinggi 4px, track `--track`, radius 2px.
- Maksimal 3–4 warna per chart, ambil dari token.

### 5.9 List row (kategori, negara, dst.)
Flex `space-between`, 12px/600. Label kiri muted dengan ikon 10px berwarna, nilai kanan `--dark`/700, badge tren kecil mengikuti nilai. Gap antar baris 12px.

### 5.10 Ikon
- **Font Awesome 6 (solid)** via CDN `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`.
- Ukuran: nav 16px, ikon kartu 16px, ikon list 10px.
- Jangan campur dengan lucide/heroicons/emoji. Pengecualian: bendera negara boleh emoji.

---

## 6. Aturan Anti-"Slop"

**DILARANG**
- Gradient dekoratif, glassmorphism, neon glow, shadow tebal.
- Border tebal di sekeliling card, atau outline warna-warni.
- Font selain Plus Jakarta Sans; teks monospace untuk UI.
- Warna hex baru di luar token; warna ungu-pink "AI default".
- Ukuran font di luar skala; spacing acak (mis. 13px, 17px, 22px).
- Banyak tombol biru solid dalam satu viewport (maksimal satu CTA utama per layar + item nav aktif).
- Card dengan radius kecil (<16px) atau sudut tajam.
- Emoji sebagai ikon UI; judul huruf kapital semua (selain label section).
- Lebih dari satu kartu sorotan biru.
- Animasi berlebihan. Hanya transisi `0.2s ease` untuk hover.

**WAJIB**
- Padat tapi lega: padding card 24px, gap konsisten.
- Hierarki jelas: angka besar 800, label kecil muted.
- Setiap angka tren punya tanda `+`/`-` dan warna semantik.
- Teks interaktif punya state hover; tombol punya `cursor: pointer`.
- Tabel/daftar memakai baris 12px dengan pemisah halus `--border`, bukan grid bergaris penuh.

---

## 7. Migrasi Dashboard PeopleCore HRIS Saat Ini

Dashboard saat ini (sidebar putih dengan 14 menu tanpa grup, topbar ber-border, kartu ber-border dengan shadow tebal, tipografi 16–20px, kode karyawan monospace) harus disesuaikan sebagai berikut:

| Area | Kondisi sekarang | Target (mengikuti design system) |
|---|---|---|
| Page shell | Layar penuh putih/abu | Body `--bg-app`, dibungkus `.dashboard-container` radius 28px, max 1400px |
| Sidebar | Putih, tanpa label grup, "Dashboard" aktif biru muda, "Karyawan" tampak aktif/hover abu | `--bg-sidebar`, 260px, **grup berlabel** (mis. `MENU`, `SDM`, `OPERASIONAL`), **satu** item aktif solid `--primary` + teks putih + shadow biru |
| Topbar | Bar putih dengan border bawah memanjang | Dihapus. Pindahkan ke `.content-header` di dalam area konten: tombol ikon bulat (notifikasi) + pill profil (email + role). Tombol **Keluar** masuk menu `TOOLS` atau dropdown profil |
| Judul | "Dashboard Utama" besar, subjudul panjang | h1 26px/800, subjudul 13px muted, **CTA "Kelola Karyawan" tetap di kanan** sebagai satu-satunya tombol biru solid di area konten |
| Kartu statistik (5) | Border + shadow tebal, ikon berwarna-warni | `.metric-card` tanpa border, tinggi 155px, ikon `--bg-subtle`. **"Total Karyawan" = kartu sorotan biru**; 4 lainnya putih. Grid 4 kolom → gunakan 5 kolom (`repeat(5, 1fr)`) di ≥1280px, 2 kolom di ≤1024px, 1 kolom di ≤580px |
| Ikon kartu | Warna beda-beda (biru, hijau, kuning, ungu) | Satu gaya: ikon muted di atas `--bg-subtle`; warna semantik hanya lewat badge tren |
| "Karyawan Terbaru Bergabung" | Daftar dengan kode monospace | Card 20px, header `chart-header` (judul 16px/700 + link "Lihat Semua" 12px/600 `--primary`), baris list 12px, avatar bulat 36px berinisial pada `--bg-subtle`, kode `EMP-…` 11px muted (tabular-nums, bukan monospace), departemen 12px/600, tanggal 10px muted |
| "Aksi Cepat" | Dua kartu bernaungan di dalam card | Baris list di dalam card, ikon 36×36 `--bg-subtle`, judul 12–14px/700, deskripsi 11px muted, chevron muted; hover `rgba(27,81,244,0.05)` |
| Tipografi | Ukuran besar (≈16–22px), font berbeda | Plus Jakarta Sans, skala di bagian 2 |
| Layout bawah | Dua kolom (daftar + aksi cepat) | `.insights-grid` flex 1.8 : 1 |

Urutan kerja yang disarankan:
1. Tambahkan font, Font Awesome, dan blok token ke stylesheet global.
2. Ganti shell (container + sidebar + header).
3. Ganti kartu metrik, lalu card daftar dan aksi cepat.
4. Terapkan pola yang sama ke halaman lain (Karyawan, Organisasi, Kehadiran, dst.).

Pengelompokan menu sidebar yang disarankan untuk HRIS:
- **MENU:** Dashboard, Karyawan, Organisasi
- **SDM:** Kehadiran, Cuti, Kontrak, Kinerja, Rekrutmen, Pelatihan
- **FINANCIAL:** Penggajian
- **TOOLS:** Dokumen, Laporan, Keluar

---

## 8. Pola untuk Halaman Baru

Struktur dasar setiap halaman:

```html
<main class="main-content">
  <header class="content-header">
    <div class="header-title"><h1>Judul Halaman</h1><p class="date-sub">Deskripsi singkat</p></div>
    <div class="header-actions"><!-- ikon, profil, atau 1 CTA utama --></div>
  </header>

  <section class="metrics-grid"><!-- 3–5 metric card, kartu pertama .primary-blue --></section>

  <section class="insights-grid"><!-- card konten: tabel/daftar/chart --></section>
</main>
```

- **Halaman daftar/tabel:** satu `.card` penuh, `chart-header` (judul + filter dropdown + tombol cari), baris 12px dengan pemisah `--border`, kepala kolom 11px/700 uppercase muted.
- **Halaman form:** `.card` 24px, label 11px/600 muted di atas input, input `padding 10px 12px`, border `1px --border`, radius 10px, fokus `border --primary`; tombol utama `--primary` radius 10px 12px/700 putih.
- **Empty state:** ikon `--bg-subtle` 36px, judul 16px/700, deskripsi 11px muted, satu tombol utama.
- **Status/tag** (Aktif, Cuti, Probation): pakai pola badge (pill 11px/700 dengan latar semantik 12%).

---

## 9. Checklist Akhir (wajib sebelum selesai)

- [ ] Font Plus Jakarta Sans dan hanya weight 400–800.
- [ ] Semua warna berasal dari token `:root`.
- [ ] Semua ukuran font ada di skala tipografi.
- [ ] Spacing hanya dari skala (gap 18/20/24, padding card 24).
- [ ] Card radius 20px, tanpa border, shadow sangat halus.
- [ ] Hanya satu kartu sorotan biru dan satu item nav aktif.
- [ ] Sidebar punya grup berlabel uppercase.
- [ ] Ikon Font Awesome, tanpa emoji UI.
- [ ] Badge tren memakai `+`/`-` dan warna semantik.
- [ ] Hover state ada pada elemen interaktif (transisi 0.2s).
- [ ] Responsive 1024px dan 580px diuji.
- [ ] Tidak ada gradient, glow, atau shadow tebal.
