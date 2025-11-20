<?php

namespace Database\Seeders;

use App\Models\LabTest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LabTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catalog = [
            'Blood Chemistry' => [
                ['FBS', 150],
                ['Cholesterol', 250],
                ['Triglycerides', 300],
                ['HDL', 300],
                ['LDL', 200],
                ['Blood Uric Acid', 150],
                ['Blood Urea Nitrogen', 150],
                ['SGPT/ALT', 200],
                ['SGOT/AST', 200],
                ['Creatinine', 150],
                ['Sodium', 550],
                ['Potassium', 550],
                ['Calcium', 550],
                ['Ionized Calcium', 750],
                ['TSH', 750],
                ['FT3', 750],
                ['FT4', 750],
                ['T3', 750],
                ['T4', 750],
                ['HBA1C', 750],
                ['Bilirubin 1 (B1)', 450],
                ['Bilirubin 2 (B2)', 450],
                ['Alkaline Phosphatase', 450],
                ['PSA', 1300],
                ['Protime with INR', 950],
            ],
            'Hematology' => [
                ['Complete Blood Count (CBC)', 250],
                ['Blood Typing', 120],
                ['ESR', 250],
            ],
            'Clinical Microscopy' => [
                ['Routine Urinalysis', 85],
                ['14 Parameters Urinalysis', 160],
                ['Routine Fecalysis', 85],
            ],
            'Serology / Immunology' => [
                ['Urine Pregnancy Test', 180],
                ['Serum Pregnancy Test', 200],
                ['HBsAg (Hepa B)', 200],
                ['VDRL', 250],
                ['Anti HAV IgM', 400],
                ['Anti HAV IgG', 700],
                ['HCV', 400],
                ['Anti-HBs Titer', 600],
                ['Anti-HBe', 400],
                ['Typhidot', 1000],
                ['Dengue IgG % IgM', 900],
                ['H. pylori', 450],
            ],
            'Others' => [
                ['Chest X-ray', 250],
                ['ECG', 300],
                ['Drug Test', 250],
            ],
            'Procedure Ultrasound' => [
                ['Pelvic', 550],
                ['BPS', 750],
                ['TVS/TRS', 750],
                ['HBS', 750],
                ['KUB', 750],
                ['Upper ABD (HBS with pancreas and spleen)', 850],
                ['Lower ABD (KUB and Pelvic)', 1150],
                ['Whole ABD', 1550],
                ['Thyroid/Neck', 950],
                ['Both Breast', 1250],
                ['Single Breast', 950],
                ['Cranial Ultrasound', 1050],
                ['Scrotal/Inguinal', 1150],
                ['Thorax', 1150],
                ['Hemithorax', 950],
                ['Any One Organ', 750],
                ['Congenital Anomaly Scan', 2900],
            ],
        ];

        foreach ($catalog as $category => $tests) {
            foreach ($tests as [$name, $price]) {
                LabTest::updateOrCreate(
                    [
                        'code' => strtoupper(Str::slug($category . '-' . $name)),
                    ],
                    [
                        'name' => $name,
                        'category' => $category,
                        'price' => $price,
                        'description' => null,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
