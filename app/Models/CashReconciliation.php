<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashReconciliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reconciliation_date',
        'expected_cash',
        'actual_cash',
        'variance',
        'transaction_count',
        'notes',
        'cashier_id',
        'correction_requested',
        'correction_reason',
        'correction_requested_at',
        'is_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'reconciliation_date' => 'date',
        'expected_cash' => 'decimal:2',
        'actual_cash' => 'decimal:2',
        'variance' => 'decimal:2',
        'correction_requested' => 'boolean',
        'correction_requested_at' => 'datetime',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get status based on variance
     */
    public function getStatusAttribute(): string
    {
        if ($this->variance == 0) {
            return 'balanced';
        } elseif ($this->variance > 0) {
            return 'overage';
        } else {
            return 'shortage';
        }
    }

    /**
     * Get variance type for display
     */
    public function getVarianceTypeAttribute(): string
    {
        if ($this->variance == 0) {
            return 'Balanced';
        } elseif ($this->variance > 0) {
            return 'Overage';
        } else {
            return 'Shortage';
        }
    }

    /**
     * Get absolute variance
     */
    public function getAbsoluteVarianceAttribute(): float
    {
        return abs($this->variance);
    }
}
