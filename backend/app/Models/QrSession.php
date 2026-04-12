<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QrSession extends Model
{
    protected $fillable = [
        'session_token','display_id','site_id','qr_data',
        'qr_type','valid_from','valid_to','current_scans','is_active'
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_to' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function display(): BelongsTo
    {
        return $this->belongsTo(QrDisplay::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(CompanySite::class);
    }

    public function scans(): HasMany
    {
        return $this->hasMany(AttendanceScan::class, 'qr_session_id');
    }

    public function isValid(): bool
    {
        return $this->is_active
            && now()->between($this->valid_from, $this->valid_to);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('valid_to', '>', now());
    }
}
