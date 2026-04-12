<?php
namespace App\Http\Controllers\Api;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->when($request->has('is_read'), fn($q) =>
                $q->where('is_read', filter_var($request->is_read, FILTER_VALIDATE_BOOLEAN))
            )
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 20);

        return $this->paginatedResponse($notifications);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->errorResponse('Akses ditolak', null, 403);
        }

        $notification->update(['is_read' => true]);

        return $this->successResponse(
            new NotificationResource($notification),
            'Notifikasi ditandai telah dibaca'
        );
    }

    public function readAll(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->successResponse(null, 'Semua notifikasi ditandai telah dibaca');
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->errorResponse('Akses ditolak', null, 403);
        }

        $notification->delete();

        return $this->successResponse(null, 'Notifikasi dihapus');
    }
}
