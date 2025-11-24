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
        $this->call(LabTestSeeder::class);
        $this->call(InventorySeeder::class);

        // Create Admin User
        User::factory()->create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@bpdiagnostic.com',
            'role' => 'admin',
            'is_active' => true,
            'password' => bcrypt('password123'),
        ]);

        // Create Lab Staff User
        User::factory()->create([
            'name' => 'KuyaDats Lab Staff',
            'username' => 'labstaff',
            'email' => 'staff@bpdiagnostic.com',
            'role' => 'lab_staff',
            'is_active' => true,
            'password' => bcrypt('password123'),
        ]);

        // Create Cashier User
        User::factory()->create([
            'name' => 'Jun Cashier',
            'username' => 'cashier',
            'email' => 'cashier@bpdiagnostic.com',
            'role' => 'cashier',
            'is_active' => true,
            'password' => bcrypt('password123'),
        ]);
    }
}
