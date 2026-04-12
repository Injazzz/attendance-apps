<?php
namespace App\Services;

use App\Models\AttendanceScan;
use App\Models\AttendanceRecord;
use App\Models\QrSession;
use App\Models\Employee;
use App\Enums\ScanStatus;
use App\Jobs\ProcessAttendanceRecord;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceService extends BaseService
{
    public function __construct(
        private readonly QrService $qrService,
        private readonly AttendanceRuleService $ruleService,
    ) {}

    /**
     * Core method: process QR scan dari karyawan
     */
    public function processQrScan(
        Employee $employee,
        string $sessionToken,
        array $gpsData,
        array $deviceInfo
    ): array {
        return DB::transaction(function () use ($employee, $sessionToken, $gpsData, $deviceInfo) {
            // 1. Validasi QR session
            $qrSession = QrSession::where('session_token', $sessionToken)
                ->where('is_active', true)
                ->where('valid_to', '>', now())
                ->lockForUpdate()  // prevent race condition
                ->first();

            if (!$qrSession) {
                return $this->fail('QR Code tidak valid atau sudah kadaluarsa');
            }

            // 2. Validasi GPS radius (untuk site project)
            $site = $qrSession->site;
            if ($site->gps_radius > 0) {
                $distance = $this->calculateDistance(
                    $gpsData['latitude'], $gpsData['longitude'],
                    $site->gps_latitude, $site->gps_longitude
                );
                if ($distance > $site->gps_radius) {
                    return $this->fail("Lokasi di luar radius absensi ({$site->gps_radius}m)");
                }
            }

            // 3. Tentukan scan_type: check_in atau check_out
            $today = today();
            $existingCheckIn = AttendanceScan::where('employee_id', $employee->id)
                ->where('scan_date', $today)
                ->where('scan_type', 'check_in')
                ->where('status', '!=', 'invalid')
                ->exists();

            $scanType = $existingCheckIn ? 'check_out' : 'check_in';

            // 4. Cegah double check_out
            if ($scanType === 'check_out') {
                $existingCheckOut = AttendanceScan::where('employee_id', $employee->id)
                    ->where('scan_date', $today)
                    ->where('scan_type', 'check_out')
                    ->exists();

                if ($existingCheckOut) {
                    return $this->fail('Anda sudah melakukan check-out hari ini');
                }
            }

            // 5. Hitung status (tepat waktu / terlambat)
            $rule = $this->ruleService->getRuleForEmployee($employee);
            $status = $this->determineScanStatus($scanType, now(), $rule);

            // 6. Simpan scan
            $scan = AttendanceScan::create([
                'employee_id'       => $employee->id,
                'site_id'           => $qrSession->site_id,
                'qr_session_id'     => $qrSession->id,
                'scan_type'         => $scanType,
                'scan_time'         => now(),
                'scan_date'         => $today,
                'latitude'          => $gpsData['latitude'],
                'longitude'         => $gpsData['longitude'],
                'location_accuracy' => $gpsData['accuracy'] ?? null,
                'device_info'       => $deviceInfo,
                'status'            => $status,
            ]);

            // 7. Update scan count di QR session
            $qrSession->increment('current_scans');

            // 8. Invalidate QR jika max_scans tercapai
            $this->qrService->checkAndRotateQr($qrSession);

            // 9. Dispatch job async untuk update attendance_records
            ProcessAttendanceRecord::dispatch($employee->id, $today->toDateString());

            return $this->success($scan, "Berhasil {$scanType}");
        });
    }

    /**
     * Selfie attendance untuk project site
     */
    public function processSelfieAttendance(
        Employee $employee,
        $imageFile,
        array $gpsData,
        array $deviceInfo
    ): array {
        return DB::transaction(function () use ($employee, $imageFile, $gpsData, $deviceInfo) {
            $site = $employee->site;

            // Validasi GPS radius
            $distance = $this->calculateDistance(
                $gpsData['latitude'], $gpsData['longitude'],
                $site->gps_latitude, $site->gps_longitude
            );

            if ($distance > $site->gps_radius) {
                return $this->fail("Lokasi di luar radius ({$site->gps_radius}m). Jarak anda: " . round($distance) . "m");
            }

            // Proses watermark foto
            $watermarkedImage = app(SelfieService::class)->addWatermark(
                $imageFile,
                $employee->full_name,
                $site->site_name,
                now()
            );

            // Simpan via Spatie MediaLibrary
            $media = $employee
                ->addMedia($watermarkedImage)
                ->toMediaCollection('selfie_attendance');

            // Tentukan scan type
            $today = today();
            $scanType = AttendanceScan::where('employee_id', $employee->id)
                ->where('scan_date', $today)
                ->where('scan_type', 'check_in')
                ->exists() ? 'check_out' : 'check_in';

            $rule = $this->ruleService->getRuleForEmployee($employee);
            $status = $this->determineScanStatus($scanType, now(), $rule);

            $scan = AttendanceScan::create([
                'employee_id'       => $employee->id,
                'site_id'           => $site->id,
                'qr_session_id'     => null,
                'scan_type'         => $scanType,
                'scan_time'         => now(),
                'scan_date'         => $today,
                'latitude'          => $gpsData['latitude'],
                'longitude'         => $gpsData['longitude'],
                'location_accuracy' => $gpsData['accuracy'] ?? null,
                'device_info'       => array_merge($deviceInfo, ['selfie_media_id' => $media->id]),
                'status'            => $status,
            ]);

            ProcessAttendanceRecord::dispatch($employee->id, $today->toDateString());

            return $this->success($scan, "Selfie {$scanType} berhasil");
        });
    }

    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        // Haversine formula
        $earthRadius = 6371000; // meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    private function determineScanStatus(string $scanType, Carbon $time, $rule): string
    {
        if ($scanType === 'check_in') {
            $startTime = Carbon::parse($rule->start_time);
            $graceEnd = $startTime->copy()->addMinutes($rule->late_grace_period ?? 0);
            $lateThreshold = $startTime->copy()->addMinutes($rule->late_threshold ?? 0);

            if ($time->lte($graceEnd)) return 'valid';
            if ($time->lte($lateThreshold)) return 'late';
            return 'late';
        }

        // check_out
        $endTime = Carbon::parse($rule->end_time);
        if ($time->lt($endTime)) return 'early';
        return 'valid';
    }
}
