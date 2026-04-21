<?php

namespace Database\Seeders;

use App\Models\CompanySite;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    /**
     * Seed 10 complete employees with user accounts
     */
    public function run(): void
    {
        $dept     = Department::first();
        $position = Position::first();
        $site     = CompanySite::first();

        // Data 10 karyawan lengkap
        $employees = [
            [
                'employee_code'   => 'EMP-EMP-001',
                'full_name'       => 'Budi Santoso',
                'username'        => 'budi.santoso',
                'email'           => 'budi.santoso@company.com',
                'emp_email'       => 'budi.santoso.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234567',
                'role'            => 'employee',
                'gender'          => 'male',
                'birthdate'       => '1990-05-15',
                'birthplace'      => 'Jakarta',
                'id_card'         => '1234567890123456',
                'npwp'            => '12.345.678.9-123.000',
            ],
            [
                'employee_code'   => 'EMP-EMP-002',
                'full_name'       => 'Siti Nurhaliza',
                'username'        => 'siti.nurhaliza',
                'email'           => 'siti.nurhaliza@company.com',
                'emp_email'       => 'siti.nurhaliza.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234568',
                'role'            => 'employee',
                'gender'          => 'female',
                'birthdate'       => '1992-03-22',
                'birthplace'      => 'Bandung',
                'id_card'         => '1234567890123457',
                'npwp'            => '12.345.678.9-123.001',
            ],
            [
                'employee_code'   => 'EMP-EMP-003',
                'full_name'       => 'Ahmad Wijaya',
                'username'        => 'ahmad.wijaya',
                'email'           => 'ahmad.wijaya@company.com',
                'emp_email'       => 'ahmad.wijaya.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234569',
                'role'            => 'employee',
                'gender'          => 'male',
                'birthdate'       => '1988-07-10',
                'birthplace'      => 'Surabaya',
                'id_card'         => '1234567890123458',
                'npwp'            => '12.345.678.9-123.002',
            ],
            [
                'employee_code'   => 'EMP-EMP-004',
                'full_name'       => 'Rina Hermawan',
                'username'        => 'rina.hermawan',
                'email'           => 'rina.hermawan@company.com',
                'emp_email'       => 'rina.hermawan.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234570',
                'role'            => 'employee',
                'gender'          => 'female',
                'birthdate'       => '1994-09-18',
                'birthplace'      => 'Medan',
                'id_card'         => '1234567890123459',
                'npwp'            => '12.345.678.9-123.003',
            ],
            [
                'employee_code'   => 'EMP-EMP-005',
                'full_name'       => 'Doni Setiawan',
                'username'        => 'doni.setiawan',
                'email'           => 'doni.setiawan@company.com',
                'emp_email'       => 'doni.setiawan.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234571',
                'role'            => 'employee',
                'gender'          => 'male',
                'birthdate'       => '1991-11-25',
                'birthplace'      => 'Yogyakarta',
                'id_card'         => '1234567890123460',
                'npwp'            => '12.345.678.9-123.004',
            ],
            [
                'employee_code'   => 'EMP-EMP-006',
                'full_name'       => 'Lina Kusuma',
                'username'        => 'lina.kusuma',
                'email'           => 'lina.kusuma@company.com',
                'emp_email'       => 'lina.kusuma.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234572',
                'role'            => 'employee',
                'gender'          => 'female',
                'birthdate'       => '1993-02-14',
                'birthplace'      => 'Semarang',
                'id_card'         => '1234567890123461',
                'npwp'            => '12.345.678.9-123.005',
            ],
            [
                'employee_code'   => 'EMP-EMP-007',
                'full_name'       => 'Rizky Pratama',
                'username'        => 'rizky.pratama',
                'email'           => 'rizky.pratama@company.com',
                'emp_email'       => 'rizky.pratama.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234573',
                'role'            => 'employee',
                'gender'          => 'male',
                'birthdate'       => '1995-06-08',
                'birthplace'      => 'Makassar',
                'id_card'         => '1234567890123462',
                'npwp'            => '12.345.678.9-123.006',
            ],
            [
                'employee_code'   => 'EMP-EMP-008',
                'full_name'       => 'Maya Angelina',
                'username'        => 'maya.angelina',
                'email'           => 'maya.angelina@company.com',
                'emp_email'       => 'maya.angelina.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234574',
                'role'            => 'employee',
                'gender'          => 'female',
                'birthdate'       => '1989-12-30',
                'birthplace'      => 'Palembang',
                'id_card'         => '1234567890123463',
                'npwp'            => '12.345.678.9-123.007',
            ],
            [
                'employee_code'   => 'EMP-EMP-009',
                'full_name'       => 'Toni Suryanto',
                'username'        => 'toni.suryanto',
                'email'           => 'toni.suryanto@company.com',
                'emp_email'       => 'toni.suryanto.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234575',
                'role'            => 'employee',
                'gender'          => 'male',
                'birthdate'       => '1987-01-17',
                'birthplace'      => 'Lampung',
                'id_card'         => '1234567890123464',
                'npwp'            => '12.345.678.9-123.008',
            ],
            [
                'employee_code'   => 'EMP-EMP-010',
                'full_name'       => 'Wulan Sari',
                'username'        => 'wulan.sari',
                'email'           => 'wulan.sari@company.com',
                'emp_email'       => 'wulan.sari.emp@company.com',
                'password'        => 'Employee@12345',
                'phone'           => '08111234576',
                'role'            => 'employee',
                'gender'          => 'female',
                'birthdate'       => '1996-08-12',
                'birthplace'      => 'Pontianak',
                'id_card'         => '1234567890123465',
                'npwp'            => '12.345.678.9-123.009',
            ],
        ];

        foreach ($employees as $data) {
            // 1. Validasi karyawan belum terdaftar
            if (Employee::where('employee_code', $data['employee_code'])->exists()) {
                $this->command->warn("⊘ Employee {$data['employee_code']} sudah ada, skip...");
                continue;
            }

            // 2. Buat data employee
            $employee = Employee::create([
                'employee_code'   => $data['employee_code'],
                'full_name'       => $data['full_name'],
                'email'           => $data['emp_email'],
                'phone'           => $data['phone'],
                'id_card'         => $data['id_card'],
                'npwp'            => $data['npwp'],
                'birthplace'      => $data['birthplace'],
                'birthdate'       => $data['birthdate'],
                'gender'          => $data['gender'],
                'marital_status'  => 'single',
                'tax_status'      => 'TK0',
                'department_id'   => $dept->id,
                'position_id'     => $position->id,
                'site_id'         => $site->id,
                'hire_date'       => now()->subMonths(rand(3, 24))->toDateString(),
                'employment_type' => 'permanent',
                'status'          => 'active',
                'emergency_contact' => $data['full_name'],
                'emergency_phone' => $data['phone'],
            ]);

            // 3. Buat user account
            $user = User::create([
                'employee_id' => $employee->id,
                'name'        => $data['full_name'],
                'username'    => $data['username'],
                'email'       => $data['email'],
                'password'    => Hash::make($data['password']),
                'role'        => 'employee',
                'is_active'   => true,
            ]);

            // 4. Assign role
            $user->assignRole('employee');

            $this->command->info("✓ {$data['employee_code']} - {$data['full_name']} berhasil dibuat");
        }

        $this->command->info('');
        $this->command->info('✓ 10 Employee berhasil dibuat!');
        $this->command->info('');
        $this->command->table(
            ['Employee Code', 'Name', 'Username', 'Email', 'Password'],
            collect($employees)->map(fn($e) => [
                $e['employee_code'],
                $e['full_name'],
                $e['username'],
                $e['email'],
                $e['password'],
            ])->toArray()
        );
    }
}
