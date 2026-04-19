# QR Scanner Testing Guide

## 🎯 Cara Testing QR Scanner Attendance dengan 1 Device

Sudah ada **QR Debugger** di `AttendancePage` (hanya muncul saat development).

---

## 📱 Setup Awal

### 1. Pastikan Backend & Frontend Running

```bash
# Terminal 1: Backend
cd backend
php artisan serve  # http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev  # http://localhost:5173
```

### 2. Pastikan Ada Data di Database

Setup test data dengan seeder:

```bash
# Terminal di backend
php artisan tinker

# Di tinker shell
>>> $emp = \App\Models\Employee::create([
  'user_id' => 1,
  'full_name' => 'Test Employee 1',
  'employee_number' => 'EMP-001',
  'department_id' => 1,  // for department type
  'status' => 'active'
]);

>>> $emp2 = \App\Models\Employee::create([
  'user_id' => 2,
  'full_name' => 'Test Employee 2',
  'employee_number' => 'EMP-002',
  'site_id' => 1,  // for site type
  'status' => 'active'
]);

>>> exit
```

Atau jika sudah ada seeder, jalankan:

```bash
php artisan db:seed
```

---

## 🧪 Testing dengan QR Debugger

### Langkah 1: Buka Attendance Page

- Buka `http://localhost:5173/attendance`
- Scroll ke atas, akan melihat **QR Scanner Debugger** (orange box)

### Langkah 2: Setup Test Parameters

#### Parameter yang dapat diatur:

1. **Employee ID**
   - Masukkan ID karyawan yang ada di database
   - Contoh: `1` atau `2`

2. **Employee Type**
   - **Department**: Untuk karyawan dengan `department_id`
   - **Site**: Untuk karyawan dengan `site_id`
   - Harus sesuai dengan tipe di database!

3. **GPS Location**
   - **Jakarta**: Default coordinate untuk Jakarta
   - **Bandung**: Alternative coordinate untuk Bandung
   - **Custom**: Masukkan latitude/longitude custom sendiri

### Langkah 3: Simulate QR Scan

Klik tombol **"📱 Simulate QR Scan"**

### Hasil Test

#### ✅ Success Response

```
Status: Green checkmark
Message: "Check In/Out Berhasil"
Data: Menampilkan scan_type (check_in atau check_out)
```

#### ❌ Error Response

```
Status: Red icon
Message: Pesan error dari API
Details: JSON response dengan error details
```

---

## 🔍 Contoh Test Scenarios

### Scenario 1: First Check-In (Employee Department)

```
Employee ID: 1
Employee Type: Department
GPS Location: Jakarta
Expected: ✓ Check In Berhasil
```

### Scenario 2: Check-Out Same Employee

```
Employee ID: 1
Employee Type: Department
GPS Location: Jakarta
Expected: ✓ Check Out Berhasil (jika sudah ada check-in hari ini)
```

### Scenario 3: Wrong Employee Type (Error)

```
Employee ID: 2 (Is Site type)
Employee Type: Department
GPS Location: Jakarta
Expected: ❌ "Tipe karyawan tidak sesuai"
```

### Scenario 4: GPS Out of Radius (Error)

```
Employee ID: 2 (Site)
Employee Type: Site
GPS Location: Custom (-6.5, 107.0)  // Far from site GPS
Expected: ❌ "Lokasi di luar radius"
```

### Scenario 5: Duplicate Check-Out (Error)

```
Employee ID: 1
Employee Type: Department
GPS Location: Jakarta
Action: Klik 2x "Simulate QR Scan"
Expected pada klik ke-2: ❌ "Anda sudah melakukan check-out"
```

---

## 🎮 Tips Testing

### 1. Lihat Console Log

- Buka DevTools (`F12`)
- Tab "Console"
- Akan melihat detail QR Payload dan GPS Data

```
🔍 QR Payload: {employee_id: 1, type: 'department', timestamp: 1713xxxx}
📍 GPS Data: {latitude: -6.1753, longitude: 106.8272, accuracy: 10}
```

### 2. Check Database Changes

```bash
php artisan tinker

# Lihat attendance scans yang baru
>>> use App\Models\AttendanceScan;
>>> AttendanceScan::latest()->first();

# Lihat attendance records
>>> use App\Models\Attendance;
>>> Attendance::latest()->first();
```

### 3. Monitor Backend Logs

```bash
# Terminal baru
tail -f backend/storage/logs/laravel-*.log
```

---

## 🚀 Testing Flow Checklist

- [ ] Backend & Frontend running
- [ ] Database seeders sudah jalan (ada employee records)
- [ ] Buka `http://localhost:5173/attendance`
- [ ] Test Employee Type: Department ✓
- [ ] Test Employee Type: Site ✓
- [ ] Test GPS different locations ✓
- [ ] Test duplicate scan error ✓
- [ ] Test wrong employee type error ✓
- [ ] Check-in → Check-out flow ✓
- [ ] Monitor logs untuk error details ✓

---

## 📊 Expected QR Payload Format

```json
{
  "employee_id": 1,
  "type": "department|site",
  "timestamp": 1713571200
}
```

QR Debugger otomatis generate ini, tidak perlu manual encode.

---

## 🔐 Production Note

- QrDebugger **hanya muncul saat development mode** (`npm run dev`)
- Di production build (`npm run build`), tidak akan ada
- Safe untuk deploy

---

## 💡 If Something Goes Wrong

### QR Debugger tidak muncul?

- Pastikan sedang di development mode (`npm run dev`)
- Cek di browser console (F12) ada error?

### API Error "Karyawan tidak ditemukan"?

- Check Employee ID ada di database
- Gunakan `php artisan tinker` → `Employee::all()`

### API Error "Tipe karyawan tidak sesuai"?

- Employee dengan ID itu punya `department_id` atau `site_id`?
- Pilih Employee Type yang sesuai

### GPS Error "Lokasi di luar radius"?

- Gunakan GPS Location yang benar
- Atau check konfigurasi Site GPS radius di database

---

## 📲 Test dengan Real QR Code (Optional)

Jika ingin test dengan real QR scanner:

### Generate QR Code Online

```bash
cd backend
php artisan tinker

>>> use App\Helpers\QrPayloadHelper;
>>> $payload = QrPayloadHelper::encode(1, 'department');
>>> echo base64_encode($payload);
# Copy output
```

1. Buka https://www.qr-code-generator.com/
2. Paste base64 string dari step di atas
3. Generate & cetak QR code
4. Scan pakai QrScanner di AttendancePage

---

## 🎓 Learning Flow

1. **Start**: Test dengan QrDebugger (debug semua flow)
2. **Then**: Test dengan real QR code (optional)
3. **Finally**: Fix bugs yang ketemu di logs
4. **Deploy**: Normal production usage

---

Enjoy testing! 🚀
