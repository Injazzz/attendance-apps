<?php
namespace App\Events;

use App\Models\QrSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class QrSessionRotated implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public function __construct(
        public int $displayId,
        public QrSession $session,
        public string $qrImageBase64
    ) {}

    public function broadcastOn(): array
    {
        // Channel per display — hanya TV/layar yang menampilkan QR tersebut
        return [new Channel("qr-display.{$this->displayId}")];
    }

    public function broadcastAs(): string
    {
        return 'qr.rotated';
    }

    public function broadcastWith(): array
    {
        return [
            'session_token' => $this->session->session_token,
            'qr_image'      => $this->qrImageBase64,
            'valid_to'      => $this->session->valid_to,
            'qr_type'       => $this->session->qr_type,
        ];
    }
}
