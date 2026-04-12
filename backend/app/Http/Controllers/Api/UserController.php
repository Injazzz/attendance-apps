<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with('employee:id,full_name,employee_code,department_id')
            ->when($request->search, fn($q, $v) =>
                $q->where('name', 'like', "%{$v}%")
                  ->orWhere('username', 'like', "%{$v}%")
                  ->orWhere('email', 'like', "%{$v}%")
            )
            ->when($request->role,      fn($q, $v) => $q->where('role', $v))
            ->when($request->is_active !== null, fn($q) =>
                $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN))
            )
            ->orderBy('name')
            ->paginate($request->per_page ?? 15);

        return $this->paginatedResponse($users);
    }

    public function show(User $user): JsonResponse
    {
        return $this->successResponse(
            new UserResource(
                $user->load('employee.department', 'employee.position', 'employee.site')
            )
        );
    }

    public function toggleActive(User $user): JsonResponse
    {
        // Super admin tidak bisa dinonaktifkan
        if ($user->role === 'super_admin') {
            return $this->errorResponse('Akun super admin tidak dapat dinonaktifkan');
        }

        $user->update(['is_active' => !$user->is_active]);

        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        return $this->successResponse(
            ['is_active' => $user->is_active],
            $user->is_active ? 'Akun berhasil diaktifkan' : 'Akun berhasil dinonaktifkan'
        );
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password'              => Hash::make($request->new_password),
            'failed_login_attempts' => 0,
            'locked_until'          => null,
        ]);

        // Revoke semua token — user harus login ulang
        $user->tokens()->delete();

        return $this->successResponse(
            null,
            'Password berhasil direset. User harus login ulang.'
        );
    }

    public function unlock(User $user): JsonResponse
    {
        $user->update([
            'failed_login_attempts' => 0,
            'locked_until'          => null,
        ]);

        return $this->successResponse(null, 'Akun berhasil dibuka kuncinya');
    }

    public function changeRole(Request $request, User $user): JsonResponse
    {
        // Super admin tidak bisa diubah rolenya
        if ($user->role === 'super_admin') {
            return $this->errorResponse('Role super admin tidak dapat diubah');
        }

        $request->validate([
            'role' => ['required', Rule::in([
                'admin', 'hrd', 'finance',
                'project_manager', 'supervisor', 'employee',
            ])],
        ]);

        $oldRole = $user->role;

        $user->update(['role' => $request->role]);

        // Sync role Spatie Permission
        $user->syncRoles([$request->role]);

        // Revoke token — permissions berubah saat login ulang
        $user->tokens()->delete();

        return $this->successResponse(
            new UserResource($user->fresh()),
            "Role berhasil diubah dari {$oldRole} ke {$request->role}"
        );
    }
}
