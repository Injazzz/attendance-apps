<?php
namespace App\Http\Controllers\Api;

use App\Http\Requests\Attendance\QrScanRequest;
use App\Http\Requests\Attendance\UnifiedQrScanRequest;
use App\Http\Resources\AttendanceRecordResource;
use App\Models\AttendanceRecord;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends BaseController
{
    public function __construct(private readonly AttendanceService $attendanceService) {}

    /**
     * Unified QR scan endpoint - replaces both qrScan and selfie methods
     * Accepts QR payload with embedded employee_id and type information
     */
    public function unifiedQrScan(UnifiedQrScanRequest $request): JsonResponse
    {
        $result = $this->attendanceService->processUnifiedQrScan(
            $request->qr_data,
            $request->gps,
            $request->device_info
        );

        if (!isset($result['data'])) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse($result['data'], $result['message']);
    }

    /**
     * Original QR scan method - kept for backward compatibility
     * DEPRECATED: Use unifiedQrScan instead
     */
    public function qrScan(QrScanRequest $request): JsonResponse
    {
        $user = $request->user()->load('employee');
        $employee = $user->employee;

        if (!$employee) {
            return $this->errorResponse('Data karyawan tidak ditemukan', 404);
        }

        $result = $this->attendanceService->processQrScan(
            $employee,
            $request->session_token,
            $request->gps,
            $request->device_info
        );

        if (!isset($result['data'])) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse($result['data'], $result['message']);
    }

    public function today(Request $request): JsonResponse
    {
        $user = $request->user()->load('employee');
        $employee = $user->employee;

        if (!$employee) {
            return $this->errorResponse('Data karyawan tidak ditemukan', 404);
        }

        $record = \App\Models\AttendanceRecord::with(['site'])
            ->where('employee_id', $employee->id)
            ->where('attendance_date', today())
            ->first();

        return $this->successResponse(
            $record ? new AttendanceRecordResource($record) : null
        );
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user()->load('employee');
        $employee = $user->employee;

        if (!$employee) {
            return $this->errorResponse('Data karyawan tidak ditemukan', 404);
        }

        $records = \App\Models\AttendanceRecord::with(['site'])
            ->where('employee_id', $employee->id)
            ->when($request->start_date, fn($q) => $q->where('attendance_date', '>=', $request->start_date))
            ->when($request->end_date, fn($q) => $q->where('attendance_date', '<=', $request->end_date))
            ->orderBy('attendance_date', 'desc')
            ->paginate($request->per_page ?? 15);

        return $this->paginatedResponse($records);
    }

    public function manualEdit(Request $request, AttendanceRecord $attendanceRecord): JsonResponse
    {
        $request->validate([
            'check_in_time'  => ['nullable', 'date_format:H:i:s'],
            'check_out_time' => ['nullable', 'date_format:H:i:s', 'after:check_in_time'],
            'status'         => ['nullable', Rule::in([
                'present', 'late', 'absent', 'half_day', 'leave', 'sick', 'business_trip',
            ])],
            'notes'          => ['nullable', 'string', 'max:500'],
            'shift_type'     => ['nullable', Rule::in(['normal', 'morning', 'afternoon', 'night'])],
        ]);

        $data = $request->only([
            'check_in_time', 'check_out_time',
            'status', 'notes', 'shift_type',
        ]);

        // Hitung ulang total jam jika check_in dan check_out diubah
        if (
            $request->filled('check_in_time') &&
            $request->filled('check_out_time')
        ) {
            $checkIn  = \Carbon\Carbon::parse($request->check_in_time);
            $checkOut = \Carbon\Carbon::parse($request->check_out_time);

            $totalMinutes  = $checkIn->diffInMinutes($checkOut);
            $totalHours    = round($totalMinutes / 60, 2);

            $rule = app(\App\Services\AttendanceRuleService::class)
                ->getRuleForEmployee($attendanceRecord->employee);

            $regularLimit  = \Carbon\Carbon::parse($rule->start_time)
                ->diffInMinutes(\Carbon\Carbon::parse($rule->end_time)) / 60;

            $data['total_hours']    = $totalHours;
            $data['regular_hours']  = min($totalHours, $regularLimit);
            $data['overtime_hours'] = max(0, $totalHours - $regularLimit);

            // Hitung menit terlambat
            $startTime  = \Carbon\Carbon::parse($rule->start_time);
            $graceEnd   = $startTime->copy()->addMinutes($rule->late_grace_period);

            if ($checkIn->gt($graceEnd)) {
                $data['late_minutes'] = $graceEnd->diffInMinutes($checkIn);

                if (!$request->filled('status')) {
                    $data['status'] = 'late';
                }
            } else {
                $data['late_minutes'] = 0;
            }
        }

        $attendanceRecord->update($data);

        // Log aktivitas perubahan manual
        activity()
            ->causedBy($request->user())
            ->performedOn($attendanceRecord)
            ->withProperties([
                'old' => $attendanceRecord->getOriginal(),
                'new' => $data,
            ])
            ->log('Absensi diedit secara manual oleh admin');

        return $this->successResponse(
            new \App\Http\Resources\AttendanceRecordResource(
                $attendanceRecord->fresh(['employee', 'site'])
            ),
            'Data absensi berhasil diperbarui'
        );
    }
}
