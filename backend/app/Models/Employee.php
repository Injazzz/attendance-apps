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

    // ── Accessors ─────────────────────────────────────────

    /**
     * Get photo URL - from database first, fallback to media library
     */
    public function getPhotoUrlAttribute(): ?string
    {
        // Return stored URL dari database (yang diset saat upload)
        if ($this->photo_path) {
            $url = $this->photo_path;

            // Fix localhost URLs without port
            if (str_starts_with($url, 'http://localhost/') && !str_contains($url, 'localhost:')) {
                $url = str_replace('http://localhost/', 'http://localhost:8000/', $url);
            }

            // If already absolute URL, return fixed version with cache buster
            if (str_starts_with($url, 'http')) {
                // Add timestamp to prevent caching
                $timestamp = $this->updated_at ? $this->updated_at->timestamp : time();
                $separator = str_contains($url, '?') ? '&' : '?';
                return $url . $separator . 't=' . $timestamp;
            }

            // If relative path, prepend base URL for frontend with cache buster
            $baseUrl = config('app.url') ?: 'http://localhost:8000';
            $fullUrl = $baseUrl . $url;
            $timestamp = $this->updated_at ? $this->updated_at->timestamp : time();
            $separator = str_contains($fullUrl, '?') ? '&' : '?';
            return $fullUrl . $separator . 't=' . $timestamp;
        }

        // Fallback ke media library (legacy)
        $mediaUrl = $this->getFirstMediaUrl('photo');
        if ($mediaUrl) {
            $timestamp = $this->updated_at ? $this->updated_at->timestamp : time();
            $separator = str_contains($mediaUrl, '?') ? '&' : '?';
            return $mediaUrl . $separator . 't=' . $timestamp;
        }

        return null;
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
