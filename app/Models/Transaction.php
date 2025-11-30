<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Yajra\Address\Entities\Region;
use Yajra\Address\Entities\Province;
use Yajra\Address\Entities\City;
use Yajra\Address\Entities\Barangay;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_number',
        'receipt_number',
        'queue_number',
        'patient_id',
        'patient_first_name',
        'patient_last_name',
        'patient_middle_name',
        'patient_age',
        'patient_gender',
        'patient_contact',
        'region_id',
        'province_id',
        'city_id',
        'barangay_code',
        'patient_street',
        'payment_status',
        'payment_method',
        'discount_name',
        'discount_rate',
        'discount_amount',
        'philhealth_name',
        'philhealth_coverage',
        'philhealth_amount',
        'net_total',
        'total_amount',
        'amount_tendered',
        'change_due',
        'balance_due',
        'lab_status',
        'notes',
        'cashier_id',
        'queued_at',
        'completed_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_rate' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'philhealth_coverage' => 'decimal:2',
        'philhealth_amount' => 'decimal:2',
        'net_total' => 'decimal:2',
        'amount_tendered' => 'decimal:2',
        'change_due' => 'decimal:2',
        'balance_due' => 'decimal:2',
        'queued_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'patient_full_name',
        'patient_formatted_address',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function tests()
    {
        return $this->hasMany(TransactionTest::class);
    }

    public function events()
    {
        return $this->hasMany(TransactionEvent::class)->latest();
    }

    public function resultSubmission()
    {
        return $this->hasOne(ResultSubmission::class);
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

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', now()->toDateString());
    }

    public function refreshLabStatus(): void
    {
        $statuses = $this->tests()->pluck('status')->unique();

        if ($statuses->count() === 0) {
            $this->lab_status = 'pending';
        } elseif ($statuses->every(fn($status) => $status === 'released')) {
            $this->lab_status = 'released';
            $this->completed_at = $this->completed_at ?? now();
        } elseif ($statuses->every(fn($status) => in_array($status, ['completed', 'released']))) {
            $this->lab_status = 'completed';
        } elseif ($statuses->contains('processing')) {
            $this->lab_status = 'processing';
        } else {
            $this->lab_status = 'pending';
        }

        $this->save();
    }

    public function getPatientFullNameAttribute(): string
    {
        return trim(collect([
            $this->patient_first_name,
            $this->patient_middle_name,
            $this->patient_last_name,
        ])->filter()->join(' '));
    }

    public function getPatientFormattedAddressAttribute(): string
    {
        $parts = array_filter([
            $this->patient_street,
            $this->barangay?->name,
            $this->city?->name,
            $this->province?->name,
            $this->region?->name,
        ]);

        return implode(', ', $parts);
    }
}
