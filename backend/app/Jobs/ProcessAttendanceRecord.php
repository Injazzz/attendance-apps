<?php
namespace App\Jobs;

use App\Models\AttendanceScan;
use App\Models\AttendanceRecord;
use App\Services\AttendanceRuleService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Carbon\Carbon;

class ProcessAttendanceRecord implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        private int $employeeId,
        private string $date
    ) {}

    public function handle(AttendanceRuleService $ruleService): void
    {
        $date = Carbon::parse($this->date);

        $scans = AttendanceScan::where('employee_id', $this->employeeId)
            ->where('scan_date', $date)
            ->orderBy('scan_time')
            ->get();

        if ($scans->isEmpty()) return;

        $checkIn = $scans->where('scan_type', 'check_in')->first();
        $checkOut = $scans->where('scan_type', 'check_out')->last();

        $employee = \App\Models\Employee::find($this->employeeId);
        $rule = $ruleService->getRuleForEmployee($employee);

        $checkInTime = $checkIn ? Carbon::parse($checkIn->scan_time) : null;
        $checkOutTime = $checkOut ? Carbon::parse($checkOut->scan_time) : null;

        $totalHours = ($checkInTime && $checkOutTime)
            ? $checkInTime->diffInMinutes($checkOutTime) / 60
            : 0;

        $regularHoursLimit = Carbon::parse($rule->start_time)->diffInMinutes(Carbon::parse($rule->end_time)) / 60;
        $regularHours = min($totalHours, $regularHoursLimit);
        $overtimeHours = max(0, $totalHours - $regularHoursLimit - ($rule->overtime_start_after / 60));

        $startTime = Carbon::parse($rule->start_time);
        $lateMinutes = 0;
        if ($checkInTime && $checkInTime->gt($startTime->addMinutes($rule->late_grace_period))) {
            $lateMinutes = $startTime->addMinutes($rule->late_grace_period)->diffInMinutes($checkInTime);
        }

        $status = $this->determineStatus($checkIn, $checkOut, $lateMinutes, $rule);

        AttendanceRecord::updateOrCreate(
            ['employee_id' => $this->employeeId, 'attendance_date' => $date],
            [
                'site_id'         => $checkIn->site_id,
                'check_in_time'   => $checkInTime?->format('H:i:s'),
                'check_out_time'  => $checkOutTime?->format('H:i:s'),
                'total_hours'     => round($totalHours, 2),
                'regular_hours'   => round($regularHours, 2),
                'overtime_hours'  => round(max(0, $overtimeHours), 2),
                'late_minutes'    => $lateMinutes,
                'early_minutes'   => 0,
                'status'          => $status,
                'shift_type'      => 'normal',
            ]
        );
    }

    private function determineStatus($checkIn, $checkOut, int $lateMinutes, $rule): string
    {
        if (!$checkIn) return 'absent';
        if (!$checkOut) return $lateMinutes > 0 ? 'late' : 'present';
        if ($lateMinutes > 0) return 'late';
        return 'present';
    }
}