<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@bpdiagnostic.com',
            'password' => bcrypt('password123'),
        ]);

        // Create Lab Staff User
        User::factory()->create([
            'name' => 'KuyaDats Lab Staff',
            'email' => 'staff@bpdiagnostic.com',
            'password' => bcrypt('password123'),
        ]);

        // Create Cashier User
        User::factory()->create([
            'name' => 'Jun Cashier',
            'email' => 'cashier@bpdiagnostic.com',
            'password' => bcrypt('password123'),
        ]);
    }
}
