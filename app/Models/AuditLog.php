<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class AuditLog extends Model
{
    public $timestamps = false; // Only using created_at

    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'action_type',
        'action_category',
        'description',
        'metadata',
        'ip_address',
        'severity',
        'entity_type',
        'entity_id',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scopes for efficient queries
    public function scopeRecent(Builder $query)
    {
        return $query->where('created_at', '>=', now()->subDays(60));
    }

    public function scopeByRole(Builder $query, string $role)
    {
        return $query->where('user_role', $role);
    }

    public function scopeByCategory(Builder $query, string $category)
    {
        return $query->where('action_category', $category);
    }

    public function scopeBySeverity(Builder $query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeDateRange(Builder $query, $from = null, $to = null)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    /**
     * Search scope with SQL injection protection via Eloquent parameter binding.
     * All user inputs are automatically escaped by Laravel's query builder.
     * Uses ILIKE for case-insensitive PostgreSQL searches.
     */
    public function scopeSearch(Builder $query, ?string $search)
    {
        if (!$search) {
            return $query;
        }

        // Eloquent automatically binds parameters, preventing SQL injection
        return $query->where(function ($q) use ($search) {
            $q->where('user_name', 'ilike', "%{$search}%")
                ->orWhere('description', 'ilike', "%{$search}%")
                ->orWhere('action_type', 'ilike', "%{$search}%");
        });
    }
}
