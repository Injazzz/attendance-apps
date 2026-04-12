<?php
namespace App\Exports;

use App\Repositories\AttendanceRepository;
// use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttendanceExport implements FromCollection, WithHeadings, WithStyles, WithTitle, ShouldAutoSize
{
    public function __construct(
        private readonly AttendanceRepository $repo,
        private readonly array $filters
    ) {}

    public function collection()
    {
        $records = $this->repo->getAttendanceForExport($this->filters);

        return $records->map(fn($r) => [
            'NIK'             => $r->employee->employee_code,
            'Nama'            => $r->employee->full_name,
            'Departemen'      => $r->employee->department?->dept_name,
            'Jabatan'         => $r->employee->position?->position_name,
            'Site'            => $r->site?->site_name,
            'Tanggal'         => $r->attendance_date->format('d/m/Y'),
            'Check In'        => $r->check_in_time ?? '-',
            'Check Out'       => $r->check_out_time ?? '-',
            'Total Jam'       => $r->total_hours,
            'Jam Reguler'     => $r->regular_hours,
            'Jam Lembur'      => $r->overtime_hours,
            'Telat (menit)'   => $r->late_minutes,
            'Status'          => $this->translateStatus($r->status),
        ]);
    }

    public function headings(): array
    {
        return [
            'NIK', 'Nama Karyawan', 'Departemen', 'Jabatan', 'Site',
            'Tanggal', 'Check In', 'Check Out',
            'Total Jam', 'Jam Reguler', 'Jam Lembur',
            'Telat (Menit)', 'Status',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [ // Row header
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF2563EB']
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Laporan Absensi';
    }

    private function translateStatus(string $status): string
    {
        return match($status) {
            'present'      => 'Hadir',
            'late'         => 'Terlambat',
            'absent'       => 'Absen',
            'half_day'     => 'Setengah Hari',
            'leave'        => 'Cuti',
            'sick'         => 'Sakit',
            'business_trip'=> 'Perjalanan Dinas',
            default        => $status,
        };
    }
}
