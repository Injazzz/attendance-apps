<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\CausesActivity;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, CausesActivity, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'employee_id',
        'name',
        'username',
        'email',
        'password',
        'role',
        'is_active',
        'email_verified_at',
        'last_login',
        'failed_login_attempts',
        'locked_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active'          => 'boolean',
        'email_verified_at'  => 'datetime',
        'last_login'         => 'datetime',
        'locked_until'       => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function devices(): HasMany
    {
        return $this->hasMany(PwaDevice::class, 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    // ── Helper Methods ────────────────────────────────────

    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    public function incrementFailedAttempts(): void
    {
        $attempts = $this->failed_login_attempts + 1;
        $updates  = ['failed_login_attempts' => $attempts];

        if ($attempts >= 5) {
            $updates['locked_until'] = now()->addMinutes(30);
        }

        $this->update($updates);
    }

    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_login_attempts' => 0,
            'locked_until'          => null,
            'last_login'            => now(),
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function hasEmployee(): bool
    {
        return !is_null($this->employee_id);
    }
}
