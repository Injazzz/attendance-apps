# Sistem Manajemen Kehadiran

> 📖 **Dokumentasi Bahasa Inggris:** Tersedia di [README-EN.md](README-EN.md)  
> ⚙️ **Kompatibilitas OS:** Linux, macOS, Windows (PowerShell 7+ / Git Bash)

Sistem manajemen kehadiran yang komprehensif dengan kemampuan pemindaian kode QR yang dibangun dengan **Laravel 12** (backend) dan **React 19** (frontend). Sistem mendukung kontrol akses berbasis peran, pelacakan kehadiran real-time, manajemen lembur, dan berbagai fitur pelaporan.

## ⚡ Quick Start

```bash
# 1. Clone dan masuk direktori
git clone <repository-url>
cd attendance-apps

# 2. Setup backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# 3. Setup frontend (terminal baru)
cd ../frontend
npm install

# 4. Jalankan aplikasi (2 terminal terpisah)
# Terminal 1 - Backend
cd backend && php artisan serve

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Akses aplikasi: **http://localhost:5173**  
Login uji: `supervisor@test.com` / `password`

> ⚠️ **Penting:** Pastikan ekstensi PHP **GD** sudah diinstal untuk pembuatan QR. Lihat [Persyaratan Sistem](#persyaratan-sistem).

---

## Daftar Isi

- [Quick Start](#-quick-start)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi & Setup](#instalasi--setup)
  - [1. Setup Backend](#1-setup-backend)
  - [2. Setup Frontend](#2-setup-frontend)
  - [3. Konfigurasi Database](#3-konfigurasi-database)
- [Fitur Pemindaian QR](#fitur-pemindaian-qr)
- [Peran & Izin Pengguna](#peran--izin-pengguna)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Dokumentasi API](#dokumentasi-api)
- [Troubleshooting](#troubleshooting)

---

## Fitur

### Fitur Utama
✅ **Pemindaian Kode QR untuk Kehadiran**
- Dukungan QR ganda (berbasis token perusahaan & berbasis ID karyawan)
- Verifikasi lokasi GPS real-time (opsional untuk QR berbasis token)
- Pembuatan dan manajemen kode QR
- Manajemen refresh kode QR (rotasi periodik)

✅ **Manajemen Kehadiran**
- Pelacakan clock in/out
- Input kehadiran manual
- Alur kerja persetujuan kehadiran
- Pelacakan waktu sadar zona waktu (Asia/Jakarta)

✅ **Manajemen Lembur**
- Pengajuan permintaan lembur
- Alur kerja persetujuan multi-level
- Pembuatan laporan lembur

✅ **Kontrol Akses Berbasis Peran**
- 7 peran pengguna dengan izin terperinci
- Kustomisasi dashboard per peran
- Rute API berbasis izin

✅ **Pelaporan & Analitik**
- Laporan kehadiran harian, mingguan, bulanan
- Laporan lembur
- Analitik tingkat departemen & karyawan
- Fungsionalitas ekspor Excel

✅ **Manajemen Data Master**
- Manajemen karyawan dengan unggahan foto
- Manajemen departemen dengan kepala departemen
- Manajemen posisi dengan klasifikasi keluarga pekerjaan
- Manajemen situs/lokasi
- Konfigurasi perusahaan

---

## Tech Stack

### Backend
| Komponen | Versi | Tujuan |
|-----------|---------|---------|
| **PHP** | 8.2+ | Bahasa sisi server |
| **Laravel** | 12.0 | Framework web |
| **Laravel Sanctum** | 4.3 | Autentikasi API |
| **Laravel Reverb** | 1.10 | Server WebSocket |
| **Spatie Laravel Permission** | 7.2 | Manajemen RBAC |
| **Maatwebsite Excel** | 3.1 | Ekspor/impor Excel |
| **Simple QRCode** | 4.2 | Pembuatan kode QR |
| **Intervention Image** | 3.0 | Manipulasi gambar |
| **Laravel Media Library** | 11.21 | Manajemen penyimpanan file |
| **Laravel Activity Log** | 4.12 | Pencatatan audit |
| **SQLite/MySQL** | Terbaru | Database |

### Frontend
| Komponen | Versi | Tujuan |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **React** | 19.2 | Framework UI |
| **TypeScript** | Terbaru | Keamanan tipe |
| **Vite** | Terbaru | Alat build |
| **React Router** | 7.14 | Routing |
| **TanStack Query** | 5.96 | Pengambilan data |
| **Tailwind CSS** | 4.2 | Styling |
| **Shadcn/ui** | - | Komponen UI |
| **Zod** | 4.3 | Validasi skema |
| **QR Scanner** | 1.4.2 | Pemindaian kode QR |
| **html5-qrcode** | 2.3.8 | Pemindaian QR alternatif |
| **@zxing** | 0.21.3 | Deteksi barcode/QR |
| **Zustand** | 5.0 | Manajemen state |
| **Axios** | 1.14 | Klien HTTP |
| **Sonner** | 2.0 | Notifikasi toast |
| **Date-fns** | 4.1 | Utilitas tanggal |

---

## Persyaratan Sistem

### Persyaratan Minimum

**Mesin Server/Pengembangan:**
- **OS:** Linux, macOS, atau Windows
- **RAM:** 4GB (8GB direkomendasikan)
- **Disk:** 3GB ruang kosong
- **Git:** Versi terbaru

> **⚠️ Catatan Windows:**
> - Gunakan **PowerShell 7+** atau **Git Bash** (disertakan dengan Git) untuk semua command
> - Jangan gunakan Command Prompt (cmd.exe) klasik, karena beberapa command tidak akan berfungsi
> - Alternatif: Gunakan **Windows Terminal** (tersedia gratis di Microsoft Store)
> - Jika ada masalah, coba gunakan WSL2 (Windows Subsystem for Linux 2)

**Persyaratan Backend:**
- **PHP:** 8.2 atau lebih tinggi
- **Composer:** Versi terbaru
- **Database:** SQLite (default, disertakan), MySQL 8.0+, atau PostgreSQL
- **Ekstensi PHP:** BCMath, Ctype, cURL, DOM, **GD** ⭐ (untuk pembuatan kode QR), Fileinfo, JSON, Mbstring, OpenSSL, PCRE, PDO, Tokenizer, XML

> **⭐ PENTING:** Ekstensi **GD** adalah wajib untuk fitur pembuatan QR. Jika tidak ada, aplikasi akan error saat membuat QR. Lihat [petunjuk instalasi GD](#8-pembuatan-kode-qr-gagal-ekstensi-gd-hilang).

**Persyaratan Frontend:**
- **Node.js:** 18.0 atau lebih tinggi
- **npm:** 9.0 atau lebih tinggi (atau yarn/pnpm)

### Opsional (untuk produksi/fitur lanjutan):
- **Docker** & **Docker Compose** (untuk containerisasi)
- **Redis** (untuk optimasi caching & queue)
- **Pusher** (untuk fitur real-time, atau gunakan Laravel Reverb)

---

## Instalasi & Setup

### Prasyarat
Sebelum memulai, pastikan Anda telah menginstal:
- [Git](https://git-scm.com/downloads)
- [PHP 8.2+](https://www.php.net/downloads)
- [Composer](https://getcomposer.org/download/)
- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

**Verifikasi setup PHP Anda:**

=== "Linux/macOS"
```bash
# Cek versi PHP
php -v

# Cek apakah ekstensi yang diperlukan sudah dimuat (terutama GD untuk QR)
php -m | grep -E 'gd|pdo|mbstring|curl|bcmath'

# Seharusnya menampilkan: gd, PDO, mbstring, curl, bcmath

# Cek semua ekstensi yang diaktifkan
php -m
```

=== "Windows (PowerShell/Git Bash)"
```powershell
# Cek versi PHP
php -v

# Cek apakah ekstensi yang diperlukan sudah dimuat
php -m | findstr /i "gd pdo mbstring curl bcmath"

# Cek semua ekstensi yang diaktifkan
php -m
```

### Clone Repository

```bash
git clone <repository-url>
cd attendance-apps
```

---

### 1. Setup Backend

#### Langkah 1a: Instalasi Dependensi PHP

```bash
cd backend
composer install
```

#### Langkah 1b: Konfigurasi Environment

Salin file template environment dan buat application key baru:

=== "Linux/macOS"
```bash
cp .env.example .env
php artisan key:generate
```

=== "Windows (PowerShell)"
```powershell
Copy-Item .env.example .env
php artisan key:generate
```

#### Langkah 1c: Konfigurasi Variabel Environment

Edit file `.env` dengan konfigurasi Anda:

```env
# Pengaturan Aplikasi
APP_NAME="Sistem Kehadiran"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id

# Konfigurasi Database (SQLite - default)
DB_CONNECTION=sqlite
# DB_DATABASE=/full/path/to/database.sqlite

# Atau gunakan MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=attendance_db
# DB_USERNAME=root
# DB_PASSWORD=password

# Cache & Session
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Broadcasting (untuk fitur real-time)
BROADCAST_CONNECTION=log
# atau gunakan Reverb:
# BROADCAST_CONNECTION=reverb
# REVERB_HOST=localhost
# REVERB_PORT=8080

# Konfigurasi Email (opsional)
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@attendance.local
MAIL_FROM_NAME="${APP_NAME}"

# Penyimpanan File
FILESYSTEM_DISK=local
```

#### Langkah 1d: Setup Database

```bash
# Jalankan migrasi
php artisan migrate

# Isi database dengan data uji (termasuk peran, izin, dan pengguna uji)
php artisan db:seed

# Atau jalankan semua seeder sekaligus
php artisan migrate:fresh --seed
```

**Penting:** Seeder akan membuat:
- Semua grup izin dan izin individual
- 7 peran pengguna (super_admin, admin, hrd, finance, project_manager, supervisor, employee)
- 12 keluarga pekerjaan dengan klasifikasi level
- 6 pengguna uji dengan peran berbeda

#### Langkah 1e: Buat Tautan Penyimpanan

```bash
php artisan storage:link
```

#### Langkah 1f: Bersihkan Cache

```bash
php artisan config:cache
php artisan permission:cache-reset
```

---

### 2. Setup Frontend

#### Langkah 2a: Instalasi Dependensi Node

```bash
cd ../frontend
npm install
```

#### Langkah 2b: Konfigurasi Environment

Buat file `.env.local` di direktori frontend (jika diperlukan):

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME="Sistem Kehadiran"
```

Frontend secara default akan menggunakan `http://localhost:8000` sebagai URL dasar API.

---

### 3. Konfigurasi Database

#### SQLite (Default - Tidak Perlu Setup)
Aplikasi menggunakan SQLite secara default. File database akan dibuat secara otomatis di:
```
backend/database/database.sqlite
```

**Untuk menggunakan SQLite:**
`.env` sudah dikonfigurasi untuk SQLite, cukup jalankan migrasi.

#### Setup MySQL (Opsional)

Jika Anda lebih suka MySQL, perbarui `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=attendance_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

Kemudian jalankan migrasi:
```bash
php artisan migrate --seed
```

---

## Fitur Pemindaian QR

### Gambaran Umum

Sistem pemindaian QR adalah **mekanisme kehadiran inti**. Ini mendukung dua mode QR:

1. **QR Berbasis Token Perusahaan** - Dipindai dari kode QR fisik di kantor
2. **QR Berbasis ID Karyawan** - Unik untuk setiap karyawan

### Library Pemindaian QR yang Digunakan

Frontend menggunakan beberapa library pemindaian QR untuk kompatibilitas:

| Library | Tujuan | Penggunaan |
|---------|--------|-----------|
| **qr-scanner** (1.4.2) | Pemindai QR utama | Deteksi QR berbasis kamera |
| **html5-qrcode** (2.3.8) | Pemindai QR fallback | Deteksi QR backup |
| **@zxing/library** (0.21.3) | Decoding barcode/QR | Parsing QR/barcode |
| **@zxing/browser** (0.1.5) | Deteksi QR browser | Decoding sisi klien |

### Lokasi Komponen Scanner QR

Komponen frontend: [src/pages/qr/QrScannerPage.tsx](frontend/src/pages/qr/QrScannerPage.tsx)

Fitur utama:
```typescript
// Pemindaian QR real-time
- Akses kamera dengan umpan balik audio/vibrasi
- Deteksi mode ganda (token QR & QR ID karyawan)
- Penangkapan lokasi GPS (opsional, untuk QR berbasis token)
- Fallback otomatis antar library scanner
- Penanganan kesalahan untuk browser yang tidak didukung
```

### Endpoint QR Backend

| Endpoint | Metode | Tujuan | Izin |
|----------|--------|--------|------|
| `/api/v1/qr-displays` | GET | Daftar semua tampilan QR | `qr.view` |
| `/api/v1/qr-displays/{id}` | GET | Dapatkan satu tampilan QR | `qr.view` |
| `/api/v1/qr-displays` | POST | Buat tampilan QR | `qr.manage` |
| `/api/v1/qr-displays/{id}` | PATCH | Perbarui tampilan QR | `qr.manage` |
| `/api/v1/qr-displays/{id}` | DELETE | Hapus tampilan QR | `qr.manage` |
| `/api/v1/scanner/submit` | POST | Kirim kehadiran dari pemindaian QR | `attendance.create` |
| `/api/v1/qr/regenerate/{id}` | POST | Regenerasi kode QR | `qr.regenerate` |

### Tabel Database untuk Fitur QR

```sql
-- Tampilan kode QR
qr_displays
  - id
  - site_id
  - company_id
  - qr_type (token|employee_id)
  - qr_token (token unik untuk pembuatan QR)
  - refresh_mode (none|daily|weekly|monthly)
  - last_refreshed_at
  - created_at
  - updated_at

-- Catatan kehadiran dari pemindaian QR
attendances
  - id
  - employee_id
  - date
  - clock_in_time
  - clock_out_time
  - is_late
  - latitude / longitude (koordinat GPS)
  - created_at
  - updated_at
```

### Cara Kerja Pemindaian QR

```
1. Pengguna membuka halaman QR Scanner
2. Meminta izin kamera
3. Mengarahkan kamera ke kode QR
4. Scanner mendeteksi dan mendekode QR
5. Menentukan jenis QR (token atau ID karyawan)
6. Jika berbasis token: Menangkap lokasi GPS (opsional)
7. POST ke /api/v1/scanner/submit dengan data QR
8. Backend memvalidasi dan membuat catatan kehadiran
9. Mengembalikan respons sukses/kesalahan
10. Frontend menampilkan notifikasi toast
11. Dashboard diperbarui secara real-time (via Laravel Reverb)
```

### Testing Fitur QR

**Buat kode QR uji:**
```bash
cd backend
php artisan tinker

# Buat QR berbasis token
$company = Company::first();
$site = $company->sites()->first();
$qrDisplay = QrDisplay::create([
    'site_id' => $site->id,
    'company_id' => $company->id,
    'qr_type' => 'token',
    'qr_token' => Str::random(32),
    'refresh_mode' => 'none'
]);

# Lihat URL kode QR
$qrDisplay->qr_code_url
```

---

## Peran & Izin Pengguna

### Peran Tersedia

| Peran | Deskripsi | Izin Utama |
|------|-----------|-----------|
| **super_admin** | Akses penuh ke sistem | Semua izin |
| **admin** | Tugas administratif | Sebagian besar izin, beberapa pembatasan |
| **hrd** | Operasi HR | Manajemen karyawan, persetujuan kehadiran |
| **finance** | Operasi keuangan | Penggajian, laporan |
| **project_manager** | Pengawasan proyek | Manajemen tim, persetujuan lembur |
| **supervisor** | Pengawasan tim | Pemindaian QR, tampilan kehadiran tim, persetujuan lembur |
| **employee** | Pengguna dasar | Kehadiran pribadi, permintaan cuti |

### Pengguna Uji Default (dari Seeder)

```
Email: superadmin@test.com | Password: password | Peran: super_admin
Email: admin@test.com | Password: password | Peran: admin
Email: hrd@test.com | Password: password | Peran: hrd
Email: finance@test.com | Password: password | Peran: finance
Email: pm@test.com | Password: password | Peran: project_manager
Email: supervisor@test.com | Password: password | Peran: supervisor
Email: employee@test.com | Password: password | Peran: employee
```

### Grup Izin

- **qr** (Pemindaian QR): qr.view, qr.create, qr.manage, qr.regenerate
- **attendance**: attendance.view, attendance.create, attendance.edit, attendance.approve
- **employees**: employees.view, employees.manage
- **sites**: sites.view, sites.manage
- **departments**: departments.view, departments.manage
- **positions**: positions.view, positions.manage
- **overtime**: overtime.view_own, overtime.view_all, overtime.approve_own, overtime.approve_team
- **reports**: reports.daily, reports.weekly, reports.monthly
- **notifications**: notifications.view, notifications.manage
- **dashboard**: dashboard.view

---

## Menjalankan Aplikasi

### Mulai Server Backend

```bash
cd backend

# Opsi 1: Menggunakan server bawaan Laravel
php artisan serve

# Opsi 2: Tentukan host dan port khusus
php artisan serve --host=0.0.0.0 --port=8000

# Server berjalan di: http://localhost:8000
```

### Mulai Server Pengembangan Frontend

Di terminal baru:

```bash
cd frontend

# Instalasi dependensi jika belum dilakukan
npm install

# Mulai server pengembangan
npm run dev

# Frontend berjalan di: http://localhost:5173
```

### Akses Aplikasi

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api/v1
- **Dokumentasi API:** http://localhost:8000

### Login

Gunakan kredensial pengguna uji apa pun di atas. Contoh:

```
Email: supervisor@test.com
Password: password
```

### Testing dengan Ngrok (Untuk Testing Mobile & Remote)

Ngrok memungkinkan Anda mengekspos server pengembangan lokal ke internet, sempurna untuk testing pemindaian QR dengan perangkat mobile sebenarnya.

#### Prasyarat untuk Testing Ngrok

1. **Download & Instal Ngrok:**
   - Kunjungi: https://ngrok.com/download
   - Buat akun gratis dan dapatkan authtoken Anda

2. **Setup Ngrok:**

=== "macOS"
```bash
# Instal menggunakan Homebrew
brew install ngrok

# Konfigurasi authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

=== "Linux (Ubuntu/Debian)"
```bash
# Unduh dan instalasi
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && \
sudo apt update && sudo apt install ngrok

# Konfigurasi authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

=== "Windows (PowerShell)"
```powershell
# Unduh dari website atau gunakan Chocolatey
choco install ngrok

# Atau download manual dari https://ngrok.com/download
# Ekstrak dan jalankan ngrok.exe

# Konfigurasi authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

#### Setup Testing Ngrok Langkah demi Langkah

**Langkah 1: Mulai Server Backend**
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

**Langkah 2: Mulai Server Frontend**
```bash
cd frontend
npm run dev
```

**Langkah 3: Buka Ngrok di Terminal Baru**

```bash
# Ekspos backend pada port 8000
ngrok http 8000 --bind-tls=true
```

Anda akan melihat output seperti:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        us (United States)
Latency                        xx ms
Web Interface                  http://127.0.0.1:4040
Forwarding                     https://xxxx-xxx-xxx-xxx.ngrok.io -> http://localhost:8000
```

**Langkah 4: Perbarui Environment Frontend untuk URL Ngrok**

Buat/Perbarui `frontend/.env.local`:
```env
VITE_API_URL=https://xxxx-xxx-xxx-xxx.ngrok.io/api/v1
VITE_APP_NAME="Sistem Kehadiran"
```

Mulai ulang server frontend:
```bash
cd frontend
npm run dev
```

**Langkah 5: Test pada Perangkat Mobile**

1. **Pada perangkat mobile Anda, akses:**
   - Gunakan ngrok URL di browser mobile
   - Atau teruskan ngrok tunnel terpisah untuk frontend:
     ```bash
     ngrok http 5173
     # Gunakan URL ngrok yang disediakan pada mobile
     ```

2. **Login dengan kredensial uji:**
   ```
   Email: supervisor@test.com
   Password: password
   ```

3. **Navigasi ke halaman QR Scanner dan test:**
   - Izinkan izin kamera
   - Arahkan kamera ke kode QR
   - Test pengajuan kehadiran

#### Testing Fitur Kode QR dengan Ngrok

**URL ngrok akan digunakan oleh perangkat mobile Anda untuk:**
1. Login dan autentikasi
2. Fetch daftar tampilan QR
3. Submit data kehadiran dari pemindaian QR
4. Menerima update real-time via WebSocket

**Contoh panggilan API daftar tampilan QR:**
```bash
curl -X GET "https://xxxx-xxx-xxx-xxx.ngrok.io/api/v1/qr-displays" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### Dashboard Ngrok

Akses dashboard inspeksi Ngrok di: http://127.0.0.1:4040

Di sini Anda dapat:
- Melihat semua permintaan/respons HTTP
- Debug panggilan API dari perangkat mobile
- Inspeksi header dan payload
- Putar ulang permintaan

#### Tip untuk Testing Ngrok

1. **HTTPS diperlukan untuk QR Scanner** - Ngrok menyediakan HTTPS secara default ✓
2. **Jaga terminal ngrok tetap berjalan** - Jangan tutup saat testing
3. **Monitor permintaan** - Gunakan dashboard ngrok (http://127.0.0.1:4040) untuk debug
4. **Testing WebSocket** - Jika menggunakan Laravel Reverb, Anda mungkin perlu konfigurasi ngrok tambahan
5. **Tier gratis memiliki sesi 2 jam** - Upgrade ke pro untuk URL persisten
6. **Perangkat jaringan berbeda** - Baik mobile maupun desktop dapat mengakses URL ngrok yang sama

#### Contoh Alur Testing

```
┌─────────────────────────────────────────────────────────┐
│          Mesin Pengembangan Anda                         │
├─────────────────────────────────────────────────────────┤
│  Terminal 1: Backend (php artisan serve)                │
│  Terminal 2: Frontend (npm run dev)                     │
│  Terminal 3: Ngrok (ngrok http 8000)                   │
└─────────────────────────────────────────────────────────┘
              ↓ (https://xxxx.ngrok.io)
┌─────────────────────────────────────────────────────────┐
│          Perangkat Mobile (Android/iOS)                  │
├─────────────────────────────────────────────────────────┤
│  1. Buka browser: https://xxxx.ngrok.io:5173           │
│  2. Login dengan kredensial uji                         │
│  3. Navigasi ke QR Scanner                             │
│  4. Pindai kode QR dengan kamera perangkat            │
│  5. Kehadiran terekam di dashboard live               │
└─────────────────────────────────────────────────────────┘
```

---

### Build untuk Produksi

**Backend:**
```bash
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Frontend:**
```bash
cd frontend
npm run build

# Output: folder dist/ (siap untuk deployment)
```

---

## Struktur Proyek

### Struktur Backend

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/     # Kontroler API
│   │   ├── Middleware/          # Middleware HTTP
│   │   └── Resources/           # Resource API
│   ├── Models/                  # Model Eloquent
│   ├── Jobs/                    # Pekerjaan antri
│   ├── Events/                  # Kelas event
│   ├── Listeners/               # Pendengar event
│   ├── Services/                # Logika bisnis
│   ├── Repositories/            # Repositori data
│   └── Enums/                   # Enum PHP
├── config/                      # File konfigurasi
├── database/
│   ├── migrations/              # Migrasi database
│   ├── seeders/                 # Seeder database
│   └── factories/               # Factory model
├── routes/
│   ├── api.php                  # Rute API
│   └── web.php                  # Rute web
├── storage/                     # Penyimpanan file
├── tests/                       # Tes PHPUnit
├── .env.example                 # Template environment
├── artisan                      # CLI Artisan
└── composer.json                # Dependensi PHP
```

### Struktur Frontend

```
frontend/
├── src/
│   ├── components/              # Komponen React
│   │   └── layout/              # Komponen layout
│   ├── pages/                   # Komponen halaman
│   │   ├── qr/                  # Halaman pemindaian QR
│   │   ├── attendance/          # Halaman kehadiran
│   │   ├── master/              # Halaman data master
│   │   └── reports/             # Halaman laporan
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Penyimpanan Zustand
│   ├── router/                  # Konfigurasi React Router
│   ├── lib/                     # Fungsi utilitas
│   └── main.tsx                 # Titik masuk
├── public/                      # Aset statis
├── index.html                   # Template HTML
├── vite.config.ts              # Konfigurasi Vite
├── tsconfig.json               # Konfigurasi TypeScript
└── package.json                # Dependensi
```

---

## Dokumentasi API

Proyek menggunakan **Knuckles/Scribe** untuk dokumentasi API otomatis.

### Buat Dokumentasi API

```bash
cd backend
php artisan scribe:generate
```

### Akses Dokumentasi API

Setelah dibuat, kunjungi: `http://localhost:8000`

### Endpoint API Utama

**Autentikasi:**
- `POST /api/v1/auth/login` - Login pengguna
- `POST /api/v1/auth/logout` - Logout pengguna
- `GET /api/v1/auth/me` - Dapatkan pengguna saat ini

**Pemindaian QR:**
- `GET /api/v1/qr-displays` - Daftar tampilan QR
- `POST /api/v1/scanner/submit` - Kirim kehadiran dari QR
- `POST /api/v1/qr/regenerate/{id}` - Regenerasi kode QR

**Kehadiran:**
- `GET /api/v1/attendances` - Daftar kehadiran
- `POST /api/v1/attendances` - Buat kehadiran manual
- `GET /api/v1/attendances/{id}` - Dapatkan detail kehadiran

**Data Master:**
- `GET /api/v1/employees` - Daftar karyawan
- `GET /api/v1/departments` - Daftar departemen
- `GET /api/v1/positions` - Daftar posisi
- `GET /api/v1/sites` - Daftar situs
- `GET /api/v1/job-families` - Daftar keluarga pekerjaan

---

## Troubleshooting

### Masalah Umum

#### 1. Kesalahan Koneksi Database
```
Kesalahan: SQLSTATE[HY000]: General error: 1

Solusi:
- Pastikan database.sqlite ada di direktori backend/
- Periksa izin file: chmod 755 backend/database/ (Linux/macOS)
- Verifikasi path DB_DATABASE di .env benar
- Windows: Pastikan folder tidak dialokasikan oleh proses lain
```

#### 2. Izin Ditolak pada Penyimpanan/Upload
```
Kesalahan: Permission denied writing to /path/to/storage/

Solusi:
php artisan storage:link
# Linux/macOS
chmod -R 755 storage/
chmod -R 755 public/storage/

# Windows: Klik kanan folder → Properties → Security → Edit permissions
```

#### 3. Kesalahan CORS (Cross-Origin)
```
Kesalahan: Access to XMLHttpRequest blocked by CORS policy

Solusi:
- Verifikasi CORS_ALLOWED_ORIGINS di .env
- Periksa config/cors.php mengizinkan origin frontend
- Pastikan respons API menyertakan header CORS
- Jika menggunakan ngrok, tambahkan ke CORS_ALLOWED_ORIGINS
```

#### 4. QR Scanner Tidak Bekerja
```
Kesalahan: Izin kamera ditolak atau scanner tidak menginisialisasi

Solusi:
- Pastikan HTTPS digunakan (pemindai QR memerlukan konteks aman)
- Periksa browser console untuk kesalahan (API Permissions)
- Coba pemindai alternatif (aplikasi menggunakan beberapa library)
- Pastikan akses kamera diberikan
- Periksa kompatibilitas browser (Chrome/Firefox/Safari)
- Ngrok: Pastikan menggunakan https:// bukan http://
```

#### 5. Masalah Cache Izin Spatie
```
Kesalahan: Izin ditolak meskipun pengguna memiliki izin

Solusi:
php artisan permission:cache-reset
php artisan cache:clear
```

#### 6. Kesalahan Build Frontend
```
Kesalahan: Modul tidak ditemukan atau build gagal

Solusi:
# Linux/macOS
rm -rf node_modules package-lock.json
npm install
npm run build

# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run build
```

#### 7. Port Sudah Digunakan
```
Kesalahan: Port 8000 (atau 5173) sudah digunakan

Solusi:
# Untuk backend (gunakan port berbeda):
php artisan serve --port=8001

# Untuk frontend (Vite secara otomatis memilih port jika 5173 sibuk):
npm run dev
```

#### 8. Pembuatan Kode QR Gagal (Ekstensi GD Hilang)
```
Kesalahan: Ekstensi GD PHP tidak diinstal/diaktifkan

Kesalahan ini terjadi saat mencoba membuat kode QR karena paket 
simple-qrcode memerlukan library grafis GD.

Solusi:

# Periksa apakah GD sudah terinstal
php -m | grep gd
# atau
php -i | grep -A 5 GD

# Jika GD belum terinstal, instal:

=== "Ubuntu/Debian"
sudo apt-get update
sudo apt-get install php8.2-gd
# (ganti 8.2 dengan versi PHP Anda)

=== "macOS (dengan Homebrew)"
brew install php@8.2
# GD biasanya sudah pre-installed

=== "CentOS/RHEL"
sudo yum install php-gd

=== "Windows"
# Edit php.ini dan uncomment:
; extension=gd
# Kemudian restart Apache atau PHP

# Verifikasi GD diaktifkan
php -r "echo extension_loaded('gd') ? 'GD aktif' : 'GD TIDAK aktif';"

# Restart layanan PHP
# Linux/macOS: php artisan serve (akan mengambil ekstensi baru)
# Nginx: sudo systemctl restart php-fpm
# Apache: sudo systemctl restart apache2
```

### Mode Debug

**Aktifkan pencatatan debug:**
```env
# Backend
APP_DEBUG=true
LOG_LEVEL=debug
```

**Periksa log Laravel:**

=== "Linux/macOS"
```bash
tail -f backend/storage/logs/laravel.log
```

=== "Windows (PowerShell)"
```powershell
Get-Content backend/storage/logs/laravel.log -Wait
```

---

## Sumber Daya Tambahan

### Link Dokumentasi
- [Dokumentasi Laravel](https://laravel.com/docs)
- [Dokumentasi React](https://react.dev)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)
- [Dokumentasi React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Mendapatkan Bantuan

1. Periksa bagian troubleshooting di atas
2. Tinjau log Laravel: `backend/storage/logs/laravel.log`
3. Periksa browser console untuk kesalahan frontend
4. Jalankan tes untuk memverifikasi integritas sistem: `php artisan test`

---

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.

---

## Dukungan

Untuk masalah atau pertanyaan, harap buat issue di repository atau hubungi tim pengembangan.

**Terakhir Diperbarui:** April 2026
**Versi:** 1.0.0
