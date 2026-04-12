<?php
namespace App\Events;

use App\Models\OvertimeRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OvertimeStatusChanged implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public function __construct(
        public OvertimeRequest $overtime,
        public string $newStatus
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.User.{$this->overtime->employee->user->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'overtime.status.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'overtime_id'   => $this->overtime->id,
            'overtime_date' => $this->overtime->overtime_date->format('d/m/Y'),
            'status'        => $this->newStatus,
            'message'       => match($this->newStatus) {
                'approved' => 'Pengajuan lembur Anda telah disetujui',
                'rejected' => 'Pengajuan lembur Anda ditolak',
                default    => 'Status lembur berubah',
            },
        ];
    }
}
