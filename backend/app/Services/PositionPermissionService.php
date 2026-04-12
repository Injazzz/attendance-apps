<?php
namespace App\Services;

use App\Models\Position;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;

class PositionPermissionService extends BaseService
{
    /**
     * Assign permissions ke suatu posisi/jabatan
     * Admin bisa kustomisasi permission per jabatan
     */
    public function syncPositionPermissions(Position $position, array $permissions): void
    {
        $position->update(['custom_permissions' => $permissions]);

        // Clear cache permissions untuk semua user dengan posisi ini
        Cache::tags(["position_perms_{$position->id}"])->flush();
    }

    /**
     * Dapatkan effective permissions user:
     * role permissions UNION position permissions
     */
    public function getEffectivePermissions($user): array
    {
        $cacheKey = "user_perms_{$user->id}";

        return Cache::remember($cacheKey, 300, function () use ($user) {
            $rolePerms = $user->getAllPermissions()->pluck('name')->toArray();
            $positionPerms = $user->employee?->position?->custom_permissions ?? [];
            return array_unique(array_merge($rolePerms, $positionPerms));
        });
    }
}
