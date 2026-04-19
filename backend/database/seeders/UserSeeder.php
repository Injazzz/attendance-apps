<?php

namespace Database\Seeders;

use App\Models\CompanySite;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $dept     = Department::first();
        $position = Position::first();
        $site     = CompanySite::first();

        $users = [
            [
                'employee_code'   => 'EMP-ADMINAJA-001',
                'full_name'       => 'Administrator',
                'username'        => 'admin',
                'email'           => 'admin@company.com',
                'emp_email'       => 'admin.emp@company.com',
                'password'        => 'Admin@12345',
                'role'            => 'admin',
                'phone'           => '08111111111',
            ],
            [
                'employee_code'   => 'EMP-HRD-001',
                'full_name'       => 'HR Director',
                'username'        => 'hrd',
                'email'           => 'hrd@company.com',
                'emp_email'       => 'hrd.emp@company.com',
                'password'        => 'Hrd@12345',
                'role'            => 'hrd',
                'phone'           => '08122222222',
            ],
            [
                'employee_code'   => 'EMP-FIN-001',
                'full_name'       => 'Finance Manager',
                'username'        => 'finance',
                'email'           => 'finance@company.com',
                'emp_email'       => 'finance.emp@company.com',
                'password'        => 'Finance@12345',
                'role'            => 'finance',
                'phone'           => '08133333333',
            ],
            [
                'employee_code'   => 'EMP-PM-001',
                'full_name'       => 'Project Manager',
                'username'        => 'pm',
                'email'           => 'pm@company.com',
                'emp_email'       => 'pm.emp@company.com',
                'password'        => 'Pm@12345',
                'role'            => 'project_manager',
                'phone'           => '08144444444',
            ],
            [
                'employee_code'   => 'EMP-SUP-001',
                'full_name'       => 'Team Supervisor',
                'username'        => 'supervisor',
                'email'           => 'supervisor@company.com',
                'emp_email'       => 'supervisor.emp@company.com',
                'password'        => 'Supervisor@12345',
                'role'            => 'supervisor',
                'phone'           => '08155555555',
            ],
            [
                'employee_code'   => 'EMP-STF-001',
                'full_name'       => 'Staff Employee',
                'username'        => 'employee',
                'email'           => 'employee@company.com',
                'emp_email'       => 'employee.emp@company.com',
                'password'        => 'Employee@12345',
                'role'            => 'employee',
                'phone'           => '08166666666',
            ],
        ];

        foreach ($users as $userData) {
            // 1. Buat employee data
            $employee = Employee::create([
                'employee_code'   => $userData['employee_code'],
                'full_name'       => $userData['full_name'],
                'email'           => $userData['emp_email'],
                'phone'           => $userData['phone'],
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

            // 2. Buat user account
            $user = User::create([
                'employee_id' => $employee->id,
                'name'        => $userData['full_name'],
                'username'    => $userData['username'],
                'email'       => $userData['email'],
                'password'    => Hash::make($userData['password']),
                'role'        => $userData['role'],
                'is_active'   => true,
            ]);

            // 3. Assign role menggunakan Spatie Permission
            $user->assignRole($userData['role']);

            $this->command->info("✓ {$userData['role']} user created: {$userData['username']}");
        }

        $this->command->info('');
        $this->command->info('All test users created successfully!');
        $this->command->info('');
        $this->command->table(
            ['Role', 'Username', 'Email', 'Password'],
            collect($users)->map(fn($u) => [
                $u['role'],
                $u['username'],
                $u['email'],
                $u['password'],
            ])->toArray()
        );
    }
}
