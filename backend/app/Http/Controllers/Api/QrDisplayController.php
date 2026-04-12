<?php
namespace App\Http\Controllers\Api;

use App\Http\Requests\QrDisplay\StoreQrDisplayRequest;
use App\Http\Resources\QrSessionResource;
use App\Models\QrDisplay;
use App\Services\QrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QrDisplayController extends BaseController
{
    public function __construct(private readonly QrService $qrService) {}

    public function index(Request $request): JsonResponse
    {
        $displays = QrDisplay::with(['site', 'department', 'activeSession'])
            ->when($request->site_id, fn($q, $v) => $q->where('site_id', $v))
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->orderBy('display_name')
            ->paginate($request->per_page ?? 15);

        return $this->paginatedResponse($displays);
    }

    public function store(StoreQrDisplayRequest $request): JsonResponse
    {
        $code    = 'QRD-' . strtoupper(uniqid());
        $display = QrDisplay::create(array_merge(
            $request->validated(),
            ['display_code' => $code]
        ));

        // Langsung generate session pertama
        $session = $this->qrService->generateSession($display);
        $qrImage = $this->qrService->generateQrImage($session->session_token);

        return $this->successResponse([
            'display'  => $display->load(['site', 'department']),
            'session'  => new QrSessionResource($session),
            'qr_image' => $qrImage,
        ], 'QR Display berhasil dibuat', 201);
    }

    public function show(QrDisplay $qrDisplay): JsonResponse
    {
        return $this->successResponse(
            $qrDisplay->load(['site', 'department', 'activeSession'])
        );
    }

    public function update(Request $request, QrDisplay $qrDisplay): JsonResponse
    {
        $request->validate([
            'display_name'  => 'sometimes|string|max:100',
            'location'      => 'nullable|string|max:200',
            'department_id' => 'nullable|exists:departments,id',
            'status'        => 'sometimes|in:active,inactive,maintenance',
            'time_interval' => 'sometimes|integer|min:10|max:3600',
            'max_scans'     => 'sometimes|integer|min:1',
        ]);

        $qrDisplay->update($request->validated());

        return $this->successResponse($qrDisplay->fresh(), 'QR Display diperbarui');
    }

    public function destroy(QrDisplay $qrDisplay): JsonResponse
    {
        $qrDisplay->update(['status' => 'inactive']);
        return $this->successResponse(null, 'QR Display dinonaktifkan');
    }
}
