<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySite extends Model
{
    protected $fillable = [
        'company_id','site_code','site_name','address',
        'project_manager','start_date','end_date','status',
        'gps_latitude','gps_longitude','gps_radius',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function employees(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Employee::class, 'site_id');
    }

    public function qrDisplays(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(QrDisplay::class, 'site_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
