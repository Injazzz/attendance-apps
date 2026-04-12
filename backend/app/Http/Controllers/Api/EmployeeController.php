<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeCollection;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::with(['department', 'position', 'site'])
            ->when($request->search, fn($q, $v) =>
                $q->where('full_name', 'like', "%{$v}%")
                ->orWhere('employee_code', 'like', "%{$v}%")
                ->orWhere('email', 'like', "%{$v}%"))
            ->when($request->dept_id, fn($q, $v) => $q->where('department_id', $v))
            ->when($request->site_id, fn($q, $v) => $q->where('site_id', $v))
            ->when($request->status,  fn($q, $v) => $q->where('status', $v))
            ->orderBy('full_name')
            ->paginate($request->per_page ?? 15);

        return response()->json(
            new EmployeeCollection($employees)
        );
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            // 1. Buat data employee
            $employee = Employee::create($request->except([
                'username', 'account_email', 'password',
                'password_confirmation', 'role', 'photo',
            ]));

            // 2. Upload foto
            if ($request->hasFile('photo')) {
                $employee->addMedia($request->file('photo'))
                    ->toMediaCollection('photo');
            }

            // 3. Buat user account
            $user = User::create([
                'employee_id' => $employee->id,
                'name'        => $employee->full_name,
                'username'    => $request->username,
                'email'       => $request->account_email,
                'password'    => Hash::make($request->password),
                'role'        => $request->role,
                'is_active'   => true,
            ]);

            // 4. Assign role Spatie
            $user->assignRole($request->role);

            return $this->successResponse(
                new EmployeeResource($employee->load(['department', 'position', 'site'])),
                'Karyawan berhasil ditambahkan',
                201
            );
        });
    }

    public function show(Employee $employee): JsonResponse
    {
        return $this->successResponse(
            new EmployeeResource(
                $employee->load(['department', 'position', 'site', 'user'])
            )
        );
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        return DB::transaction(function () use ($request, $employee) {
            $employee->update($request->except(['photo', 'account_email', 'username']));

            if ($request->hasFile('photo')) {
                $employee->addMedia($request->file('photo'))
                    ->toMediaCollection('photo');
            }

            // Update email user jika disertakan
            if ($request->filled('account_email') && $employee->user) {
                $employee->user->update([
                    'email' => $request->account_email,
                    'name'  => $employee->full_name,
                ]);
            }

            return $this->successResponse(
                new EmployeeResource($employee->fresh(['department', 'position', 'site'])),
                'Data karyawan berhasil diperbarui'
            );
        });
    }

    public function destroy(Employee $employee): JsonResponse
    {
        DB::transaction(function () use ($employee) {
            $employee->user?->update(['is_active' => false]);
            $employee->update(['status' => 'inactive']);
        });

        return $this->successResponse(null, 'Karyawan berhasil dinonaktifkan');
    }
}
