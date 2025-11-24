<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'current_stock',
        'minimum_stock',
        'unit',
        'status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['stock_color', 'status_badge'];

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'item_id');
    }

    public function updateStatus(): void
    {
        if ($this->current_stock == 0) {
            $this->status = 'out_of_stock';
        } elseif ($this->current_stock < $this->minimum_stock) {
            $this->status = 'low_stock';
        } else {
            $this->status = 'good';
        }
        $this->save();
    }

    public function getStockColorAttribute(): string
    {
        return match ($this->status) {
            'good' => 'text-green-600',
            'low_stock' => 'text-yellow-600',
            'out_of_stock' => 'text-red-600',
            default => 'text-gray-600',
        };
    }

    public function getStatusBadgeAttribute(): array
    {
        return match ($this->status) {
            'good' => ['text' => 'Good', 'class' => 'bg-green-100 text-green-800 border-green-300'],
            'low_stock' => ['text' => 'Low Stock', 'class' => 'bg-yellow-100 text-yellow-800 border-yellow-300'],
            'out_of_stock' => ['text' => 'Out of Stock', 'class' => 'bg-red-100 text-red-800 border-red-300'],
            default => ['text' => 'Unknown', 'class' => 'bg-gray-100 text-gray-800 border-gray-300'],
        };
    }
}
