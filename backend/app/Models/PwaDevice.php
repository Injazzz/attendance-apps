<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PwaDevice extends Model
{
    protected $fillable = [
        'user_id',
        'device_fingerprint',
        'browser_token',
        'device_info',
        'last_active',
        'status',
    ];

    protected $casts = [
        'device_info' => 'array',
        'last_active' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
