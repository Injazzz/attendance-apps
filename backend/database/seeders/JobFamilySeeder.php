<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobFamily;

class JobFamilySeeder extends Seeder
{
    public function run(): void
    {
        $jobFamilies = [
            [
                'family_code'       => 'MGMT',
                'family_name'       => 'Management',
                'level_range_start' => 1,
                'level_range_end'   => 10,
            ],
            [
                'family_code'       => 'IT',
                'family_name'       => 'Information Technology',
                'level_range_start' => 1,
                'level_range_end'   => 9,
            ],
            [
                'family_code'       => 'FIN',
                'family_name'       => 'Finance',
                'level_range_start' => 1,
                'level_range_end'   => 8,
            ],
            [
                'family_code'       => 'HR',
                'family_name'       => 'Human Resources',
                'level_range_start' => 1,
                'level_range_end'   => 8,
            ],
            [
                'family_code'       => 'MKT',
                'family_name'       => 'Marketing',
                'level_range_start' => 1,
                'level_range_end'   => 8,
            ],
            [
                'family_code'       => 'OPS',
                'family_name'       => 'Operations',
                'level_range_start' => 1,
                'level_range_end'   => 9,
            ],
            [
                'family_code'       => 'SALE',
                'family_name'       => 'Sales',
                'level_range_start' => 1,
                'level_range_end'   => 8,
            ],
            [
                'family_code'       => 'TECH',
                'family_name'       => 'Technical Support',
                'level_range_start' => 1,
                'level_range_end'   => 7,
            ],
            [
                'family_code'       => 'ADMIN',
                'family_name'       => 'Administrative',
                'level_range_start' => 1,
                'level_range_end'   => 6,
            ],
            [
                'family_code'       => 'PROD',
                'family_name'       => 'Production',
                'level_range_start' => 1,
                'level_range_end'   => 8,
            ],
            [
                'family_code'       => 'QA',
                'family_name'       => 'Quality Assurance',
                'level_range_start' => 1,
                'level_range_end'   => 7,
            ],
            [
                'family_code'       => 'PROJ',
                'family_name'       => 'Project Management',
                'level_range_start' => 1,
                'level_range_end'   => 9,
            ],
        ];

        foreach ($jobFamilies as $family) {
            JobFamily::create($family);
        }

        $this->command->info('Job Families seeded successfully!');
    }
}
