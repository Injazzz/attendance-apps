<?php
namespace App\Http\Controllers\Api;

use App\Http\Resources\QrSessionResource;
use App\Models\QrDisplay;
use App\Services\QrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class QrSessionController extends BaseController
{
    public function __construct(private readonly QrService $qrService) {}

    public function generate(int $id): JsonResponse
    {
        $display = QrDisplay::findOrFail($id);

        if ($display->status !== 'active') {
            return $this->errorResponse('QR Display tidak aktif');
        }

        $session  = $this->qrService->generateSession($display);
        $qrImage  = $this->qrService->generateQrImage($session->session_token);

        return $this->successResponse([
            'session'  => new QrSessionResource($session),
            'qr_image' => 'data:image/png;base64,' . $qrImage,
        ], 'QR baru berhasil digenerate');
    }

    public function current(int $id): JsonResponse
    {
        $display = QrDisplay::findOrFail($id);

        Log::debug('QrSessionController::current called', [
            'display_id' => $display->id,
            'display_exists' => $display->exists,
            'display_attributes' => $display->getAttributes()
        ]);

        $session = $display->activeSession;

        if (!$session) {
            // Auto-generate jika tidak ada session aktif
            $session = $this->qrService->generateSession($display);
        }

        $qrImage = $this->qrService->generateQrImage($session->session_token);

        return $this->successResponse([
            'session'  => new QrSessionResource($session),
            'qr_image' => 'data:image/png;base64,' . $qrImage,
            'display'  => $display->load(['site', 'department']),
        ]);
    }
}

