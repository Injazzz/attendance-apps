<?php
namespace App\Enums;

enum AttendanceStatus: string
{
    case Present      = 'present';
    case Late         = 'late';
    case Absent       = 'absent';
    case HalfDay      = 'half_day';
    case Leave        = 'leave';
    case Sick         = 'sick';
    case BusinessTrip = 'business_trip';

    public function label(): string
    {
        return match($this) {
            self::Present      => 'Hadir',
            self::Late         => 'Terlambat',
            self::Absent       => 'Absen',
            self::HalfDay      => 'Setengah Hari',
            self::Leave        => 'Cuti',
            self::Sick         => 'Sakit',
            self::BusinessTrip => 'Perjalanan Dinas',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Present      => 'green',
            self::Late         => 'yellow',
            self::Absent       => 'red',
            self::HalfDay      => 'orange',
            self::Leave        => 'blue',
            self::Sick         => 'purple',
            self::BusinessTrip => 'gray',
        };
    }
}
