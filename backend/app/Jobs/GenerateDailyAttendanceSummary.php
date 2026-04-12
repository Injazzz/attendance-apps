<?php
namespace App\Jobs;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSummary;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Carbon\Carbon;

class GenerateDailyAttendanceSummary implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function handle(): void
    {
        $yesterday = Carbon::yesterday();
        $year  = $yesterday->year;
        $month = $yesterday->month;

        // Ambil semua employee yang punya record bulan ini
        $employeeIds = AttendanceRecord::whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->distinct()->pluck('employee_id');

        foreach ($employeeIds as $employeeId) {
            $records = AttendanceRecord::where('employee_id', $employeeId)
                ->whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $month)
                ->get();

            $siteId = $records->first()?->site_id;

            AttendanceSummary::updateOrCreate(
                ['employee_id' => $employeeId, 'period_year' => $year, 'period_month' => $month],
                [
                    'site_id'               => $siteId,
                    'total_work_days'        => $records->count(),
                    'total_present'          => $records->whereIn('status', ['present','late'])->count(),
                    'total_absent'           => $records->where('status', 'absent')->count(),
                    'total_late_days'        => $records->where('status', 'late')->count(),
                    'total_late_minutes'     => $records->sum('late_minutes'),
                    'total_overtime_hours'   => $records->sum('overtime_hours'),
                    'total_regular_hours'    => $records->sum('regular_hours'),
                    'attendance_rate'        => $records->count()
                        ? round($records->whereIn('status', ['present','late'])->count() / $records->count() * 100, 2)
                        : 0,
                ]
            );
        }
    }
}
