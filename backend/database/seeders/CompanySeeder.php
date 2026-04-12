<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\CompanySite;
use App\Models\JobFamily;
use App\Models\Position;
use App\Models\Department;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat perusahaan default
        $company = Company::create([
            'company_code'  => 'COMP001',
            'company_name'  => 'PT. Contoh Perusahaan',
            'industry_type' => 'construction',
            'address'       => 'Jl. Contoh No. 1, Jakarta',
            'phone'         => '021-1234567',
            'email'         => 'info@contoh.co.id',
        ]);

        // 2. Buat site/proyek default
        $site = CompanySite::create([
            'company_id'     => $company->id,
            'site_code'      => 'SITE001',
            'site_name'      => 'Kantor Pusat',
            'address'        => 'Jl. Kantor No. 1, Jakarta',
            'project_manager'=> 'Admin',
            'start_date'     => today(),
            'status'         => 'active',
            'gps_latitude'   => -6.2088,  // Koordinat Jakarta (ubah sesuai lokasi)
            'gps_longitude'  => 106.8456,
            'gps_radius'     => 100,      // 100 meter radius
        ]);

        // 3. Job Family
        $jobFamily = JobFamily::create([
            'family_code'       => 'MGMT',
            'family_name'       => 'Management',
            'level_range_start' => 1,
            'level_range_end'   => 10,
        ]);

        // 4. Posisi default
        $posisiAdmin = Position::create([
            'job_family_id'  => $jobFamily->id,
            'position_code'  => 'POS001',
            'position_name'  => 'System Administrator',
            'position_level' => 1,
            'job_description'=> 'Mengelola sistem informasi perusahaan',
            'min_qualification'=> 'S1 Teknik Informatika',
        ]);

        // 5. Departemen default (department_head_id diisi null dulu, update setelah ada employee)
        $dept = Department::create([
            'company_id'           => $company->id,
            'dept_code'            => 'IT',
            'dept_name'            => 'Information Technology',
            'cost_center'          => 'CC-IT-001',
            'department_head_id'   => null,
            'parent_department_id' => null,
        ]);

        // Simpan ID ke config untuk referensi AdminUserSeeder
        $this->command->info("Company ID: {$company->id}");
        $this->command->info("Site ID: {$site->id}");
        $this->command->info("Department ID: {$dept->id}");
        $this->command->info("Position ID: {$posisiAdmin->id}");
    }
}
