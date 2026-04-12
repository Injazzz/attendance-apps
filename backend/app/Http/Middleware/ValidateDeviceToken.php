<?php

namespace App\Http\Middleware;

use App\Models\PwaDevice;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateDeviceToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
         $browserToken = $request->header('X-Browser-Token');

        if (!$browserToken) {
            return response()->json(['message' => 'Device token tidak ditemukan'], 401);
        }

        $device = PwaDevice::where('browser_token', $browserToken)
            ->where('status', 'active')
            ->first();

        if (!$device) {
            return response()->json(['message' => 'Device tidak dikenal atau diblokir'], 401);
        }

        // Update last active
        $device->update(['last_active' => now()]);

        return $next($request);
    }
}
