<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'role',
        'test_categories',
        'is_active',
        'is_super_admin',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'test_categories' => 'array',
        ];
    }

    /**
     * Available test categories
     */
    public static function getAvailableCategories(): array
    {
        return [
            'Blood Chemistry',
            'Hematology',
            'Clinical Microscopy',
            'Serology / Immunology',
            'Procedure Ultrasound',
            'X-ray',
            'Drug Test',
            'Others',
        ];
    }

    /**
     * Check if user has access to a specific test category
     */
    public function hasAccessToCategory(string $category): bool
    {
        // Non-lab staff have access to all categories
        if ($this->role !== 'lab_staff') {
            return true;
        }

        // Lab staff with no categories assigned have no access
        if (empty($this->test_categories)) {
            return false;
        }

        // Check if category is in assigned categories
        return in_array($category, $this->test_categories);
    }

    /**
     * Get filtered test categories for this user
     */
    public function getAllowedCategories(): array
    {
        // Non-lab staff can access all categories
        if ($this->role !== 'lab_staff') {
            return self::getAvailableCategories();
        }

        // Return assigned categories or empty array
        return $this->test_categories ?? [];
    }

    /**
     * Check if user is a super admin (protected account)
     */
    public function isSuperAdmin(): bool
    {
        return $this->id === 1;
    }

    /**
     * Check if this user can be deleted/deactivated
     */
    public function canBeModified(): bool
    {
        return $this->id !== 1;
    }
}
