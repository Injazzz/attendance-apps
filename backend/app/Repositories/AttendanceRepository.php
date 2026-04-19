<?php
namespace App\Repositories;

use App\Models\AttendanceRecord;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Illuminate\Support\Facades\DB;

class AttendanceRepository implements AttendanceRepositoryInterface
{
    public function getEmployeeAttendanceByPeriod(int $employeeId, string $start, string $end): mixed
    {
        return AttendanceRecord::with(['employee:id,full_name,employee_code', 'site:id,site_name'])
            ->where('employee_id', $employeeId)
            ->whereBetween('attendance_date', [$start, $end])
            ->orderBy('attendance_date', 'desc')
            ->get();
    }

    public function getDailySummaryBySite(int $siteId, string $date): mixed
    {
        return AttendanceRecord::select(
                'status',
                DB::raw('COUNT(*) as total'),
                DB::raw('AVG(late_minutes) as avg_late'),
                DB::raw('SUM(overtime_hours) as total_overtime')
            )
            ->where('site_id', $siteId)
            ->where('attendance_date', $date)
            ->groupBy('status')
            ->get();
    }

    public function getAttendanceForExport(array $filters): mixed
    {
        return AttendanceRecord::with([
                'employee:id,full_name,employee_code,department_id,position_id',
                'employee.department:id,dept_name',
                'employee.position:id,position_name',
                'site:id,site_name',
            ])
            ->when($filters['site_id'] ?? null, fn($q, $v) => $q->where('site_id', $v))
            ->when($filters['dept_id'] ?? null, fn($q, $v) =>
                $q->whereHas('employee', fn($eq) => $eq->where('department_id', $v))
            )
            ->whereBetween('attendance_date', [$filters['start_date'], $filters['end_date']])
            ->orderBy('attendance_date')
            ->orderBy('employee_id')
            ->get();
    }

    public function getPendingOvertimes(int $supervisorId): mixed
    {
        // Ambil overtime requests dari bawahan supervisor ini
        return \App\Models\OvertimeRequest::with(['employee.department', 'employee.position'])
            ->where('status', 'pending')
            ->whereHas('employee', function ($q) use ($supervisorId) {
                // Employee yang supervisornya adalah si supervisor ini
                $q->whereHas('department', function ($dq) use ($supervisorId) {
                    $dq->where('department_head_id', $supervisorId);
                });
            })
            ->orderBy('overtime_date', 'desc')
            ->get();
    }
}
