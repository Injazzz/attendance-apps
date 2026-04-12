<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceRecordResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'date'           => $this->attendance_date->format('Y-m-d'),
            'date_formatted' => $this->attendance_date->translatedFormat('l, d F Y'),
            'check_in'       => $this->check_in_time,
            'check_out'      => $this->check_out_time,
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
}
