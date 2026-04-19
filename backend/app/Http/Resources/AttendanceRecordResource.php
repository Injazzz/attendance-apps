<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceRecordResource extends JsonResource
{
    public function toArray($request): array
    {
        $formattedDate = null;
        if ($this->attendance_date) {
            // Format date using standard format: Thursday, 14 April 2026
            $dayName = $this->attendance_date->format('l'); // Day name
            $day = $this->attendance_date->format('d'); // Day number
            $monthName = $this->getMonthName($this->attendance_date->month);
            $year = $this->attendance_date->format('Y');
            $formattedDate = "{$dayName}, {$day} {$monthName} {$year}";
        }

        return [
            'id'             => $this->id,
            'date'           => $this->attendance_date?->format('Y-m-d'),
            'date_formatted' => $formattedDate,
            'check_in_time'  => $this->check_in_time,
            'check_out_time' => $this->check_out_time,
            'total_hours'    => $this->total_hours,
            'overtime_hours' => $this->overtime_hours,
            'late_minutes'   => $this->late_minutes,
            'status'         => $this->status,
            'status_label'   => $this->statusLabel(),
            'shift_type'     => $this->shift_type,
            'notes'          => $this->notes,
            'employee'       => $this->whenLoaded('employee', fn() => [
                'id'   => $this->employee->id,
                'name' => $this->employee->full_name,
                'code' => $this->employee->employee_code,
            ]),
            'site'           => $this->whenLoaded('site', fn() => [
                'id'   => $this->site->id,
                'name' => $this->site->site_name,
            ]),
        ];
    }

    private function statusLabel(): string
    {
        return match($this->status) {
            'present'       => 'Hadir',
            'late'          => 'Terlambat',
            'absent'        => 'Absen',
            'half_day'      => 'Setengah Hari',
            'leave'         => 'Cuti',
            'sick'          => 'Sakit',
            'business_trip' => 'Perjalanan Dinas',
            default         => $this->status,
        };
    }

    private function getMonthName(int $month): string
    {
        $months = [
            1  => 'January',
            2  => 'February',
            3  => 'March',
            4  => 'April',
            5  => 'May',
            6  => 'June',
            7  => 'July',
            8  => 'August',
            9  => 'September',
            10 => 'October',
            11 => 'November',
            12 => 'December',
        ];
        return $months[$month] ?? '';
    }
}
