<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\PwaDevice;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends BaseController
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->login,
            $request->password,
            $request->device_fingerprint,
            $request->device_info ?? []
        );

        if (!isset($result['data'])) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse($result['data'], $result['message']);
    }

    public function logout(Request $request): JsonResponse
    {
        $browserToken = $request->header('X-Browser-Token');

        if (!$browserToken) {
            return $this->errorResponse('browser token tidak sesuai', 401);
        }

        $device = PwaDevice::where('browser_token', $browserToken)
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if (!$device) {
            return $this->errorResponse('Device tidak valid', 401);
        }

        // deactivate device
        $device->update([
            'status' => 'inactive',
            'last_active' => now()
        ]);

        // hapus token
        $request->user()->currentAccessToken()?->delete();

        return $this->successResponse(null, 'Berhasil logout');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(
            'employee.department',
            'employee.position',
            'employee.site'
        );

        return $this->successResponse(new UserResource($user));
    }
}
