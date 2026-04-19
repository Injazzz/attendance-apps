<?php
namespace App\Services;

use App\Models\AttendanceRule;
use App\Models\Employee;

class AttendanceRuleService extends BaseService
{
    public function getRuleForEmployee(Employee $employee): AttendanceRule
    {
        // Ambil aturan pertama (nanti bisa dikembangkan per-departemen/shift)
        return AttendanceRule::first() ?? $this->getDefaultRule();
    }

    private function getDefaultRule(): AttendanceRule
    {
        return new AttendanceRule([
            'start_time'                  => '08:00:00',
            'end_time'                    => '17:00:00',
            'late_threshold'              => 30,
            'late_grace_period'           => 15,
            'max_late_minutes_per_month'  => 120,
            'overtime_start_after'        => 60,
        ]);
    }
}
