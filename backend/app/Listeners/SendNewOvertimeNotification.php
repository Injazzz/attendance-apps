<?php

namespace App\Listeners;

use App\Events\NewOvertimeRequest;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendNewOvertimeNotification implements ShouldQueue
{
    public function handle(NewOvertimeRequest $event): void
    {
        $overtime = $event->overtime;
        $employee = $overtime->employee;

        // Simpan notifikasi ke database untuk approver
        Notification::create([
            'user_id'           => $event->approverId,
            'notification_type' => 'approval',
            'title'             => 'Pengajuan Lembur Baru',
            'message'           => sprintf(
                '%s mengajukan lembur pada %s pukul %s - %s (%.1f jam)',
                $employee->full_name,
                $overtime->overtime_date->format('d/m/Y'),
                $overtime->start_time,
                $overtime->end_time,
                $overtime->total_hours
            ),
            'data' => [
                'overtime_id'   => $overtime->id,
                'employee_id'   => $employee->id,
                'employee_name' => $employee->full_name,
                'overtime_date' => $overtime->overtime_date->format('d/m/Y'),
                'total_hours'   => $overtime->total_hours,
            ],
            'action_url' => "/overtime/{$overtime->id}",
            'is_read'    => false,
        ]);

        // Log aktivitas
        activity()
            ->causedBy($employee->user)
            ->performedOn($overtime)
            ->log('Pengajuan lembur baru dikirim ke approver');
    }

    // Jika listener gagal setelah retry, jalankan ini
    public function failed(NewOvertimeRequest $event, \Throwable $exception): void
    {
        Log::error('Gagal kirim notifikasi pengajuan lembur', [
            'overtime_id' => $event->overtime->id,
            'error'       => $exception->getMessage(),
        ]);
    }
}
