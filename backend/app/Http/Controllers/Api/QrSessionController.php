<?php
namespace App\Http\Controllers\Api;

use App\Http\Resources\QrSessionResource;
use App\Models\QrDisplay;
use App\Services\QrService;
use Illuminate\Http\JsonResponse;

class QrSessionController extends BaseController
{
    public function __construct(private readonly QrService $qrService) {}

    public function generate(QrDisplay $display): JsonResponse
    {
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

    public function current(QrDisplay $display): JsonResponse
    {
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
