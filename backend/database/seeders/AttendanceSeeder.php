<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Status absensi yang tersedia:
     * - present (normal)
     * - late (terlambat)
     * - absent (tidak hadir)
     * - half_day (setengah hari)
     * - leave (cuti)
     * - sick (sakit)
     * - business_trip (perjalanan dinas)
     */
    public function run(): void
    {
        // Get 10 employees yang baru dibuat (dengan prefix EMP-EMP-)
        $employees = Employee::where('employee_code', 'like', 'EMP-EMP-%')
            ->orderBy('employee_code')
            ->take(10)
            ->get();

        if ($employees->isEmpty()) {
            $this->command->error('❌ Tidak ada employee ditemukan dengan prefix EMP-EMP-');
            $this->command->error('Pastikan EmployeeSeeder telah dijalankan terlebih dahulu\n');
            return;
        }

        // Generate 30 hari terakhir untuk setiap employee
        $startDate = now()->subDays(30);
        $totalRecords = 0;

        foreach ($employees as $employee) {
            // Status distribution yang realistis untuk 30 hari
            $statusDistribution = [
                'present'       => 18,  // Normal 18 hari
                'late'          => 4,   // Terlambat 4 hari
                'absent'        => 2,   // Tidak hadir 2 hari
                'half_day'      => 2,   // Setengah hari 2 hari
                'leave'         => 2,   // Cuti 2 hari
                'sick'          => 1,   // Sakit 1 hari
                'business_trip' => 1,   // Perjalanan dinas 1 hari
            ];

            // Buat array status dengan distribusi yang tepat
            $statuses = [];
            foreach ($statusDistribution as $status => $count) {
                for ($i = 0; $i < $count; $i++) {
                    $statuses[] = $status;
                }
            }

            // Shuffle untuk membuat urutan random
            shuffle($statuses);

            // Buat record untuk 30 hari
            for ($day = 0; $day < 30; $day++) {
                $date = $startDate->copy()->addDays($day);

                // Skip weekends (Sabtu = 6, Minggu = 0)
                if ($date->dayOfWeek == 0 || $date->dayOfWeek == 6) {
                    continue;
                }

                // Skip jika sudah ada record untuk employee di hari ini
                if (AttendanceRecord::where('employee_id', $employee->id)
                    ->where('attendance_date', $date)
                    ->exists()) {
                    continue;
                }

                $status = $statuses[$day] ?? 'present';
                $attendanceData = $this->generateAttendanceData($status);

                AttendanceRecord::create([
                    'employee_id'    => $employee->id,
                    'site_id'        => $employee->site_id,
                    'attendance_date' => $date,
                    'check_in_time'   => $attendanceData['check_in'],
                    'check_out_time'  => $attendanceData['check_out'],
                    'total_hours'     => $attendanceData['total_hours'],
                    'regular_hours'   => $attendanceData['regular_hours'],
                    'overtime_hours'  => $attendanceData['overtime_hours'],
                    'late_minutes'    => $attendanceData['late_minutes'],
                    'early_minutes'   => $attendanceData['early_minutes'],
                    'status'          => $status,
                    'shift_type'      => $attendanceData['shift_type'],
                    'notes'           => $attendanceData['notes'],
                ]);

                $totalRecords++;
            }

            $this->command->info("✓ {$employee->employee_code} - {$employee->full_name}: Attendance record dibuat");
        }

        $this->command->info('');
        $this->command->info("✓ Total {$totalRecords} attendance record berhasil dibuat!");
        $this->command->info('');

        // Summary
        $summaryData = AttendanceRecord::selectRaw('status, COUNT(*) as count')
            ->whereIn('employee_id', $employees->pluck('id'))
            ->groupBy('status')
            ->get();

        $this->command->info('Ringkasan Status Absensi:');
        $this->command->table(
            ['Status', 'Jumlah'],
            $summaryData->map(fn($s) => [$s->status, $s->count])->toArray()
        );
    }

    /**
     * Generate attendance data berdasarkan status
     */
    private function generateAttendanceData(string $status): array
    {
        return match ($status) {
            'present' => [
                'check_in' => Carbon::createFromTimeString('08:00:00')->subMinutes(rand(0, 5))->format('H:i:s'),
                'check_out' => Carbon::createFromTimeString('17:00:00')->addMinutes(rand(0, 10))->format('H:i:s'),
                'total_hours' => 9.0,
                'regular_hours' => 9.0,
                'overtime_hours' => 0,
                'late_minutes' => 0,
                'early_minutes' => 0,
                'shift_type' => 'normal',
                'notes' => 'On time'
            ],
            'late' => [
                'check_in' => Carbon::createFromTimeString('08:00:00')->addMinutes(rand(15, 60))->format('H:i:s'),
                'check_out' => Carbon::createFromTimeString('17:00:00')->addMinutes(rand(0, 15))->format('H:i:s'),
                'total_hours' => 8.0,
                'regular_hours' => 8.0,
                'overtime_hours' => 0,
                'late_minutes' => rand(15, 60),
                'early_minutes' => 0,
                'shift_type' => 'normal',
                'notes' => 'Terlambat masuk'
            ],
            'absent' => [
                'check_in' => null,
                'check_out' => null,
                'total_hours' => 0,
                'regular_hours' => 0,
                'overtime_hours' => 0,
                'late_minutes' => 0,
                'early_minutes' => 0,
                'shift_type' => 'normal',
                'notes' => 'Tidak hadir'
            ],
            'half_day' => [
                'check_in' => Carbon::createFromTimeString('08:00:00')->subMinutes(rand(0, 5))->format('H:i:s'),
                'check_out' => Carbon::createFromTimeString('17:00:00')->subHours(4)->format('H:i:s'),
                'total_hours' => 4.5,
                'regular_hours' => 4.5,
                'overtime_hours' => 0,
                'late_minutes' => 0,
                'early_minutes' => rand(200, 300),
                'shift_type' => 'normal',
                'notes' => 'Pulang lebih awal'
            ],
            'leave' => [
                'check_in' => null,
                'check_out' => null,
                'total_hours' => 0,
                'regular_hours' => 0,
                'overtime_hours' => 0,
                'late_minutes' => 0,
                'early_minutes' => 0,
                'shift_type' => 'normal',
                'notes' => 'Cuti resmi / personal'
            ],
            'sick' => [
                'check_in' => null,
                'check_out' => null,
                'total_hours' => 0,
                'regular_hours' => 0,
                'overtime_hours' => 0,
                'late_minutes' => 0,
                'early_minutes' => 0,
                'shift_type' => 'normal',
                'notes' => 'Izin sakit'
            ],
            'business_trip' => [
                'check_in' => Carbon::createFromTimeString('08:00:00')->subMinutes(rand(5, 15))->format('H:i:s'),
                'check_out' => Carbon::createFromTimeString('17:00:00')->addMinutes(rand(30, 120))->format('H:i:s'),
                'total_hours' => 10.0,
                'regular_hours' => 8.0,
                'overtime_hours' => 2.0,
                'late_minutes' => 0,
                'early_minutes' => 0,
                'shift_type' => 'normal',
                'notes' => 'Perjalanan dinas'
            ],
            default => [
                'check_in' => Carbon::createFromTimeString('08:00:00')->format('H:i:s'),
                'check_out' => Carbon::createFromTimeString('17:00:00')->format('H:i:s'),
                'total_hours' => 9.0,
                'regular_hours' => 9.0,
                'overtime_hours' => 0,
                'late_minutes' => 0,
                'early_minutes' => 0,
                'shift_type' => 'normal',
                'notes' => null
            ]
        };
    }
}
