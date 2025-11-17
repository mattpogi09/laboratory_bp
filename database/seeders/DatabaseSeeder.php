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
            'username' => 'admin',
            'email' => 'admin@bpdiagnostic.com',
            'role' => 'admin',
            'password' => bcrypt('password123'),
        ]);

        // Create Lab Staff User
        User::factory()->create([
            'name' => 'KuyaDats Lab Staff',
            'username' => 'labstaff',
            'email' => 'staff@bpdiagnostic.com',
            'role' => 'lab_staff',
            'password' => bcrypt('password123'),
        ]);

        // Create Cashier User
        User::factory()->create([
            'name' => 'Jun Cashier',
            'username' => 'cashier',
            'email' => 'cashier@bpdiagnostic.com',
            'role' => 'cashier',
            'password' => bcrypt('password123'),
        ]);
    }
}
