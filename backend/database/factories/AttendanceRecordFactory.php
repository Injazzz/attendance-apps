<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceRecordFactory extends Factory
{
    public function definition(): array
    {
        $checkIn  = $this->faker->dateTimeBetween('07:00:00', '09:30:00');
        $checkOut = $this->faker->dateTimeBetween('16:00:00', '18:30:00');

        $totalHours   = round(
            ($checkOut->getTimestamp() - $checkIn->getTimestamp()) / 3600, 2
        );
        $regularHours = min($totalHours, 8);
        $overtime     = max(0, $totalHours - 8);

        $checkInTime   = $checkIn->format('H:i:s');
        $lateMinutes   = 0;
        $status        = 'present';

        // Jika check in setelah 08:15 maka terlambat
        if ($checkIn->format('H') >= 8 && $checkIn->format('i') > 15) {
            $lateMinutes = (int)(($checkIn->getTimestamp() - strtotime('08:15:00')) / 60);
            $status      = 'late';
        }

        return [
            'attendance_date' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'check_in_time'   => $checkInTime,
            'check_out_time'  => $checkOut->format('H:i:s'),
            'total_hours'     => $totalHours,
            'regular_hours'   => $regularHours,
            'overtime_hours'  => $overtime,
            'late_minutes'    => $lateMinutes,
            'early_minutes'   => 0,
            'status'          => $status,
            'shift_type'      => 'normal',
        ];
    }

    public function present(): static
    {
        return $this->state(fn() => [
            'check_in_time'  => '07:55:00',
            'check_out_time' => '17:05:00',
            'status'         => 'present',
            'late_minutes'   => 0,
        ]);
    }

    public function late(): static
    {
        return $this->state(fn() => [
            'check_in_time' => '08:45:00',
            'status'        => 'late',
            'late_minutes'  => 30,
        ]);
    }

    public function absent(): static
    {
        return $this->state(fn() => [
            'check_in_time'  => null,
            'check_out_time' => null,
            'total_hours'    => 0,
            'status'         => 'absent',
        ]);
    }
}
