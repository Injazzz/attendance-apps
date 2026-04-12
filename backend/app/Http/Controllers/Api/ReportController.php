<?php

namespace App\Http\Controllers\Api;

use App\Exports\AttendanceExport;
use App\Http\Requests\Report\ExportReportRequest;
use App\Http\Resources\AttendanceRecordCollection;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSummary;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends BaseController
{
    public function __construct(
        private readonly AttendanceRepositoryInterface $repo
    ) {}

    public function attendance(ExportReportRequest $request): JsonResponse
    {
        $records = AttendanceRecord::with([
            'employee:id,full_name,employee_code,department_id,position_id',
            'employee.department:id,dept_name',
            'employee.position:id,position_name',
            'site:id,site_name',
        ])
        ->when($request->site_id,    fn($q, $v) => $q->where('site_id', $v))
        ->when($request->employee_id,fn($q, $v) => $q->where('employee_id', $v))
        ->when($request->status,     fn($q, $v) => $q->where('status', $v))
        ->when($request->dept_id,    fn($q, $v) =>
            $q->whereHas('employee', fn($eq) => $eq->where('department_id', $v)))
        ->whereBetween('attendance_date', [
            $request->start_date,
            $request->end_date,
        ])
        ->orderBy('attendance_date')
        ->orderBy('employee_id')
        ->paginate($request->per_page ?? 30);

        return response()->json(
            new AttendanceRecordCollection($records)
        );
    }

    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'year'  => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'site_id' => 'nullable|exists:company_sites,id',
        ]);

        $summaries = AttendanceSummary::with([
            'employee:id,full_name,employee_code,department_id',
            'employee.department:id,dept_name',
        ])
        ->where('period_year', $request->year)
        ->where('period_month', $request->month)
        ->when($request->site_id, fn($q, $v) => $q->where('site_id', $v))
        ->orderByDesc('attendance_rate')
        ->paginate($request->per_page ?? 30);

        return $this->paginatedResponse($summaries);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $request->validate([
            'interval'   => 'required|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'site_id'    => 'nullable|exists:company_sites,id',
            'dept_id'    => 'nullable|exists:departments,id',
            'format'     => 'nullable|in:xlsx,csv',
        ]);

        $filters = $request->only(['start_date', 'end_date', 'site_id', 'department_id']);
        $filename = "laporan_absensi_{$request->start_date}_{$request->end_date}.xlsx";

        return Excel::download(
            new AttendanceExport($this->repo, $filters),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX
        );
    }

    public function dashboardStats(Request $request): JsonResponse
    {
        $user   = $request->user();
        $today  = today();
        $siteId = $user->employee?->site_id;

        // Supervisor dan employee hanya lihat site mereka
        // Admin, HRD, Finance lihat semua
        $filterBySite = $user->hasRole(['supervisor', 'project_manager', 'employee'])
            ? $siteId
            : $request->site_id; // admin bisa filter by site

        // Statistik absensi hari ini
        $todayAttendance = \App\Models\AttendanceRecord::query()
            ->where('attendance_date', $today)
            ->when($filterBySite, fn($q) => $q->where('site_id', $filterBySite))
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
                SUM(CASE WHEN status IN ('leave','sick') THEN 1 ELSE 0 END) as on_leave,
                AVG(late_minutes) as avg_late_minutes,
                SUM(overtime_hours) as total_overtime
            ")
            ->first();

        // Total karyawan aktif
        $totalEmployees = \App\Models\Employee::query()
            ->where('status', 'active')
            ->when($filterBySite, fn($q) => $q->where('site_id', $filterBySite))
            ->count();

        // Lembur pending yang belum disetujui
        $pendingOvertime = \App\Models\OvertimeRequest::query()
            ->where('status', 'pending')
            ->when($filterBySite, fn($q) => $q->where('site_id', $filterBySite))
            ->count();

        // Tren absensi 7 hari terakhir
        $weeklyTrend = \App\Models\AttendanceRecord::query()
            ->where('attendance_date', '>=', today()->subDays(6))
            ->where('attendance_date', '<=', $today)
            ->when($filterBySite, fn($q) => $q->where('site_id', $filterBySite))
            ->selectRaw("
                attendance_date,
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
            ")
            ->groupBy('attendance_date')
            ->orderBy('attendance_date')
            ->get()
            ->map(fn($row) => [
                'date'    => $row->attendance_date,
                'total'   => $row->total,
                'present' => $row->present,
                'absent'  => $row->absent,
                'late'    => $row->late,
            ]);

        // Karyawan paling sering terlambat bulan ini
        $topLate = \App\Models\AttendanceRecord::query()
            ->with('employee:id,full_name,employee_code')
            ->whereMonth('attendance_date', $today->month)
            ->whereYear('attendance_date', $today->year)
            ->where('status', 'late')
            ->when($filterBySite, fn($q) => $q->where('site_id', $filterBySite))
            ->selectRaw('employee_id, COUNT(*) as late_count, SUM(late_minutes) as total_late_minutes')
            ->groupBy('employee_id')
            ->orderByDesc('late_count')
            ->limit(5)
            ->get()
            ->map(fn($row) => [
                'employee'           => [
                    'id'   => $row->employee->id,
                    'name' => $row->employee->full_name,
                    'code' => $row->employee->employee_code,
                ],
                'late_count'         => $row->late_count,
                'total_late_minutes' => $row->total_late_minutes,
            ]);

        return $this->successResponse([
            'today' => [
                'date'              => $today->format('Y-m-d'),
                'day'               => $today->translatedFormat('l'),
                'total_employees'   => $totalEmployees,
                'present'           => (int) ($todayAttendance->present ?? 0),
                'absent'            => (int) ($todayAttendance->absent ?? 0),
                'late'              => (int) ($todayAttendance->late ?? 0),
                'on_leave'          => (int) ($todayAttendance->on_leave ?? 0),
                'not_yet_checked_in'=> max(0, $totalEmployees - (int)($todayAttendance->total ?? 0)),
                'attendance_rate'   => $totalEmployees > 0
                    ? round((int)($todayAttendance->present ?? 0) / $totalEmployees * 100, 1)
                    : 0,
                'avg_late_minutes'  => round($todayAttendance->avg_late_minutes ?? 0, 1),
                'total_overtime'    => round($todayAttendance->total_overtime ?? 0, 2),
            ],
            'pending_overtime'  => $pendingOvertime,
            'weekly_trend'      => $weeklyTrend,
            'top_late_employees'=> $topLate,
        ]);
    }
}
