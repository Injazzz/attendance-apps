<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceSummary extends Model
{
    protected $fillable = [
        'employee_id','site_id','period_year','period_month',
        'total_work_days','total_present','total_absent',
        'total_late_days','total_late_minutes',
        'total_overtime_hours','total_regular_hours','attendance_rate',
    ];

    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
