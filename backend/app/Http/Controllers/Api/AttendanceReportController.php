<?php

namespace App\Http\Controllers\Api;

use App\Models\AttendanceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class AttendanceReportController extends BaseController
{
    /**
     * Get attendance report for the authenticated user
     * Displays attendance records grouped by date with detailed statistics
     */
    public function myReport(Request $request): JsonResponse
    {
        $user = $request->user()->load('employee.department', 'employee.position');
        $employee = $user->employee;

        if (!$employee) {
            return $this->errorResponse('Data karyawan tidak ditemukan', 404);
        }

        // Validate date range
        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d',
            'month' => 'nullable|date_format:Y-m', // Alternative: Just specify month
        ]);

        // Determine date range
        $startDate = $request->start_date
            ? Carbon::createFromFormat('Y-m-d', $request->start_date)->startOfDay()
            : ($request->month
                ? Carbon::createFromFormat('Y-m', $request->month)->startOfMonth()
                : now()->startOfMonth());

        $endDate = $request->end_date
            ? Carbon::createFromFormat('Y-m-d', $request->end_date)->endOfDay()
            : ($request->month
                ? Carbon::createFromFormat('Y-m', $request->month)->endOfMonth()
                : now()->endOfMonth());

        // Fetch records
        $records = AttendanceRecord::where('employee_id', $employee->id)
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->with('site')
            ->orderBy('attendance_date', 'desc')
            ->get();

        // Calculate statistics
        $stats = $this->calculateStatistics($records);

        // Format records for response
        $formattedRecords = $records->map(function ($record) {
            return [
                'id' => $record->id,
                'date' => $record->attendance_date->format('Y-m-d'),
                'date_formatted' => $record->attendance_date->translatedFormat('d F Y'),
                'day_name' => $record->attendance_date->translatedFormat('l'),
                'check_in_time' => $record->check_in_time,
                'check_out_time' => $record->check_out_time,
                'total_hours' => $record->total_hours,
                'regular_hours' => $record->regular_hours,
                'overtime_hours' => $record->overtime_hours,
                'late_minutes' => $record->late_minutes ?? 0,
                'early_minutes' => $record->early_minutes ?? 0,
                'status' => $record->status,
                'status_label' => $this->getStatusLabel($record->status),
                'shift_type' => $record->shift_type,
                'site' => [
                    'id' => $record->site->id,
                    'name' => $record->site->site_name,
                ],
                'notes' => $record->notes,
            ];
        })->toArray();

        return $this->successResponse([
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->full_name,
                'nip' => $employee->employee_code,
                'department' => $employee->department?->dept_name,
                'position' => $employee->position?->position_name,
            ],
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'start_date_formatted' => $startDate->translatedFormat('d F Y'),
                'end_date_formatted' => $endDate->translatedFormat('d F Y'),
            ],
            'statistics' => $stats,
            'records' => $formattedRecords,
        ], 'Laporan absensi berhasil diambil');
    }

    /**
     * Calculate attendance statistics
     */
    private function calculateStatistics($records)
    {
        $total = $records->count();
        $present = $records->filter(fn($r) => $r->status === 'present')->count();
        $late = $records->filter(fn($r) => $r->status === 'late')->count();
        $absent = $records->filter(fn($r) => $r->status === 'absent')->count();
        $leave = $records->filter(fn($r) => $r->status === 'leave')->count();
        $sick = $records->filter(fn($r) => $r->status === 'sick')->count();
        $halfDay = $records->filter(fn($r) => $r->status === 'half_day')->count();

        $totalHours = $records->sum('total_hours');
        $regularHours = $records->sum('regular_hours');
        $overtimeHours = $records->sum('overtime_hours');
        $totalLateMinutes = $records->sum('late_minutes');
        $totalEarlyMinutes = $records->sum('early_minutes');

        return [
            'total_records' => $total,
            'present' => $present,
            'late' => $late,
            'absent' => $absent,
            'leave' => $leave,
            'sick' => $sick,
            'half_day' => $halfDay,
            'total_hours' => round($totalHours, 2),
            'regular_hours' => round($regularHours, 2),
            'overtime_hours' => round($overtimeHours, 2),
            'total_late_minutes' => $totalLateMinutes,
            'total_early_minutes' => $totalEarlyMinutes,
            'attendance_rate' => $total > 0 ? round(($present / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get user-friendly status label
     */
    private function getStatusLabel(string $status): string
    {
        $labels = [
            'present' => 'Hadir',
            'late' => 'Terlambat',
            'absent' => 'Tidak Hadir',
            'leave' => 'Cuti',
            'sick' => 'Sakit',
            'half_day' => 'Setengah Hari',
            'business_trip' => 'Dinas Luar',
        ];

        return $labels[$status] ?? ucfirst($status);
    }

    /**
     * Export attendance report to PDF
     */
    public function exportMyReport(Request $request)
    {
        try {
            $user = $request->user()->load('employee.department', 'employee.position');
            $employee = $user->employee;

            if (!$employee) {
                return $this->errorResponse('Data karyawan tidak ditemukan', 404);
            }

            // Validate date range
            $request->validate([
                'start_date' => 'nullable|date_format:Y-m-d',
                'end_date' => 'nullable|date_format:Y-m-d',
                'month' => 'nullable|date_format:Y-m',
            ]);

            // Determine date range
            $startDate = $request->start_date
                ? Carbon::createFromFormat('Y-m-d', $request->start_date)->startOfDay()
                : ($request->month
                    ? Carbon::createFromFormat('Y-m', $request->month)->startOfMonth()
                    : now()->startOfMonth());

            $endDate = $request->end_date
                ? Carbon::createFromFormat('Y-m-d', $request->end_date)->endOfDay()
                : ($request->month
                    ? Carbon::createFromFormat('Y-m', $request->month)->endOfMonth()
                    : now()->endOfMonth());

            // Fetch records
            $records = AttendanceRecord::where('employee_id', $employee->id)
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->with('site')
                ->orderBy('attendance_date', 'asc')
                ->get();

            // Calculate statistics
            $stats = $this->calculateStatistics($records);

            // Prepare data for PDF
            $data = [
                'employee' => $employee,
                'period' => [
                    'start_date' => $startDate->format('d/m/Y'),
                    'end_date' => $endDate->format('d/m/Y'),
                ],
                'statistics' => $stats,
                'records' => $records,
            ];

            // Generate PDF
            try {
                $pdf = Pdf::loadView('pdf.attendance-report', $data);
                $pdf->setOption('enable_remote', false);
                $pdf->setOption('isHtml5ParserEnabled', true);

                // Create safe filename
                $employeeName = str_replace([' ', '/', '\\', ':', '*', '?', '"', '<', '>', '|'], '_', $employee->full_name);
                $filename = "Laporan-Absensi-{$employeeName}-{$startDate->format('Y-m-d')}-to-{$endDate->format('Y-m-d')}.pdf";

                return $pdf->download($filename);
            } catch (\Exception $pdfError) {
                Log::error('PDF generation failed', [
                    'message' => $pdfError->getMessage(),
                    'file' => $pdfError->getFile(),
                    'line' => $pdfError->getLine(),
                    'data' => [
                        'employee_id' => $employee->id ?? 'unknown',
                        'records_count' => count($records),
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                    ]
                ]);
                throw $pdfError;
            }
        } catch (\Exception $e) {
            Log::error('PDF Export Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Gagal membuat PDF: ' . $e->getMessage(), 500);
        }
    }
}
