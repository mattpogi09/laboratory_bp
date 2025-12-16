<?php

namespace Database\Seeders;

use App\Models\PhilHealthPlan;
use Illuminate\Database\Seeder;

class PhilHealthPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'PhilHealth Basic',
                'coverage_rate' => 50.00,
                'description' => 'Basic PhilHealth coverage plan - covers 50% of eligible expenses',
                'is_active' => true,
            ],
            [
                'name' => 'PhilHealth Plus',
                'coverage_rate' => 75.00,
                'description' => 'Enhanced PhilHealth coverage plan - covers 75% of eligible expenses',
                'is_active' => true,
            ],
            [
                'name' => 'PhilHealth Free Consultation',
                'coverage_rate' => 100.00,
                'description' => 'Premium PhilHealth coverage plan - covers 100% of eligible consultation expenses',
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            PhilHealthPlan::updateOrCreate(
                ['name' => $plan['name']],
                $plan
            );
        }
    }
}
