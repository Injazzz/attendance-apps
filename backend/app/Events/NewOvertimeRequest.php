<?php
namespace App\Events;

use App\Models\OvertimeRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class NewOvertimeRequest implements ShouldBroadcastNow
{
    use InteractsWithSockets;

    public function __construct(
        public OvertimeRequest $overtime,
        public int $approverId
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("App.Models.User.{$this->approverId}")];
    }

    public function broadcastAs(): string
    {
        return 'overtime.new.request';
    }

    public function broadcastWith(): array
    {
        return [
            'overtime_id'    => $this->overtime->id,
            'employee_name'  => $this->overtime->employee->full_name,
            'overtime_date'  => $this->overtime->overtime_date->format('d/m/Y'),
            'total_hours'    => $this->overtime->total_hours,
            'reason'         => $this->overtime->reason,
        ];
    }
}
