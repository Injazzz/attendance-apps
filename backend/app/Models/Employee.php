<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Employee extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'employee_code', 'full_name', 'email', 'phone',
        'id_card', 'npwp', 'birthplace', 'birthdate',
        'gender', 'marital_status', 'tax_status',
        'department_id', 'position_id', 'site_id',
        'hire_date', 'permanent_date', 'employment_type', 'status',
        'resignation_date', 'resignation_reason',
        'emergency_contact', 'emergency_phone', 'photo_path',
    ];

    protected $casts = [
        'birthdate'        => 'date',
        'hire_date'        => 'date',
        'permanent_date'   => 'date',
        'resignation_date' => 'date',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->useDisk('public');

        $this->addMediaCollection('selfie_attendance')
            ->useDisk('public');
    }

    // ── Relationships ──────────────────────────────────────

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(CompanySite::class, 'site_id');
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function attendanceScans(): HasMany
    {
        return $this->hasMany(AttendanceScan::class);
    }

    public function overtimeRequests(): HasMany
    {
        return $this->hasMany(OvertimeRequest::class);
    }

    // ── Scopes ────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAtSite($query, int $siteId)
    {
        return $query->where('site_id', $siteId);
    }
}
