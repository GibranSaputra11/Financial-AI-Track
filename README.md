# Financial AI Track 🚀

Aplikasi web manajemen keuangan pribadi berbasis **Express.js MVC** dan **PostgreSQL** yang dirancang khusus untuk mahasiswa, dilengkapi dengan fitur **AI OCR Scan Struk** (Google Gemini) dan **AI Budgeting Advisor**.

---

## ✨ Fitur Utama
1. **Autentikasi Pengguna**: Register & Login aman dengan hashing `bcrypt` dan session persistent di PostgreSQL (`connect-pg-simple`).
2. **Dashboard Keuangan (Bento Grid UI)**: 
   - Ringkasan Saldo & Target Budget Bulanan.
   - Snapshot AI Akhir Bulan (Sisa hari, jatah harian ideal, status AMAN/WASPADA/KRITIS).
   - Grafik Donat Pengeluaran per Kategori (Kos, Makan, Tugas/Print, Nongkrong, Transportasi, Lainnya).
   - Indikator Rasio Budget Bulanan.
3. **AI OCR Scan Struk**: Upload foto/scan struk belanja, Google Gemini secara otomatis mengekstrak *merchant*, total nominal, kategori, dan tanggal transaksi.
4. **Manajemen Transaksi**: Catat pemasukan/pengeluaran manual, filter, dan hapus transaksi.
5. **AI Budgeting Advisor**: Memberikan saran keuangan personal berdasarkan sisa saldo dan riwayat transaksi agar mahasiswa tidak krisis di akhir bulan.

---

## 🛠 Tech Stack
- **Backend**: Node.js, Express.js (MVC Pattern)
- **Database**: PostgreSQL (via Sequelize ORM & `pg`)
- **Session Store**: `express-session` + `connect-pg-simple`
- **Frontend**: EJS (Embedded JavaScript), Tailwind CSS (CDN), Chart.js, Lucide Icons
- **AI Engine**: Google Gemini API (`@google/genai` - `gemini-3.5-flash`)
- **Upload**: `multer` (Memory Storage)

---

## 📦 Panduan Instalasi (Deployment / Local Setup)

Ikuti langkah-langkah di bawah ini secara berurutan agar instalasi di komputer lokal maupun server produksi berjalan mulus tanpa kendala:

### 1. Prasyarat Sistem
Pastikan di komputer/server Anda sudah terinstal:
- **Node.js** (v18 atau versi terbaru, disarankan v20+)
- **PostgreSQL** (Running dan siap digunakan)

### 2. Clone / Masuk ke Folder Project
```bash
cd "C:\MenPro\Financial AI Track"
```

### 3. Instalasi Dependencies
```bash
npm install
```
*(Catatan: Jika mengalami kendala modul, pastikan `express`, `sequelize`, `pg`, `express-session`, `connect-pg-simple`, `express-ejs-layouts`, `multer`, `express-validator`, dan `@google/genai` terinstal dengan benar di `package.json`).*

### 4. Buat Database Kosong di PostgreSQL
Sebelum menjalankan aplikasi, Anda **wajib** membuat database kosong secara manual di PostgreSQL (misal lewat pgAdmin atau psql):
```sql
CREATE DATABASE financial_ai_track;
```

### 5. Konfigurasi Environment (`.env`)
Buat file `.env` di root project (atau salin dari `.env.example`):
```env
PORT=3000
NODE_ENV=development
TZ=Asia/Jakarta

# Koneksi PostgreSQL (Format: postgresql://user:password@host:port/database)
DATABASE_URL=postgresql://postgres:password@localhost:5432/financial_ai_track

# Secret Session
SESSION_SECRET=financial_ai_track_secret_key_2026

# Google Gemini API Key (Dapatkan di https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```

### 6. Inisialisasi & Sinkronisasi Database
Jalankan perintah sync database untuk membuat tabel-tabel yang diperlukan secara otomatis (`users`, `wallets`, `transactions`, `ai_analysis_logs`, `sessions`):
```bash
npm run db:sync
```
*(Pastikan muncul pesan `✅ Database PostgreSQL terhubung` dan `✅ Database berhasil disinkronkan`).*

### 7. Menjalankan Aplikasi

- **Mode Development (dengan Nodemon)**:
  ```bash
  npm run dev
  ```
- **Mode Produksi**:
  ```bash
  npm start
  ```

Buka browser dan akses: **`http://localhost:3000`**

---

## 💡 Catatan Penting & Troubleshooting (R&D Notes)
1. **Database Creation**: Database PostgreSQL harus dibuat secara manual terlebih dahulu (`CREATE DATABASE`) sebelum menjalankan script `npm run db:sync`.
2. **Model Gemini AI**: Menggunakan `gemini-3.5-flash` dengan respon sanitasi markdown JSON untuk memastikan kecepatan OCR dan kestabilan Structured Output.
3. **Timezone**: Dikonfigurasi otomatis ke `Asia/Jakarta` (`TZ=Asia/Jakarta`) agar pencatatan tanggal transaksi dan perhitungan sisa hari akhir bulan akurat.
