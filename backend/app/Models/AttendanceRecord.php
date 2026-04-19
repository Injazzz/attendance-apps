<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    protected $fillable = [
        'employee_id', 'site_id', 'attendance_date',
        'check_in_time', 'check_out_time',
        'total_hours', 'regular_hours', 'overtime_hours',
        'late_minutes', 'early_minutes',
        'status', 'shift_type', 'notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'total_hours'     => 'decimal:2',
        'regular_hours'   => 'decimal:2',
        'overtime_hours'  => 'decimal:2',
    ];

    // ── Relationships ──────────────────────────────────────

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(CompanySite::class, 'site_id');
    }

    // ── Scopes ────────────────────────────────────────────

    public function scopeByDate($query, $date)
    {
        return $query->where('attendance_date', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('attendance_date', [$startDate, $endDate]);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
