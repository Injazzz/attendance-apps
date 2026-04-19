<?php

namespace App\Http\Controllers\Api;

use App\Models\PwaDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $devices = PwaDevice::with(['user.employee:id,full_name,employee_code'])
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->search, fn($q, $v) =>
                $q->whereHas('user.employee', fn($eq) =>
                    $eq->where('full_name', 'like', "%{$v}%")
                       ->orWhere('employee_code', 'like', "%{$v}%")
                )
            )
            ->orderByDesc('last_active')
            ->paginate($request->per_page ?? 20);

        return $this->paginatedResponse($devices);
    }

    public function block(int $id): JsonResponse
    {
        $device = PwaDevice::findOrFail($id);
        $device->update(['status' => 'blocked']);
        $device->user->tokens()->delete();

        return $this->successResponse(null, 'Perangkat diblokir dan sesi dihapus');
    }

    public function reset(int $id): JsonResponse
    {
        $device = PwaDevice::findOrFail($id);
        try {
            $user = $device->user;

            if (!$user) {
                // Device yang orphaned, langsung delete
                $device->delete();
                return $this->successResponse(
                    null,
                    'Perangkat direset.'
                );
            }

            // Delete device
            $device->delete();

            // Delete all tokens for the user
            $user->tokens()->delete();

            return $this->successResponse(
                null,
                'Perangkat direset. Pengguna bisa login dari perangkat baru.'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mereset perangkat: ' . $e->getMessage(), 500);
        }
    }
}
