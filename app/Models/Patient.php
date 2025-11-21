<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'age',
        'gender',
        'contact_number',
        'address',
        'birth_date',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected $appends = [
        'full_name',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
