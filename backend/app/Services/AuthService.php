<?php

namespace App\Services;

use App\Models\PwaDevice;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService extends BaseService
{
    public function login(
        string $login,
        string $password,
        string $deviceFingerprint,
        array $deviceInfo
    ): array {
        // Validasi fingerprint minimal
        if (strlen($deviceFingerprint) < 2) {
            return $this->fail('Fingerprint device tidak valid');
        }

        $fingerprintHash = hash('sha256', $deviceFingerprint);

        $user = User::where('username', $login)
            ->orWhere('email', $login)
            ->with('employee')
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            if ($user) {
                $user->incrementFailedAttempts();
            }
            return $this->fail('Username, email, atau password salah');
        }

        if (!$user->is_active) {
            return $this->fail('Akun Anda tidak aktif. Hubungi administrator.');
        }

        if ($user->isLocked()) {
            $menit = now()->diffInMinutes($user->locked_until);
            return $this->fail("Akun terkunci. Coba lagi dalam {$menit} menit.");
        }

        // Device Lock - cek apakah sudah ada device dengan fingerprint yang sama
        // mencari baik yang active maupun inactive (untuk reactivation setelah logout)
        $existingDevice = PwaDevice::where('user_id', $user->id)
            ->where('device_fingerprint', $fingerprintHash)
            ->first();

        if ($existingDevice) {
            if ($existingDevice->status === 'active') {
                // Device sudah active dan fingerprint match - gunakan token lama
                $browserToken = $existingDevice->browser_token;

                $existingDevice->update([
                    'last_active' => now(),
                    'device_info' => $deviceInfo,
                ]);
            } else {
                // Device inactive (telah logout) - reactivate dengan token yang sama
                $browserToken = $existingDevice->browser_token;

                $existingDevice->update([
                    'status'      => 'active',
                    'last_active' => now(),
                    'device_info' => $deviceInfo,
                ]);
            }

            $device = $existingDevice;
        } else {
            // Device baru - cek apakah user sudah punya device active lain
            $otherActiveDevice = PwaDevice::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if ($otherActiveDevice) {
                return $this->fail(
                    'Akun sudah login di device lain. Silakan logout terlebih dahulu.'
                );
            }

            $browserToken = Str::random(64);

            $device = PwaDevice::create([
                'user_id'            => $user->id,
                'device_fingerprint' => $fingerprintHash,
                'browser_token'      => $browserToken,
                'device_info'        => $deviceInfo,
                'status'             => 'active',
                'last_active'        => now(),
            ]);
        }

        // reset failed login
        $user->resetFailedAttempts();

        // buat token sanctum
        $tokenInstance = $user->createToken(
            "device_{$fingerprintHash}",
            $this->getAbilitiesForRole($user->role)
        );

        $plainTextToken = $tokenInstance->plainTextToken;

        // bind token ke device (optional tapi recommended)
        $device->update([
            'token_id' => $tokenInstance->accessToken->id ?? null
        ]);

        return $this->success([
            'token'         => $plainTextToken,
            'browser_token' => $browserToken,
            'user'          => [
                'id'          => $user->id,
                'name'        => $user->name,
                'username'    => $user->username,
                'email'       => $user->email,
                'role'        => $user->role,
                'employee'    => $user->employee ? [
                    'id'            => $user->employee->id,
                    'full_name'     => $user->employee->full_name,
                    'employee_code' => $user->employee->employee_code,
                    'site_id'       => $user->employee->site_id,
                    'photo_url'     => $user->employee->getFirstMediaUrl('photo'),
                ] : null,
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ], 'Login berhasil');
    }

    private function getAbilitiesForRole(string $role): array
    {
        return match ($role) {
            'super_admin', 'admin' => ['*'],
            'hrd' => [
                'employees:read', 'employees:write',
                'attendance:read', 'reports:read',
            ],
            'finance' => [
                'attendance:read', 'reports:read', 'overtime:approve',
            ],
            'project_manager' => [
                'employees:read', 'attendance:read',
                'reports:read', 'sites:manage',
            ],
            'supervisor' => [
                'attendance:read', 'overtime:approve', 'employees:read',
            ],
            default => [
                'attendance:self', 'profile:read', 'notifications:read',
            ],
        };
    }
}
