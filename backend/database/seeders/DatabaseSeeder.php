<?php

namespace Database\Seeders;

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
        $this->call([
            RbacSeeder::class,           // 1. Roles & permissions dulu
            JobFamilySeeder::class,      // 2. Job families
            CompanySeeder::class,        // 3. Data perusahaan
            SystemSettingSeeder::class,  // 4. Setting sistem
            AdminUserSeeder::class,      // 5. Super admin user
            UserSeeder::class,           // 6. Test users dengan berbagai roles
        ]);
    }
}
