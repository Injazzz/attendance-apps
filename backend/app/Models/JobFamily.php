<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobFamily extends Model
{
    protected $fillable = ['family_code','family_name','level_range_start','level_range_end'];

    public function positions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Position::class);
    }
}
