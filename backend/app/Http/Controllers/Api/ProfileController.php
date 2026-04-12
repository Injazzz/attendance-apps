<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ProfileController extends BaseController
{
    public function show(Request $request): JsonResponse
    {
        return $this->successResponse(
            new UserResource(
                $request->user()->load('employee.department','employee.position','employee.site')
            )
        );
    }

    public function update(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = $user->employee;

        $request->validate([
            'phone'        => ['nullable', 'string', 'max:15'],
            'email'        => [
                'nullable', 'email', 'max:100',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'photo'        => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'old_password' => ['required_with:new_password', 'string'],
            'new_password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ], [
            // Custom error messages untuk password confirmation
            'new_password.confirmed' => 'Password baru dan konfirmasi password harus sama',
            'new_password.min'       => 'Password minimal harus 8 karakter',
            'old_password.required_with' => 'Password lama wajib diisi ketika mengubah password',
        ]);

        // Update nomor telepon
        if ($request->filled('phone') && $employee) {
            $employee->update(['phone' => $request->phone]);
        }

        // Upload foto — dengan error handling
        if ($request->hasFile('photo') && $employee) {
            try {
                $employee
                    ->addMedia($request->file('photo'))
                    ->toMediaCollection('photo');
            } catch (\Exception $e) {
                Log::error('Gagal upload foto profil', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
                return $this->errorResponse('Gagal mengupload foto. Coba lagi.');
            }
        }

        // Update email
        if ($request->filled('email')) {
            $user->update(['email' => $request->email]);
        }

        // Ganti password
        if ($request->filled('new_password')) {
            if (!Hash::check($request->old_password, $user->password)) {
                return $this->errorResponse('Password lama tidak sesuai');
            }
            $user->update(['password' => Hash::make($request->new_password)]);
        }

        return $this->successResponse(
            new UserResource($user->fresh(['employee.department', 'employee.position'])),
            'Profil berhasil diperbarui'
        );
    }
}
