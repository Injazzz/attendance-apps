<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\OvertimeStatus;

class OvertimeRequest extends Model
{
    protected $fillable = [
        'employee_id','site_id','overtime_date','start_time',
        'end_time','total_hours','reason','status',
        'approved_by','approved_at','rejection_reason',
    ];

    protected $casts = [
        'overtime_date' => 'date',
        'approved_at'   => 'datetime',
        'status'        => OvertimeStatus::class,
    ];

    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Employee::class, 'approved_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', OvertimeStatus::Pending);
    }
}
