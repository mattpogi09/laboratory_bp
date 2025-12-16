<?php

namespace Database\Seeders;

use App\Models\Discount;
use Illuminate\Database\Seeder;

class DiscountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $discounts = [
            [
                'name' => 'Senior Citizen (20%)',
                'rate' => 20.00,
                'description' => 'Discount for senior citizens (60 years old and above)',
                'is_active' => true,
            ],
            [
                'name' => 'PWD (20%)',
                'rate' => 20.00,
                'description' => 'Discount for persons with disabilities',
                'is_active' => true,
            ],
            [
                'name' => 'Employee Discount (15%)',
                'rate' => 15.00,
                'description' => 'Discount for partner employees and their dependents',
                'is_active' => true,
            ],
        ];

        foreach ($discounts as $discount) {
            Discount::updateOrCreate(
                ['name' => $discount['name']],
                $discount
            );
        }
    }
}
