<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceScan extends Model
{
    protected $fillable = [
        'employee_id','site_id','qr_session_id','scan_type',
        'scan_time','scan_date','latitude','longitude',
        'location_accuracy','device_info','status','notes',
    ];

    protected $casts = [
        'scan_time'   => 'datetime',
        'scan_date'   => 'date',
        'device_info' => 'array',
    ];

    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function site(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CompanySite::class, 'site_id');
    }

    public function qrSession(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(QrSession::class);
    }
}
