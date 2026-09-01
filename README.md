# Kalkulator Gizi TKPI (Tabel Komposisi Pangan Indonesia 2020)

Aplikasi web kalkulator dan estimasi nilai gizi menu makanan Indonesia berbasis dataset resmi **TKPI 2020** (Tabel Komposisi Pangan Indonesia 2020) dan lembar kerja gizi terstruktur.

Dibangun dengan **Next.js 16 Active LTS**, **React 19**, **TypeScript (Strict Mode)**, **Tailwind CSS**, **shadcn/ui**, **PostgreSQL**, **Drizzle ORM**, **Zod**, dan **Vitest**.

---

## 1. Arsitektur Proyek

Sesuai prinsip perancangan perangkat lunak yang bersih, formula perhitungan gizi dipisahkan secara ketat ke dalam **Domain Layer murni** (framework-independent) dan tidak diletakkan di dalam komponen React UI.

```text
src/
├── app/                                 # Next.js App Router (Layout & Pages)
│   ├── calculator/page.tsx              # Halaman utama kalkulator gizi (/calculator)
│   ├── plans/page.tsx                   # Halaman rencana menu tersimpan (/plans)
│   ├── layout.tsx                       # Root layout & navbar
│   └── page.tsx                         # Redirect / -> /calculator
│
├── domain/                              # Pure TypeScript Domain Layer (Framework-Independent)
│   └── nutrition/
│       ├── calculate-effective-weight.ts # Perhitungan berat efektif (BDD & Mode Berat)
│       ├── calculate-food-nutrients.ts   # Perhitungan nilai gizi per bahan
│       ├── calculate-meal-nutrients.ts   # Subtotal nilai gizi per waktu makan
│       ├── calculate-daily-nutrients.ts  # Total nilai gizi harian
│       ├── calculate-adequacy.ts         # Perhitungan % pemenuhan / asupan
│       ├── format-nutrients.ts           # Format angka & desimal tampilan
│       ├── nutrition.constants.ts        # 21 Definisi zat gizi TKPI & waktu makan
│       ├── nutrition.types.ts            # DTO dan tipe domain
│       └── __tests__/nutrition.test.ts   # Unit test domain gizi (Vitest)
│
├── db/                                  # Database Layer (Drizzle ORM & PostgreSQL)
│   ├── schema/                          # Skema tabel ternormalisasi
│   ├── migrations/                      # File migrasi SQL Drizzle
│   ├── index.ts                         # Koneksi database & client pool
│   └── migrate.ts                       # Skrip eksekusi migrasi otomatis
│
├── features/                            # Feature Modules
│   ├── foods/                           # Pencarian & metadata bahan makanan
│   │   ├── food-search.actions.ts       # Server action autocomplete & status dataset
│   │   └── food.types.ts
│   ├── meal-plans/                      # Manajemen CRUD rencana menu tersimpan
│   │   ├── meal-plan.actions.ts         # Server actions (save, list, get, duplicate, delete)
│   │   ├── meal-plan.schema.ts          # Validasi Zod schema
│   │   └── components/saved-plans-list.tsx
│   └── calculator/                      # Komponen interaktif kalkulator
│       ├── use-calculator.ts            # React client state hook
│       └── components/                  # Header, sections, rows, daily cards, table, dialogs
│
├── components/ui/                       # Primitif UI (Button, Card, Input, Table, Dialog, dll.)
└── scripts/
    └── import-tkpi.ts                   # Skrip importer data Excel TKPI 2020
```

---

## 2. Fitur Utama

- **Pencarian Makanan Cepat & Responsif**: Pencarian instan berdasarkan nama bahan makanan atau kode TKPI (contoh: `nasi`, `ayam`, `AR001`) dengan debounce dan navigasi keyboard.
- **Kalkulasi Nilai Gizi Real-Time**: Perhitungan otomatis dan langsung terbarui saat bahan ditambah, berat diubah, atau mode berat diganti tanpa reload halaman.
- **Dukungan BDD (Bagian Dapat Dimakan)**:
  - **Mode Berat Dimakan (Edible Weight)**: Default, berat yang dimasukkan langsung dihitung.
  - **Mode Berat Kotor (Gross Weight)**: Berat kotor dikonversi otomatis berdasarkan persentase BDD bahan makanan (`beratEfektif = beratKotor * BDD / 100`).
- **Subtotal per Waktu Makan**: Rangkuman makronutrien (Energi, Protein, Lemak, Karbohidrat) untuk 5 sesi makan:
  - Makan Pagi
  - Snack Pagi
  - Makan Siang
  - Snack Sore
  - Makan Malam
- **Ringkasan Gizi Harian & Target Kebutuhan**: Kartu indikator makronutrien dengan progress bar pemenuhan target manual.
- **Tabel 21 Zat Gizi Lengkap**: Rincian komprehensif seluruh 21 komposisi zat gizi TKPI (Energi, Air, Protein, Lemak, Karbohidrat, Serat, Abu, Kalsium, Fosfor, Besi, Natrium, Kalium, Tembaga, Seng, Retinol, Beta-Karoten, Karoten Total, Tiamin, Riboflavin, Niasin, Vitamin C).
- **Manajemen Rencana Menu**: Simpan, buka kembali, edit, duplikasi, dan hapus rencana menu ke database PostgreSQL.
- **Formula & Data Versioning**: Setiap data tersimpan mencatat `TKPI Version: 2020` dan `Formula Version: 1.0.0`.

---

## 3. Persyaratan Sistem & Tech Stack

- **Node.js**: v18.18+ / v20+ / v22+
- **Package Manager**: `pnpm` (disarankan) atau `npm`
- **Database**: PostgreSQL 14+ (atau Docker Compose PostgreSQL)
- **Framework**: Next.js 16 Active LTS (App Router)

---

## 4. Konfigurasi Environment (`.env`)

Salin file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Isi konfigurasi environment:

```env
# Database connection string PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tkpi_nutrition

# Lokasi file Excel TKPI 2020 (opsional jika diletakkan di root project)
TKPI_XLSX_PATH=./EXCEL PERHITUNGAN NILAI GIZI TKPI 2020.xlsx
```

---

## 5. Menjalankan Database PostgreSQL dengan Docker Compose

Untuk menjalankan PostgreSQL di lingkungan lokal melalui Docker:

```bash
docker compose up -d
```

Service PostgreSQL akan berjalan pada `localhost:5432` dengan database `tkpi_nutrition`.

---

## 6. Penempatan File Excel TKPI

Pastikan file workbook:
```text
EXCEL PERHITUNGAN NILAI GIZI TKPI 2020.xlsx
```
diletakkan pada root folder proyek (atau folder `data/source/`).

Jika file tidak ditemukan saat proses impor, skrip akan menampilkan pesan instruksi yang jelas mengenai lokasi peletakan file.

---

## 7. Migrasi Database & Impor Data TKPI

Jalankan perintah berikut secara berurutan:

```bash
# 1. Install dependensi
pnpm install

# 2. Jalankan migrasi database
pnpm db:migrate

# 3. Impor seluruh data bahan makanan dan zat gizi TKPI 2020
pnpm import:tkpi
```

### Hasil Impor:
- **1.131 Bahan Makanan** diproses dan disimpan ke database.
- **21 Zat Gizi Standar TKPI** terpeteksi dan ternormalisasi.
- **23.751 Rekord Komposisi Zat Gizi** berhasil diimpor dengan mempertahankan semantik nilai kosong (`null` tetap `null`, bukan angka 0 palsu).
- Impor bersifat **idempoten** (dapat dijalankan berulang kali tanpa membuat duplikasi data).

---

## 8. Menjalankan Server Pengembangan

```bash
pnpm dev
```

Buka browser pada:
[http://localhost:3000](http://localhost:3000) (otomatis mengarahkan ke `/calculator`).

---

## 9. Menjalankan Pengujian (Testing) & Validasi

```bash
# Menjalankan unit & integration tests (Vitest)
pnpm test

# Menjalankan pengecekan tipe data TypeScript
pnpm typecheck

# Menjalankan linter ESLint
pnpm lint

# Menjalankan build produksi Next.js
pnpm build
```

---

## 10. Formula & Aturan Perhitungan Domain

*Catatan: Aturan domain MVP berikut merupakan asumsi dasar yang siap divalidasi oleh tenaga gizi profesional.*

### A. Berat Efektif (Effective Weight)

1. **Mode Berat Dimakan (Edible Weight)**:
   $$\text{effectiveWeight} = \text{weight}$$
   BDD tidak dikurangkan karena diasumsikan makanan yang ditimbang sudah dalam kondisi bersih/dapat dimakan.

2. **Mode Berat Kotor (Gross Weight)**:
   $$\text{effectiveWeight} = \text{weight} \times \frac{\text{BDD}}{100}$$
   Jika nilai BDD pada data TKPI kosong/tidak tersedia, sistem menghasilkan peringatan terkontrol (*warning*) dan menggunakan berat input sebagai fallback tanpa memalsukan nilai BDD = 100%.

### B. Nilai Kandungan Zat Gizi Bahan

$$\text{nutrientAmount} = \frac{\text{valuePer100g} \times \text{effectiveWeight}}{100}$$

- Nilai gizi yang tidak tercantum pada TKPI tetap dipertahankan sebagai `null` (tidak diketahui) dan tidak diubah menjadi angka 0 secara sembarangan.

### C. Persentase Pemenuhan / Asupan (% Asupan)

$$\text{percentage} = \frac{\text{totalIntake}}{\text{targetRequirement}} \times 100$$

- Jika target bernilai `0`, `null`, `undefined`, atau negatif, fungsi mengembalikan `null` dan UI menampilkan tanda `—` (tidak ada pembagian dengan nol / `NaN` / `Infinity`).

### D. Presisi & Pembulatan Tampilan (Presentation Rounding)

Perhitungan internal dilakukan dengan presisi numerik penuh. Pembulatan hanya diaplikasikan pada saat perenderan UI:
- **Energi**: 0–1 angka desimal (contoh: `1.850` atau `1.850,5` kkal).
- **Makronutrien & Mikronutrien**: Maksimal 2 angka desimal (contoh: `68,45` g).
- **Persentase Asupan**: Maksimal 1 angka desimal (contoh: `88,1%`).

---

## 11. Batasan MVP (Known MVP Limitations)

1. **Target Kebutuhan**: Target kebutuhan gizi dimasukkan secara manual oleh ahli gizi. Belum menyertakan perhitungan AKG otomatis berbasis usia, jenis kelamin, BB/TB, atau kondisi klinis tertentu (akan dikembangkan setelah validasi formula klinis).
2. **Autentikasi**: Belum menyertakan sistem login/multi-tenant (fokus utama MVP adalah validasi ketepatan kalkulasi dan kenyamanan input data gizi).
3. **Ekspor Laporan**: Fitur ekspor PDF dan Excel belum diaktifkan pada tahap MVP.

# kalkulator-gizi
