<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Yajra\Address\Entities\Region;
use Yajra\Address\Entities\Province;
use Yajra\Address\Entities\City;
use Yajra\Address\Entities\Barangay;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'is_active',
        'date_of_birth',
        'age',
        'gender',
        'contact_number',
        'region_id',
        'province_id',
        'city_id',
        'barangay_code',
        'street',
        'birth_date',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'full_name',
        'formatted_address',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Scope for active patients only
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Address relationships using PSGC codes (strings)
    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id', 'region_id');
    }

    public function province()
    {
        return $this->belongsTo(Province::class, 'province_id', 'province_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id', 'city_id');
    }

    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangay_code', 'code');
    }

    public function getFullNameAttribute(): string
    {
        $middleName = $this->middle_name ? " {$this->middle_name} " : ' ';
        return trim("{$this->first_name}{$middleName}{$this->last_name}");
    }

    public function getFormattedAddressAttribute(): string
    {
        $parts = array_filter([
            $this->street,
            $this->barangay?->name,
            $this->city?->name,
            $this->province?->name,
            $this->region?->name,
        ]);

        return implode(', ', $parts);
    }
}
