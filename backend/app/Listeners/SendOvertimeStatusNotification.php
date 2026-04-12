<?php

namespace App\Listeners;

use App\Events\OvertimeStatusChanged;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendOvertimeStatusNotification implements ShouldQueue
{
    public function handle(OvertimeStatusChanged $event): void
    {
        $overtime = $event->overtime;
        $employee = $overtime->employee;

        // Pastikan employee punya akun user
        if (!$employee->user) {
            return;
        }

        $isApproved = $event->newStatus === 'approved';

        Notification::create([
            'user_id'           => $employee->user->id,
            'notification_type' => $isApproved ? 'success' : 'warning',
            'title'             => $isApproved
                ? 'Lembur Disetujui'
                : 'Lembur Ditolak',
            'message'           => $isApproved
                ? sprintf(
                    'Pengajuan lembur Anda pada %s pukul %s - %s telah disetujui.',
                    $overtime->overtime_date->format('d/m/Y'),
                    $overtime->start_time,
                    $overtime->end_time
                )
                : sprintf(
                    'Pengajuan lembur Anda pada %s ditolak.',
                    $overtime->overtime_date->format('d/m/Y')
                ),
            'data' => [
                'overtime_id'   => $overtime->id,
                'overtime_date' => $overtime->overtime_date->format('d/m/Y'),
                'status'        => $event->newStatus,
                'approved_by'   => $overtime->approvedBy?->full_name,
            ],
            'action_url' => "/overtime/{$overtime->id}",
            'is_read'    => false,
        ]);

        // Log aktivitas
        activity()
            ->performedOn($overtime)
            ->withProperties(['status' => $event->newStatus])
            ->log("Status lembur diubah menjadi {$event->newStatus}");
    }

    public function failed(OvertimeStatusChanged $event, \Throwable $exception): void
    {
        Log::error('Gagal kirim notifikasi status lembur', [
            'overtime_id' => $event->overtime->id,
            'status'      => $event->newStatus,
            'error'       => $exception->getMessage(),
        ]);
    }
}
