<?php
namespace App\Repositories\Contracts;

interface AttendanceRepositoryInterface
{
    public function getEmployeeAttendanceByPeriod(int $employeeId, string $start, string $end): mixed;
    public function getDailySummaryBySite(int $siteId, string $date): mixed;
    public function getPendingOvertimes(int $supervisorId): mixed;
}
