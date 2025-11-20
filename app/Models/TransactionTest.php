<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'lab_test_id',
        'test_name',
        'category',
        'price',
        'status',
        'result_values',
        'result_notes',
        'performed_by',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'result_values' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function labTest()
    {
        return $this->belongsTo(LabTest::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
