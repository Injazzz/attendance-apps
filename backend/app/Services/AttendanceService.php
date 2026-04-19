<?php
namespace App\Services;

use App\Models\AttendanceScan;
use App\Models\QrSession;
use App\Models\Employee;
use App\Jobs\ProcessAttendanceRecord;
use App\Helpers\QrPayloadHelper;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use InvalidArgumentException;

class AttendanceService extends BaseService
{
    public function __construct(
        private readonly QrService $qrService,
        private readonly AttendanceRuleService $ruleService,
    ) {}

    /**
     * Unified QR scan processing - handles both department and site employees
     * Decodes QR payload to extract employee_id and type, validates employee, records attendance
     *
     * @param string $qrData Encoded QR payload (JSON or base64)
     * @param array $gpsData GPS coordinates
     * @param array $deviceInfo Device information
     * @return array Result with data and message
     */
    public function processUnifiedQrScan(
        string $qrData,
        array $gpsData,
        array $deviceInfo
    ): array {
        return DB::transaction(function () use ($qrData, $gpsData, $deviceInfo) {
            try {
                // 1. Decode and validate QR payload
                $qrPayload = QrPayloadHelper::decode($qrData);
                $employeeId = $qrPayload['employee_id'];
                $employeeType = $qrPayload['type'];

                // 2. Fetch and validate employee
                $employee = Employee::with('site', 'department')
                    ->where('id', $employeeId)
                    ->first();

                if (!$employee) {
                    return $this->fail('Karyawan tidak ditemukan');
                }

                // 3. Validate employee is active
                if ($employee->status !== 'active') {
                    return $this->fail('Akun karyawan tidak aktif');
                }

                // 4. Validate employee type matches
                $actualType = $employee->department_id ? 'department' : 'site';
                if ($actualType !== $employeeType) {
                    return $this->fail(
                        "Tipe karyawan tidak sesuai. "
                        . "Data sistem: {$actualType}, QR: {$employeeType}"
                    );
                }

                // 5. Validate GPS radius if site requires location verification
                $site = $employee->site;
                if ($site && $site->gps_radius > 0) {
                    $distance = $this->calculateDistance(
                        $gpsData['latitude'], $gpsData['longitude'],
                        $site->gps_latitude, $site->gps_longitude
                    );
                    if ($distance > $site->gps_radius) {
                        return $this->fail(
                            "Lokasi di luar radius ({$site->gps_radius}m). "
                            . "Jarak anda: " . round($distance) . "m"
                        );
                    }
                }

                // 6. Determine scan type (check_in or check_out)
                $today = today();
                $existingCheckIn = AttendanceScan::where('employee_id', $employeeId)
                    ->where('scan_date', $today)
                    ->where('scan_type', 'check_in')
                    ->where('status', '!=', 'invalid')
                    ->exists();

                $scanType = $existingCheckIn ? 'check_out' : 'check_in';

                // 7. Prevent double check_out
                if ($scanType === 'check_out') {
                    $existingCheckOut = AttendanceScan::where('employee_id', $employeeId)
                        ->where('scan_date', $today)
                        ->where('scan_type', 'check_out')
                        ->exists();

                    if ($existingCheckOut) {
                        return $this->fail('Anda sudah melakukan check-out hari ini');
                    }
                }

                // 8. Determine status (on-time, late, etc)
                $rule = $this->ruleService->getRuleForEmployee($employee);
                $status = $this->determineScanStatus($scanType, now(), $rule);

                // 9. Save attendance scan with employee type
                $deviceInfoWithType = array_merge($deviceInfo, [
                    'employee_type' => $employeeType,
                    'scan_source' => 'unified_qr',
                ]);

                $scan = AttendanceScan::create([
                    'employee_id'       => $employeeId,
                    'site_id'           => $site->id,
                    'qr_session_id'     => null, // Unified QR doesn't use sessions
                    'scan_type'         => $scanType,
                    'scan_time'         => now(),
                    'scan_date'         => $today,
                    'latitude'          => $gpsData['latitude'],
                    'longitude'         => $gpsData['longitude'],
                    'location_accuracy' => $gpsData['accuracy'] ?? null,
                    'device_info'       => $deviceInfoWithType,
                    'status'            => $status,
                ]);

                // 10. Process attendance record immediately (synchronous)
                // Ini memastikan data langsung muncul di dashboard tanpa menunggu queue worker
                $this->processAttendanceRecordSync($employeeId, $today);

                // 11. Also dispatch async job as backup untuk consistency checks
                ProcessAttendanceRecord::dispatch($employeeId, $today->toDateString());

                return $this->success($scan, "Berhasil {$scanType}");

            } catch (InvalidArgumentException $e) {
                return $this->fail('QR Code tidak valid: ' . $e->getMessage());
            } catch (\Exception $e) {
                return $this->fail('Terjadi kesalahan: ' . $e->getMessage());
            }
        });
    }

    /**
     * Core method: process QR scan dari karyawan
     */
    public function processQrScan(
        Employee $employee,
        string $sessionToken,
        ?array $gpsData,
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
            // GPS validation hanya dilakukan jika GPS data tersedia dan site require GPS radius
            if (!empty($gpsData) && $site && $site->gps_radius > 0) {
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

            // 6. Simpan scan - GPS bersifat optional untuk token-based QR
            $scan = AttendanceScan::create([
                'employee_id'       => $employee->id,
                'site_id'           => $qrSession->site_id,
                'qr_session_id'     => $qrSession->id,
                'scan_type'         => $scanType,
                'scan_time'         => now(),
                'scan_date'         => $today,
                'latitude'          => $gpsData['latitude'] ?? null,
                'longitude'         => $gpsData['longitude'] ?? null,
                'location_accuracy' => $gpsData['accuracy'] ?? null,
                'device_info'       => $deviceInfo,
                'status'            => $status,
            ]);

            // 7. Update scan count di QR session
            $qrSession->increment('current_scans');

            // 8. Invalidate QR jika max_scans tercapai
            $this->qrService->checkAndRotateQr($qrSession);

            // 9. Process attendance record immediately (synchronous)
            // Ini memastikan data langsung muncul di dashboard tanpa menunggu queue worker
            $this->processAttendanceRecordSync($employee->id, $today);

            // 10. Also dispatch async job as backup untuk consistency checks
            ProcessAttendanceRecord::dispatch($employee->id, $today->toDateString());

            return $this->success($scan, "Berhasil {$scanType}");
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

    /**
     * Process attendance record synchronously (immediate execution)
     * Converts attendance scans to attendance record without waiting for queue
     *
     * @param int $employeeId Employee ID
     * @param string|Carbon $date Attendance date
     * @return array Processing result
     */
    public function processAttendanceRecordSync(int $employeeId, $date)
    {
        $date = $date instanceof Carbon ? $date : Carbon::parse($date);

        $scans = AttendanceScan::where('employee_id', $employeeId)
            ->where('scan_date', $date)
            ->orderBy('scan_time')
            ->get();

        if ($scans->isEmpty()) {
            return $this->fail('Tidak ada scan untuk tanggal ini');
        }

        $checkIn = $scans->where('scan_type', 'check_in')->first();
        $checkOut = $scans->where('scan_type', 'check_out')->last();

        $employee = Employee::find($employeeId);
        if (!$employee) {
            return $this->fail('Karyawan tidak ditemukan');
        }

        $rule = $this->ruleService->getRuleForEmployee($employee);

        $checkInTime = $checkIn ? Carbon::parse($checkIn->scan_time) : null;
        $checkOutTime = $checkOut ? Carbon::parse($checkOut->scan_time) : null;

        $totalHours = ($checkInTime && $checkOutTime)
            ? $checkInTime->diffInMinutes($checkOutTime) / 60
            : 0;

        $regularHoursLimit = Carbon::parse($rule->start_time)
            ->diffInMinutes(Carbon::parse($rule->end_time)) / 60;

        $regularHours = min($totalHours, $regularHoursLimit);
        $timeAfterRegularHours = max(0, $totalHours - $regularHoursLimit);
        $overtimeStartThreshold = $rule->overtime_start_after / 60;
        $overtimeHours = max(0, $timeAfterRegularHours - $overtimeStartThreshold);

        // Calculate late minutes - using copy() to avoid modifying original object
        $startTime = Carbon::parse($rule->start_time);
        $lateMinutes = 0;
        if ($checkInTime) {
            $graceEndTime = $startTime->copy()->addMinutes($rule->late_grace_period ?? 0);
            if ($checkInTime->gt($graceEndTime)) {
                $lateMinutes = (int) $graceEndTime->diffInMinutes($checkInTime);
            }
        }

        // Determine status
        $status = 'absent';
        if ($checkIn) {
            if (!$checkOut) {
                $status = $lateMinutes > 0 ? 'late' : 'present';
            } else {
                $status = $lateMinutes > 0 ? 'late' : 'present';
            }
        }

        // Create or update attendance record
        $record = \App\Models\AttendanceRecord::updateOrCreate(
            ['employee_id' => $employeeId, 'attendance_date' => $date],
            [
                'site_id'         => $checkIn?->site_id ?? $employee->site_id,
                'check_in_time'   => $checkInTime?->format('H:i:s'),
                'check_out_time'  => $checkOutTime?->format('H:i:s'),
                'total_hours'     => round($totalHours, 2),
                'regular_hours'   => round($regularHours, 2),
                'overtime_hours'  => round($overtimeHours, 2),
                'late_minutes'    => $lateMinutes,
                'early_minutes'   => 0,
                'status'          => $status,
                'shift_type'      => 'normal',
            ]
        );

        return $this->success($record, 'Attendance record berhasil diproses');
    }
}
