<?php

namespace App\Listeners;

use App\Events\QrSessionRotated;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendQrRotatedNotification implements ShouldQueue
{
    // ShouldQueue → listener ini berjalan di background queue
    // agar tidak memperlambat proses scan QR

    public function handle(QrSessionRotated $event): void
    {
        // Event ini sudah broadcast via WebSocket di class Event-nya
        // (ShouldBroadcastNow), jadi Listener ini dipakai untuk
        // keperluan tambahan seperti:
        // 1. Log aktivitas rotasi QR
        // 2. Kirim notifikasi ke admin jika QR gagal rotate
        // 3. Update statistik scan

        activity()
            ->performedOn($event->session)
            ->withProperties([
                'display_id'     => $event->displayId,
                'session_token'  => $event->session->session_token,
                'qr_type'        => $event->session->qr_type,
                'rotated_at'     => now()->toDateTimeString(),
            ])
            ->log('QR session dirotasi');
    }
}
