# Attendance Management System

A comprehensive attendance management system with QR code scanning capabilities built with **Laravel 12** (backend) and **React 19** (frontend). The system supports role-based access control, real-time attendance tracking, overtime management, and various reporting features.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation & Setup](#installation--setup)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Database Configuration](#3-database-configuration)
- [QR Scanning Feature](#qr-scanning-feature)
- [Personal Attendance Report](#personal-attendance-report)
- [User Roles & Permissions](#user-roles--permissions)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## Features

### Core Features

✅ **QR Code Scanning for Attendance**

- Dual QR code support (Company token-based & Employee ID-based)
- Real-time GPS location verification (optional for token-based QR)
- QR code generation and management
- QR code refresh management (periodic rotation)

✅ **Attendance Management**

- Clock in/out tracking
- Manual attendance input
- Attendance approval workflow
- Timezone-aware time tracking (Asia/Jakarta)

✅ **Overtime Management**

- Overtime request submission
- Multi-level approval workflow
- Overtime report generation

✅ **Role-Based Access Control**

- 7 user roles with granular permissions
- Dashboard customization per role
- Permission-based API routes

✅ **Reporting & Analytics**

- Daily, Weekly, Monthly attendance reports
- **Personal Attendance Report** - Detailed attendance report for each employee with comprehensive statistics
- PDF export for personal reports
- Overtime reports
- Department & employee-level analytics
- Excel export functionality

✅ **Master Data Management**

- Employee management with photo uploads
- Department management with department heads
- Position management with job family classification
- Site/Location management
- Company configuration

---

## Tech Stack

### Backend

| Component                     | Version | Purpose                   |
| ----------------------------- | ------- | ------------------------- |
| **PHP**                       | 8.2+    | Server-side language      |
| **Laravel**                   | 12.0    | Web framework             |
| **Laravel Sanctum**           | 4.3     | API authentication        |
| **Laravel Reverb**            | 1.10    | WebSocket server          |
| **Spatie Laravel Permission** | 7.2     | RBAC management           |
| **Maatwebsite Excel**         | 3.1     | Excel export/import       |
| **Simple QRCode**             | 4.2     | QR code generation        |
| **Intervention Image**        | 3.0     | Image manipulation        |
| **Laravel Media Library**     | 11.21   | File storage management   |
| **Laravel Activity Log**      | 4.12    | Audit logging             |
| **Barryvdh DomPDF**           | 3.1+    | PDF generation from Blade |
| **SQLite/MySQL**              | Latest  | Database                  |

### Frontend

| Component          | Version | Purpose                 |
| ------------------ | ------- | ----------------------- |
| **Node.js**        | 18+     | Runtime                 |
| **React**          | 19.2    | UI framework            |
| **TypeScript**     | Latest  | Type safety             |
| **Vite**           | Latest  | Build tool              |
| **React Router**   | 7.14    | Routing                 |
| **TanStack Query** | 5.96    | Data fetching           |
| **Tailwind CSS**   | 4.2     | Styling                 |
| **Shadcn/ui**      | -       | UI components           |
| **Zod**            | 4.3     | Schema validation       |
| **QR Scanner**     | 1.4.2   | QR code scanning        |
| **html5-qrcode**   | 2.3.8   | Alternative QR scanning |
| **@zxing**         | 0.21.3  | Barcode/QR detection    |
| **Zustand**        | 5.0     | State management        |
| **Axios**          | 1.14    | HTTP client             |
| **Sonner**         | 2.0     | Toast notifications     |
| **Date-fns**       | 4.1     | Date utilities          |

---

## System Requirements

### Minimum Requirements

**Server/Development Machine:**

- **OS:** Linux, macOS, or Windows (with WSL2)
- **RAM:** 4GB (8GB recommended)
- **Disk:** 3GB free space
- **Git:** Latest version

**Backend Requirements:**

- **PHP:** 8.2 or higher
- **Composer:** Latest version
- **Database:** SQLite (default, included), MySQL 8.0+, or PostgreSQL
- **Extensions:** BCMath, Ctype, cURL, DOM, **GD** (for QR code generation), Fileinfo, JSON, Mbstring, OpenSSL, PCRE, PDO, Tokenizer, XML

**Frontend Requirements:**

- **Node.js:** 18.0 or higher
- **npm:** 9.0 or higher (or yarn/pnpm)

### Optional (for production/advanced features):

- **Docker** & **Docker Compose** (for containerization)
- **Redis** (for caching & queue optimization)
- **Pusher** (for real-time features, or use Laravel Reverb)

---

## Installation & Setup

### Prerequisites

Before starting, ensure you have:

- [Git](https://git-scm.com/downloads) installed
- [PHP 8.2+](https://www.php.net/downloads) installed
- [Composer](https://getcomposer.org/download/) installed
- [Node.js 18+](https://nodejs.org/) installed
- [npm](https://www.npmjs.com/) installed

**Verify your PHP setup:**

```bash
# Check PHP version
php -v

# Check if required extensions are loaded (especially GD for QR codes)
php -m | grep -E 'gd|pdo|mbstring|curl|bcmath'

# Should show: gd, PDO, mbstring, curl, bcmath

# Check all enabled extensions
php -m
```

### Clone the Repository

```bash
git clone <repository-url>
cd attendance-apps
```

---

### 1. Backend Setup

#### Step 1a: Install PHP Dependencies

```bash
cd backend
composer install
```

#### Step 1b: Environment Configuration

Copy the example environment file and generate a new application key:

```bash
cp .env.example .env
php artisan key:generate
```

#### Step 1c: Configure Environment Variables

Edit `.env` file with your configuration:

```env
# Application Settings
APP_NAME="Attendance System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id

# Database Configuration (SQLite - default)
DB_CONNECTION=sqlite
# DB_DATABASE=/full/path/to/database.sqlite

# Or use MySQL:
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

# Broadcasting (for real-time features)
BROADCAST_CONNECTION=log
# or use Reverb:
# BROADCAST_CONNECTION=reverb
# REVERB_HOST=localhost
# REVERB_PORT=8080

# Mail Configuration (optional)
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@attendance.local
MAIL_FROM_NAME="${APP_NAME}"

# File Storage
FILESYSTEM_DISK=local
```

#### Step 1d: Setup Database

```bash
# Run migrations
php artisan migrate

# Seed the database with test data (includes roles, permissions, and test users)
php artisan db:seed

# Or run all seeders at once
php artisan migrate:fresh --seed
```

**Important:** The seeders will create:

- All permission groups and individual permissions
- 7 user roles (super_admin, admin, hrd, finance, project_manager, supervisor, employee)
- 12 job families with level classifications
- 6 test users with different roles (for testing)

#### Step 1e: Generate Storage Link

```bash
php artisan storage:link
```

#### Step 1f: Clear Cache

```bash
php artisan config:cache
php artisan permission:cache-reset
```

---

### 2. Frontend Setup

#### Step 2a: Install Node Dependencies

```bash
cd ../frontend
npm install
```

#### Step 2b: Environment Configuration

Create `.env.local` in the frontend directory (if needed):

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME="Attendance System"
```

The frontend will use `http://localhost:8000` as the API base URL by default.

---

### 3. Database Configuration

#### SQLite (Default - No Setup Required)

The application uses SQLite by default. The database file will be created automatically in:

```
backend/database/database.sqlite
```

**To use SQLite:**
The `.env` already has SQLite configured, just run migrations.

#### MySQL Setup (Optional)

If you prefer MySQL, update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=attendance_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

Then run migrations:

```bash
php artisan migrate --seed
```

---

## QR Scanning Feature

### Overview

The QR scanning system is the **core attendance mechanism**. It supports two QR modes:

1. **Company Token-Based QR** - Scanned from a physical QR code at the office
2. **Employee ID-based QR** - Unique to each employee

### QR Scanning Libraries Used

The frontend uses multiple QR scanning libraries for compatibility:

| Library                     | Purpose              | Usage                     |
| --------------------------- | -------------------- | ------------------------- |
| **qr-scanner** (1.4.2)      | Primary QR scanner   | Camera-based QR detection |
| **html5-qrcode** (2.3.8)    | Fallback QR scanner  | Backup QR detection       |
| **@zxing/library** (0.21.3) | Barcode/QR decoding  | QR/barcode parsing        |
| **@zxing/browser** (0.1.5)  | Browser QR detection | Client-side decoding      |

### QR Scanner Location

Frontend component: [src/pages/qr/QrScannerPage.tsx](frontend/src/pages/qr/QrScannerPage.tsx)

Key features:

```typescript
// Real-time QR scanning
- Camera access with audio/vibration feedback
- Dual mode detection (token QR & employee ID QR)
- GPS location capture (optional, for token-based QR)
- Automatic fallback between scanner libraries
- Error handling for unsupported browsers
```

### Backend QR Endpoints

| Endpoint                     | Method | Purpose                        | Permission          |
| ---------------------------- | ------ | ------------------------------ | ------------------- |
| `/api/v1/qr-displays`        | GET    | List all QR displays           | `qr.view`           |
| `/api/v1/qr-displays/{id}`   | GET    | Get single QR display          | `qr.view`           |
| `/api/v1/qr-displays`        | POST   | Create QR display              | `qr.manage`         |
| `/api/v1/qr-displays/{id}`   | PATCH  | Update QR display              | `qr.manage`         |
| `/api/v1/qr-displays/{id}`   | DELETE | Delete QR display              | `qr.manage`         |
| `/api/v1/scanner/submit`     | POST   | Submit attendance from QR scan | `attendance.create` |
| `/api/v1/qr/regenerate/{id}` | POST   | Regenerate QR code             | `qr.regenerate`     |

### Database Tables for QR Feature

```sql
-- QR code displays
qr_displays
  - id
  - site_id
  - company_id
  - qr_type (token|employee_id)
  - qr_token (unique token for QR generation)
  - refresh_mode (none|daily|weekly|monthly)
  - last_refreshed_at
  - created_at
  - updated_at

-- Attendance records from QR scan
attendances
  - id
  - employee_id
  - date
  - clock_in_time
  - clock_out_time
  - is_late
  - latitude / longitude (GPS coords)
  - created_at
  - updated_at
```

### How QR Scanning Works

```
1. User opens QR Scanner page
2. Requests camera permission
3. Points camera at QR code
4. Scanner detects and decodes QR
5. Determines QR type (token or employee ID)
6. If token-based: Captures GPS location (optional)
7. POSTs to /api/v1/scanner/submit with QR data
8. Backend validates and creates attendance record
9. Returns success/error response
10. Frontend shows toast notification
11. Dashboard updates in real-time (via Laravel Reverb)
```

### Testing QR Feature

**Generate test QR codes:**

```bash
cd backend
php artisan tinker

# Generate token-based QR
$company = Company::first();
$site = $company->sites()->first();
$qrDisplay = QrDisplay::create([
    'site_id' => $site->id,
    'company_id' => $company->id,
    'qr_type' => 'token',
    'qr_token' => Str::random(32),
    'refresh_mode' => 'none'
]);

# View the QR code
$qrDisplay->qr_code_url
```

---

## Personal Attendance Report

### Overview

Personal Attendance Report allows each employee to view and download their personal attendance report with comprehensive statistics and PDF export.

### Key Features

✅ **Personal Report Dashboard**

- Access to `/attendance/report`
- Monthly attendance report view
- Month navigation: previous/next months
- Quick stats with info cards
- Daily attendance detail list

✅ **Available Statistics**

- Total working days in period
- Attendance count & percentage
- Late count & total late minutes
- Absent, Leave, Sick, Half day counts
- Total working hours & overtime hours

✅ **Daily Attendance Details**

- Date and day of week
- Status (Present, Late, Absent, Leave, Sick, Half Day)
- Check-in & check-out times
- Total working hours & overtime
- Late & early minutes
- Location/Site
- Notes

✅ **PDF Export**

- Export button to download report
- PDF contains all data and statistics
- Professional formatting with styling
- Filename: `Laporan-Absensi-[Name]-[StartDate]-to-[EndDate].pdf`

✅ **Responsive Design**

- Desktop: Table view for detailed data
- Mobile: Card view for better UX

### Access & Security

- ✅ Only authenticated users can view their own reports
- ✅ Data filtered by user's `employee_id`
- ✅ No special permissions required (accessible to all employees)
- ✅ Sanctum authentication required
- ✅ Device validation via `X-Browser-Token` header

### API Endpoints

| Endpoint                                     | Method | Description                       | Authentication |
| -------------------------------------------- | ------ | --------------------------------- | -------------- |
| `/api/v1/attendance-report/my-report`        | GET    | Retrieve user's attendance report | Sanctum        |
| `/api/v1/attendance-report/my-report/export` | GET    | Export attendance report to PDF   | Sanctum        |

**Query Parameters:**

- `start_date` (optional): Format `Y-m-d` (example: `2026-04-01`)
- `end_date` (optional): Format `Y-m-d` (example: `2026-04-30`)
- `month` (optional): Format `Y-m` (example: `2026-04`) - Alternative to start/end date

### API Request Examples

**Get Report for April 2026:**

```bash
curl -X GET "http://localhost:8000/api/v1/attendance-report/my-report?month=2026-04" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Browser-Token: YOUR_BROWSER_TOKEN"
```

**Export to PDF:**

```bash
curl -X GET "http://localhost:8000/api/v1/attendance-report/my-report/export?month=2026-04" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Browser-Token: YOUR_BROWSER_TOKEN" \
  --output "report.pdf"
```

**Get Report for Custom Date Range:**

```bash
curl -X GET "http://localhost:8000/api/v1/attendance-report/my-report?start_date=2026-04-01&end_date=2026-04-30" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Browser-Token: YOUR_BROWSER_TOKEN"
```

### API Response Format

**Success (200):**

```json
{
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "full_name": "John Doe",
      "employee_code": "2024001",
      "department": {
        "id": 1,
        "dept_name": "Information Technology"
      },
      "position": {
        "id": 1,
        "position_name": "Developer"
      }
    },
    "period": {
      "start_date": "2026-04-01",
      "end_date": "2026-04-30",
      "start_date_formatted": "01 April 2026",
      "end_date_formatted": "30 April 2026"
    },
    "statistics": {
      "total_records": 22,
      "present": 20,
      "late": 2,
      "absent": 0,
      "leave": 0,
      "sick": 0,
      "half_day": 0,
      "total_hours": 176.5,
      "regular_hours": 174,
      "overtime_hours": 2.5,
      "total_late_minutes": 15,
      "total_early_minutes": 0,
      "attendance_rate": 90.9
    },
    "records": [
      {
        "id": 1,
        "attendance_date": "2026-04-30",
        "date_formatted": "30 April 2026",
        "day_name": "Wednesday",
        "check_in_time": "08:15:00",
        "check_out_time": "17:30:00",
        "total_hours": 9.25,
        "regular_hours": 9,
        "overtime_hours": 0.25,
        "late_minutes": 15,
        "early_minutes": 0,
        "status": "late",
        "status_label": "Terlambat",
        "site": {
          "id": 1,
          "site_name": "Head Office"
        },
        "notes": null
      }
    ]
  },
  "message": "Attendance report retrieved successfully"
}
```

**Error (401):**

```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null
}
```

### Frontend File Structure

**Page Component:**

- [src/pages/attendance/AttendanceReportPage.tsx](frontend/src/pages/attendance/AttendanceReportPage.tsx)

**API Integration:**

- [src/lib/api.ts](frontend/src/lib/api.ts) - `attendanceReportApi`

**Custom Hook:**

- [src/hooks/useAttendance.ts](frontend/src/hooks/useAttendance.ts) - `useAttendanceReport`

**Router:**

- [src/router/index.tsx](frontend/src/router/index.tsx) - Route `/attendance/report`

**Navigation:**

- [src/components/layout/Sidebar.tsx](frontend/src/components/layout/Sidebar.tsx) - Absensi submenu
- [src/components/layout/MobileNav.tsx](frontend/src/components/layout/MobileNav.tsx) - Mobile drawer

### Backend File Structure

**Controller:**

- [app/Http/Controllers/Api/AttendanceReportController.php](backend/app/Http/Controllers/Api/AttendanceReportController.php)

**Routes:**

- [routes/api.php](backend/routes/api.php) - Prefix `attendance-report`

**Blade View for PDF:**

- [resources/views/pdf/attendance-report.blade.php](backend/resources/views/pdf/attendance-report.blade.php)

### PDF Customization

Edit the Blade view to customize PDF appearance:

```blade
<!-- Header -->
<h1>Attendance Report</h1>

<!-- Employee Info -->
Name: {{ $employee->full_name }}
Employee Code: {{ $employee->employee_code }}
Department: {{ $employee->department->dept_name }}

<!-- Statistics Cards -->
<!-- Period Info -->
<!-- Records Table -->
```

---

## User Roles & Permissions

### Available Roles

| Role                | Description          | Key Permissions                                      |
| ------------------- | -------------------- | ---------------------------------------------------- |
| **super_admin**     | Full system access   | All permissions                                      |
| **admin**           | Administrative tasks | Most permissions, some restrictions                  |
| **hrd**             | HR operations        | Employee management, attendance approval             |
| **finance**         | Finance operations   | Payroll, reports                                     |
| **project_manager** | Project oversight    | Team management, overtime approval                   |
| **supervisor**      | Team supervision     | QR scanning, team attendance view, overtime approval |
| **employee**        | Basic user           | Personal attendance, leave requests                  |

### Default Test Users (from Seeder)

```
Email: superadmin@test.com | Password: password | Role: super_admin
Email: admin@test.com | Password: password | Role: admin
Email: hrd@test.com | Password: password | Role: hrd
Email: finance@test.com | Password: password | Role: finance
Email: pm@test.com | Password: password | Role: project_manager
Email: supervisor@test.com | Password: password | Role: supervisor
Email: employee@test.com | Password: password | Role: employee
```

### Permission Groups

- **qr** (QR scanning): qr.view, qr.create, qr.manage, qr.regenerate
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

## Running the Application

### Start Backend Server

```bash
cd backend

# Option 1: Using Laravel's built-in server
php artisan serve

# Option 2: Using Composer script (if available)
composer serve

# Server runs at: http://localhost:8000
```

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend

# Install dependencies if not done
npm install

# Start development server
npm run dev

# Frontend runs at: http://localhost:5173
```

### Access the Application

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api/v1
- **API Docs:** http://localhost:8000 (API documentation via Scribe)

### Login

Use any of the test user credentials above. Example:

```
Email: supervisor@test.com
Password: password
```

### Testing with Ngrok (For Mobile & Remote Testing)

Ngrok allows you to expose your local development server to the internet, making it perfect for testing QR scanning with actual mobile devices.

#### Prerequisites for Ngrok Testing

1. **Download & Install Ngrok:**
   - Visit: https://ngrok.com/download
   - Create a free account and get your authtoken

2. **Setup Ngrok:**

   ```bash
   # Install ngrok on your system
   # macOS
   brew install ngrok

   # Linux
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
   echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && \
   sudo apt update && sudo apt install ngrok

   # Windows - Download from website or use Chocolatey
   choco install ngrok

   # Configure authtoken
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

#### Step-by-Step Ngrok Testing

**Step 1: Start Backend Server**

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

**Step 2: Start Frontend Dev Server**

```bash
cd frontend
npm run dev
# Frontend will run at http://localhost:5173
```

**Step 3: Open Ngrok in a New Terminal**

```bash
# Expose your backend on port 8000
ngrok http 8000 --bind-tls=true
```

You'll see output like:

```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        us (United States)
Latency                        xx ms
Web Interface                  http://127.0.0.1:4040
Forwarding                     https://xxxx-xxx-xxx-xxx.ngrok.io -> http://localhost:8000
```

**Step 4: Update Frontend Environment for Ngrok URL**

Create/Update `frontend/.env.local`:

```env
VITE_API_URL=https://xxxx-xxx-xxx-xxx.ngrok.io/api/v1
VITE_APP_NAME="Attendance System"
```

Restart the frontend dev server:

```bash
cd frontend
npm run dev
```

**Step 5: Test on Mobile Device**

1. **On your mobile device, access:**
   - Frontend URL: http://localhost:5173 (if on same network)
   - Or forward another ngrok tunnel for frontend:
     ```bash
     ngrok http 5173
     # Use the provided ngrok URL on mobile
     ```

2. **Login with test credentials:**

   ```
   Email: supervisor@test.com
   Password: password
   ```

3. **Navigate to QR Scanner page and test:**
   - Allow camera permission
   - Point camera at QR code
   - Test attendance submission

#### Testing QR Code Features with Ngrok

**The ngrok URL will be used by your mobile device to:**

1. Login and authenticate
2. Fetch QR displays list
3. Submit attendance data from QR scan
4. Receive real-time updates via WebSocket

**Example QR Display list API call:**

```bash
curl -X GET "https://xxxx-xxx-xxx-xxx.ngrok.io/api/v1/qr-displays" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### Ngrok Dashboard

Access the Ngrok inspection dashboard at: http://127.0.0.1:4040

Here you can:

- View all HTTP requests/responses
- Debug API calls from mobile device
- Inspect headers and payloads
- Replay requests

#### Tips for Ngrok Testing

1. **HTTPS is required for QR Scanner** - Ngrok provides HTTPS by default ✓
2. **Keep ngrok terminal running** - Don't close it while testing
3. **Monitor requests** - Use ngrok dashboard (http://127.0.0.1:4040) to debug
4. **WebSocket testing** - If using Laravel Reverb, you may need additional ngrok config
5. **Free tier has 2-hour sessions** - Upgrade to pro for persistent URLs
6. **Different network devices** - Both mobile and desktop can access same ngrok URL

#### Testing Workflow Example

```
┌─────────────────────────────────────────────────────────┐
│          Your Development Machine                        │
├─────────────────────────────────────────────────────────┤
│  Terminal 1: Backend (php artisan serve)                │
│  Terminal 2: Frontend (npm run dev)                     │
│  Terminal 3: Ngrok (ngrok http 8000)                   │
└─────────────────────────────────────────────────────────┘
              ↓ (https://xxxx.ngrok.io)
┌─────────────────────────────────────────────────────────┐
│          Mobile Device (Android/iOS)                     │
├─────────────────────────────────────────────────────────┤
│  1. Open browser: https://xxxx.ngrok.io:5173           │
│  2. Login with test credentials                         │
│  3. Navigate to QR Scanner                             │
│  4. Scan QR code with device camera                    │
│  5. Attendance recorded in live dashboard              │
└─────────────────────────────────────────────────────────┘
```

---

### Building for Production

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

# Output: dist/ folder (ready for deployment)
```

---

## Project Structure

### Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/     # API controllers
│   │   ├── Middleware/          # HTTP middleware
│   │   └── Resources/           # API resources
│   ├── Models/                  # Eloquent models
│   ├── Jobs/                    # Queued jobs
│   ├── Events/                  # Event classes
│   ├── Listeners/               # Event listeners
│   ├── Services/                # Business logic
│   ├── Repositories/            # Data repositories
│   └── Enums/                   # PHP enums
├── config/                      # Configuration files
├── database/
│   ├── migrations/              # Database migrations
│   ├── seeders/                 # Database seeders
│   └── factories/               # Model factories
├── routes/
│   ├── api.php                  # API routes
│   └── web.php                  # Web routes
├── storage/                     # File storage
├── tests/                       # PHPUnit tests
├── .env.example                 # Environment template
├── artisan                      # Artisan CLI
└── composer.json                # PHP dependencies
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/              # React components
│   │   └── layout/              # Layout components
│   ├── pages/                   # Page components
│   │   ├── qr/                  # QR scanning pages
│   │   ├── attendance/          # Attendance pages
│   │   ├── master/              # Master data pages
│   │   └── reports/             # Report pages
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand stores
│   ├── router/                  # React Router config
│   ├── lib/                     # Utility functions
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## API Documentation

The project uses **Knuckles/Scribe** for automatic API documentation.

### Generate API Docs

```bash
cd backend
php artisan scribe:generate
```

### Access API Documentation

Once generated, visit: `http://localhost:8000`

### Key API Endpoints

**Authentication:**

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

**QR Scanning:**

- `GET /api/v1/qr-displays` - List QR displays
- `POST /api/v1/scanner/submit` - Submit attendance from QR
- `POST /api/v1/qr/regenerate/{id}` - Regenerate QR code

**Attendance:**

- `GET /api/v1/attendances` - List attendances
- `POST /api/v1/attendances` - Create manual attendance
- `GET /api/v1/attendances/{id}` - Get attendance details

**Personal Attendance Report:**

- `GET /api/v1/attendance-report/my-report` - Get user's attendance report
- `GET /api/v1/attendance-report/my-report/export` - Export attendance report to PDF

**Master Data:**

- `GET /api/v1/employees` - List employees
- `GET /api/v1/departments` - List departments
- `GET /api/v1/positions` - List positions
- `GET /api/v1/sites` - List sites
- `GET /api/v1/job-families` - List job families

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```
Error: SQLSTATE[HY000]: General error: 1

Solution:
- Ensure database.sqlite exists in backend/ directory
- Check file permissions: chmod 755 backend/database/
- Verify .env DB_DATABASE path is correct
```

#### 2. Permission Denied on Storage/Upload

```
Error: Permission denied writing to /path/to/storage/

Solution:
php artisan storage:link
chmod -R 755 storage/
chmod -R 755 public/storage/
```

#### 3. CORS (Cross-Origin) Errors

```
Error: Access to XMLHttpRequest blocked by CORS policy

Solution:
- Verify CORS_ALLOWED_ORIGINS in .env
- Check config/cors.php allows frontend origin
- Ensure API responses include CORS headers
```

#### 4. QR Scanner Not Working

```
Error: Camera permission denied or scanner not initializing

Solution:
- Ensure HTTPS is used (QR scanner requires secure context)
- Check browser console for errors (Permissions API)
- Try alternative scanner (app uses multiple libraries)
- Ensure camera access is granted
- Check browser compatibility (Chrome/Firefox/Safari)
```

#### 5. Spatie Permission Cache Issues

```
Error: Permission denied even though user has permission

Solution:
php artisan permission:cache-reset
php artisan cache:clear
```

#### 6. Frontend Build Errors

```
Error: Module not found or build fails

Solution:
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 7. Port Already in Use

```
Error: Port 8000 (or 5173) already in use

Solution:
# For backend (use different port):
php artisan serve --port=8001

# For frontend (Vite auto-picks port if 5173 is busy)
npm run dev
```

#### 8. QR Code Generation Fails (GD Extension Missing)

```
Error: PHP GD extension is not installed/enabled

This error occurs when trying to generate QR codes because the
simple-qrcode package requires the GD graphics library.

Solution:

# Check if GD is installed
php -m | grep gd
# or
php -i | grep -A 5 GD

# If GD is not installed, install it:

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install php8.2-gd
# (replace 8.2 with your PHP version)

# macOS (with Homebrew)
brew install php@8.2
# GD usually comes pre-installed

# CentOS/RHEL
sudo yum install php-gd

# Windows
# Edit php.ini and uncomment:
; extension=gd
# Then restart Apache or PHP

# Verify GD is enabled
php -r "echo extension_loaded('gd') ? 'GD is enabled' : 'GD is NOT enabled';"

# Restart PHP service
# Linux/macOS: php artisan serve (will pick up new extensions)
# Nginx: sudo systemctl restart php-fpm
# Apache: sudo systemctl restart apache2
```

### Debug Mode

**Enable debug logging:**

```bash
# Backend
APP_DEBUG=true
LOG_LEVEL=debug

# Frontend
# Check browser DevTools > Console
```

**Check Laravel logs:**

```bash
tail -f backend/storage/logs/laravel.log
```

---

## Additional Resources

### Documentation Links

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Getting Help

1. Check the troubleshooting section above
2. Review Laravel logs: `backend/storage/logs/laravel.log`
3. Check browser console for frontend errors
4. Run tests to verify system integrity: `php artisan test`

---

## License

This project is licensed under the MIT License.

---

## Support

For issues or questions, please create an issue in the repository or contact the development team.

**Last Updated:** April 20, 2026
**Version:** 1.1.0 - Personal Attendance Report with PDF Export
