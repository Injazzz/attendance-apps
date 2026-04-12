<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = [
        'job_family_id','position_code','position_name',
        'position_level','job_description','min_qualification','custom_permissions',
    ];

    protected $casts = ['custom_permissions' => 'array'];

    public function jobFamily(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JobFamily::class);
    }

    public function employees(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
