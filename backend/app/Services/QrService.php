<?php
namespace App\Services;

use App\Models\QrDisplay;
use App\Models\QrSession;
use App\Events\QrSessionRotated;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrService extends BaseService
{
    /**
     * Generate QR session baru untuk suatu display
     */
    public function generateSession(QrDisplay $display): QrSession
    {
        // Nonaktifkan session lama
        QrSession::where('display_id', $display->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        $token = Str::random(64);
        $payload = $this->buildQrPayload($display, $token);

        $validTo = match($display->refresh_mode) {
            'time_based' => now()->addSeconds($display->time_interval),
            'scan_based' => now()->addHours(12), // max 12 jam untuk scan-based
            default      => now()->addHours(1),
        };

        $session = QrSession::create([
            'session_token' => $token,
            'display_id'    => $display->id,
            'site_id'       => $display->site_id,
            'qr_data'       => encrypt($payload), // enkripsi payload
            'qr_type'       => $display->qr_type,
            'valid_from'    => now(),
            'valid_to'      => $validTo,
            'current_scans' => 0,
            'is_active'     => true,
        ]);

        // Broadcast via WebSocket agar display QR ter-update
        broadcast(new QrSessionRotated($display->id, $session, $this->generateQrImage($token)));

        return $session;
    }

    /**
     * Cek dan rotate QR jika max_scans tercapai
     */
    public function checkAndRotateQr(QrSession $session): void
    {
        $display = $session->display;

        if ($display->refresh_mode === 'scan_based'
            && $session->current_scans >= $display->max_scans
        ) {
            $this->generateSession($display);
        }
    }

    /**
     * Auto-expire checker (dipanggil dari scheduled job)
     */
    public function expireOldSessions(): int
    {
        $expired = QrSession::where('is_active', true)
            ->where('valid_to', '<', now())
            ->get();

        foreach ($expired as $session) {
            $session->update(['is_active' => false]);
            // Auto-generate session baru untuk display yang time-based
            if ($session->display->refresh_mode === 'time_based') {
                $this->generateSession($session->display);
            }
        }

        return $expired->count();
    }

    private function buildQrPayload(QrDisplay $display, string $token): string
    {
        return json_encode([
            'token'   => $token,
            'site_id' => $display->site_id,
            'dept_id' => $display->department_id,
            'type'    => $display->qr_type,
            'ts'      => now()->timestamp,
        ]);
    }

    public function generateQrImage(string $token): string
    {
        // Return base64 QR image
        return base64_encode(
            QrCode::format('png')
                ->size(300)
                ->errorCorrection('H')
                ->generate($token)
        );
    }
}
