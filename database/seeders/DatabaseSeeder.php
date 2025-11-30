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
        $this->command->info('Starting database seeding...');
        $this->command->newLine();
        
        // Seed Philippines address data (regions, provinces, cities, barangays)
        // Note: This takes a long time (2-3 minutes) as it seeds 42,000+ barangays
        // Check if address data already exists to skip if not needed
        $regionsCount = \DB::table('regions')->count();
        if ($regionsCount === 0) {
            $this->command->info('Seeding Philippines address data (this may take 2-3 minutes)...');
            $this->command->warn('Please wait, this is a large dataset (42,000+ barangays)...');
            try {
                $this->call(\Yajra\Address\Seeders\AddressSeeder::class);
                $this->command->info('✓ Address data seeded successfully');
            } catch (\Exception $e) {
                $this->command->error('✗ Address data seeding failed: ' . $e->getMessage());
                $this->command->warn('Continuing with other seeders...');
            }
        } else {
            $this->command->info('Address data already exists (' . $regionsCount . ' regions found). Skipping...');
        }
        $this->command->newLine();
        
        // Seed Lab Tests
        $this->command->info('Seeding lab tests...');
        try {
            $this->call(LabTestSeeder::class);
            $this->command->info('✓ Lab tests seeded successfully');
        } catch (\Exception $e) {
            $this->command->error('✗ Lab tests seeding failed: ' . $e->getMessage());
        }
        $this->command->newLine();
        
        // Seed Inventory
        $this->command->info('Seeding inventory...');
        try {
            $this->call(InventorySeeder::class);
            $this->command->info('✓ Inventory seeded successfully');
        } catch (\Exception $e) {
            $this->command->error('✗ Inventory seeding failed: ' . $e->getMessage());
        }
        $this->command->newLine();
        
        // Seed Discounts
        $this->command->info('Seeding discounts...');
        try {
            $this->call(DiscountSeeder::class);
            $this->command->info('✓ Discounts seeded successfully');
        } catch (\Exception $e) {
            $this->command->error('✗ Discounts seeding failed: ' . $e->getMessage());
        }
        $this->command->newLine();
        
        // Seed PhilHealth Plans
        $this->command->info('Seeding PhilHealth plans...');
        try {
            $this->call(PhilHealthPlanSeeder::class);
            $this->command->info('✓ PhilHealth plans seeded successfully');
        } catch (\Exception $e) {
            $this->command->error('✗ PhilHealth plans seeding failed: ' . $e->getMessage());
        }
        $this->command->newLine();

        // Create Users
        $this->command->info('Creating users...');
        try {
            // Create Admin User
            User::updateOrCreate(
                ['username' => 'superadmin'],
                [
                    'name' => ' Super Admin User',
                    'email' => 'admin@gmail.com',
                    'role' => 'admin',
                    'is_active' => true,
                    'is_super_admin' => true,
                    'password' => bcrypt('password123'),
                ]
            );
            $this->command->info('✓ Admin user created (Super Admin - Protected)');

            // Create Lab Staff User
            User::updateOrCreate(
                ['username' => 'labstaff'],
                [
                    'name' => 'KuyaDats Lab Staff',
                    'email' => 'staff@gmail.com',
                    'role' => 'lab_staff',
                    'is_active' => true,
                    'password' => bcrypt('password123'),
                ]
            );
            $this->command->info('✓ Lab staff user created');

            // Create Cashier User
            User::updateOrCreate(
                ['username' => 'cashier'],
                [
                    'name' => 'Jun Cashier',
                    'email' => 'cashier@gmail.com',
                    'role' => 'cashier',
                    'is_active' => true,
                    'password' => bcrypt('password123'),
                ]
            );
            $this->command->info('✓ Cashier user created');
        } catch (\Exception $e) {
            $this->command->error('✗ Users creation failed: ' . $e->getMessage());
        }
        
        $this->command->newLine();
        $this->command->info('Database seeding completed!');
    }
}
