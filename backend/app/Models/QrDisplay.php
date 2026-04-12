<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QrDisplay extends Model
{
    protected $fillable = [
        'site_id','display_code','display_name','location',
        'department_id','qr_type','refresh_mode',
        'time_interval','max_scans','status',
    ];

    public function site(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CompanySite::class, 'site_id');
    }

    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function sessions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(QrSession::class, 'display_id');
    }

    public function activeSession(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(QrSession::class, 'display_id')
            ->where('is_active', true)
            ->where('valid_to', '>', now());
    }
}
