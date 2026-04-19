<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Services\QrService;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\EmployeeCollection;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends BaseController
{
    public function __construct(private readonly QrService $qrService) {}

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

            // 2. Upload foto dan simpan path ke database
            if ($request->hasFile('photo')) {
                try {
                    $file = $request->file('photo');

                    // Generate filename: employee_{id}_{timestamp}.ext
                    $filename = 'employee_' . $employee->id . '_' . time() . '.' . $file->getClientOriginalExtension();

                    // Store directly to storage/app/public/employees/
                    $path = $file->storeAs('employees', $filename, 'public');

                    Log::info('Photo uploaded', [
                        'employee_id' => $employee->id,
                        'filename' => $filename,
                        'path' => $path,
                    ]);

                    // Save relative path - accessor will prepend base URL
                    $photoUrl = "/storage/{$path}";
                    $employee->update(['photo_path' => $photoUrl]);

                    Log::info('Photo path saved', [
                        'photo_path' => $photoUrl,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Photo upload failed', [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // 3. Buat user account
            $user = User::create([
                'employee_id' => $employee->id,
                'name'        => $employee->full_name,
                'username'    => $request->username,
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'role'        => $request->role,
                'is_active'   => true,
            ]);

            // 4. Assign role Spatie
            $user->assignRole($request->role);

            // 5. Refresh employee untuk response
            $employee->refresh();

            return $this->successResponse(
                new EmployeeResource($employee->load(['department', 'position', 'site'])),
                'Karyawan berhasil ditambahkan',
                201
            );
        });
    }

    public function show(int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        return $this->successResponse(
            new EmployeeResource(
                $employee->load(['department', 'position', 'site', 'user'])
            )
        );
    }

    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        return DB::transaction(function () use ($request, $employee) {
            $employee->update($request->except(['photo', 'account_email', 'username']));

            Log::info('Photo update check for employee ' . $employee->id, [
                'hasFile' => $request->hasFile('photo'),
            ]);

            if ($request->hasFile('photo')) {
                try {
                    $file = $request->file('photo');

                    // Delete old photo if exists
                    if ($employee->photo_path && str_contains($employee->photo_path, '/storage/')) {
                        $oldPath = str_replace('/storage/', '', $employee->photo_path);
                        Storage::disk('public')->delete($oldPath);
                    }

                    // Generate filename: employee_{id}_{timestamp}.ext
                    $filename = 'employee_' . $employee->id . '_' . time() . '.' . $file->getClientOriginalExtension();

                    // Store directly to storage/app/public/employees/
                    $path = $file->storeAs('employees', $filename, 'public');

                    Log::info('Photo updated', [
                        'employee_id' => $employee->id,
                        'filename' => $filename,
                        'path' => $path,
                    ]);

                    // Save relative path - accessor will prepend base URL
                    $photoUrl = "/storage/{$path}";
                    $employee->update(['photo_path' => $photoUrl]);

                    Log::info('Photo path updated', [
                        'photo_path' => $photoUrl,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Photo update failed', [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Update email user jika disertakan
            if ($request->filled('email') && $employee->user) {
                $employee->user->update([
                    'email' => $request->email,
                    'name'  => $employee->full_name,
                ]);
            }

            // Refresh employee for response
            $employee->refresh();

            return $this->successResponse(
                new EmployeeResource($employee->fresh(['department', 'position', 'site', 'user'])),
                'Data karyawan berhasil diperbarui'
            );
        });
    }

    public function destroy(int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        DB::transaction(function () use ($employee) {
            $employee->user?->update(['is_active' => false]);
            $employee->update(['status' => 'inactive']);
        });

        return $this->successResponse(null, 'Karyawan berhasil dinonaktifkan');
    }

    /**
     * Generate attendance QR code for employee
     * QR contains: {"employee_id": int, "type": "department|site", "timestamp": int}
     *
     * @param int $id Employee ID
     * @return JsonResponse QR image as base64 PNG
     */
    public function generateQr(int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);

        // Determine employee type based on department or site
        $employeeType = $employee->department_id ? 'department' : 'site';

        // Generate QR image with employee data
        $qrImage = $this->qrService->generateUnifiedQrImage($employee->id, $employeeType);

        return $this->successResponse([
            'qr_image'       => $qrImage,
            'employee_id'    => $employee->id,
            'employee_name'  => $employee->full_name,
            'employee_type'  => $employeeType,
            'qr_data'        => json_decode($this->qrService->buildUnifiedQrPayload($employee->id, $employeeType)),
        ], 'QR code berhasil dibuat');
    }
}

