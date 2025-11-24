<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhilHealthPlan extends Model
{
    protected $fillable = [
        'name',
        'coverage_rate',
        'description',
        'is_active',
    ];

    protected $casts = [
        'coverage_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
