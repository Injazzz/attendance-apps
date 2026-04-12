<?php

namespace Database\Seeders;

use App\Models\CompanySite;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $dept     = Department::first();
        $position = Position::first();
        $site     = CompanySite::first();

        // 1. Buat data employee untuk super admin
        $employee = Employee::create([
            'employee_code'   => 'EMP-ADMIN-001',
            'full_name'       => 'Super Administrator',
            'email'           => 'superadmin.emp@company.com',
            'phone'           => '08123456789',
            'gender'          => 'male',
            'marital_status'  => 'single',
            'tax_status'      => 'TK0',
            'department_id'   => $dept->id,
            'position_id'     => $position->id,
            'site_id'         => $site->id,
            'hire_date'       => today(),
            'employment_type' => 'permanent',
            'status'          => 'active',
        ]);

        // 2. Buat user account — pakai tabel users bawaan Laravel
        $user = User::create([
            'employee_id' => $employee->id,
            'name'        => 'Super Administrator',
            'username'    => 'superadmin',
            'email'       => 'superadmin@company.com',
            'password'    => Hash::make('Admin@12345'),
            'role'        => 'super_admin',
            'is_active'   => true,
        ]);

        // 3. Assign role Spatie Permission
        $user->assignRole('super_admin');

        // 4. Update department head
        $dept->update(['department_head_id' => $employee->id]);

        $this->command->info('');
        $this->command->info('   Super Admin berhasil dibuat:');
        $this->command->info('   Username : superadmin');
        $this->command->info('   Email    : superadmin@company.com');
        $this->command->info('   Password : Admin@12345');
        $this->command->warn('   SEGERA GANTI PASSWORD setelah login pertama!');
        $this->command->info('');
    }
}
