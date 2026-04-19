<?php

namespace App\Http\Controllers\Broadcasting;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController
{
    /**
     * Authenticate the request for channel subscriptions.
     *
     * This endpoint is required for private/presence channels to authenticate
     * the user's right to subscribe to a specific channel.
     */
    public function __invoke(Request $request): JsonResponse
    {
        // User must be authenticated (Sanctum token required)
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $channel = $request->input('channel_name');

        // ────────────────────────────────────────────────────────
        // IMPLEMENT YOUR CHANNEL AUTHORIZATION LOGIC HERE
        // ────────────────────────────────────────────────────────

        // Example 1: Private user channel (only user can access their own)
        if (str_starts_with($channel, 'App.Models.User.')) {
            $userId = (int) str_replace('App.Models.User.', '', $channel);
            if ($userId !== (int) $user->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        // Example 2: Department channel (employees can view their dept)
        if (str_starts_with($channel, 'department.')) {
            $deptId = (int) str_replace('department.', '', $channel);
            if ($user->employee?->department_id !== $deptId) {
                // Check if user has permission to view all departments
                if (!$user->hasPermissionTo('view_all_departments')) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
            }
        }

        // Example 3: Broadcast channel (allow if permission exists)
        if (str_starts_with($channel, 'attendance.scan')) {
            if (!$user->hasPermissionTo('view_attendance')) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        // ────────────────────────────────────────────────────────
        // If channel authorization passes, return success
        // ────────────────────────────────────────────────────────

        // For Reverb/Pusher broadcasting, return JSON response with auth token
        return response()->json([
            'channel_data' => [
                'user_id' => $user->id,
                'user_name' => $user->name,
            ],
        ]);
    }
}


