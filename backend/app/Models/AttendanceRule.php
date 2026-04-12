<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRule extends Model
{
    protected $fillable = [
        'rule_name','start_time','end_time','late_threshold',
        'late_deduction_per_minute','late_grace_period',
        'max_late_minutes_per_month','overtime_start_after',
    ];
}
