<?php
namespace App\Services;

use App\Models\OvertimeRequest;
use App\Models\Employee;
use App\Events\OvertimeStatusChanged;

class OvertimeApprovalService extends BaseService
{
    public function submitOvertime(Employee $employee, array $data): array
    {
        // Validasi tidak ada lembur pending di hari yang sama
        $existing = OvertimeRequest::where('employee_id', $employee->id)
            ->where('overtime_date', $data['overtime_date'])
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return $this->fail('Sudah ada pengajuan lembur pending untuk tanggal ini');
        }

        $start = \Carbon\Carbon::parse($data['start_time']);
        $end   = \Carbon\Carbon::parse($data['end_time']);
        $totalHours = $start->diffInMinutes($end) / 60;

        $overtime = OvertimeRequest::create([
            'employee_id'   => $employee->id,
            'site_id'       => $employee->site_id,
            'overtime_date' => $data['overtime_date'],
            'start_time'    => $data['start_time'],
            'end_time'      => $data['end_time'],
            'total_hours'   => round($totalHours, 2),
            'reason'        => $data['reason'],
            'status'        => 'pending',
        ]);

        // Kirim notifikasi ke supervisor/department head
        $this->notifyApprovers($overtime);

        return $this->success($overtime, 'Pengajuan lembur berhasil dikirim');
    }

    public function approveOvertime(OvertimeRequest $overtime, Employee $approver, ?string $notes = null): array
    {
        if ($overtime->status !== 'pending') {
            return $this->fail('Pengajuan sudah diproses sebelumnya');
        }

        // Validasi approver punya wewenang
        if (!$this->canApprove($approver, $overtime)) {
            return $this->fail('Anda tidak memiliki wewenang untuk menyetujui lembur ini');
        }

        $overtime->update([
            'status'      => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);

        broadcast(new OvertimeStatusChanged($overtime, 'approved'));

        // Notifikasi ke karyawan
        \App\Models\Notification::create([
            'user_id'           => $overtime->employee->user->id,
            'notification_type' => 'approval',
            'title'             => 'Pengajuan Lembur Disetujui',
            'message'           => "Lembur tanggal {$overtime->overtime_date->format('d/m/Y')} telah disetujui oleh {$approver->full_name}",
            'data'              => ['overtime_id' => $overtime->id],
            'action_url'        => "/overtime/{$overtime->id}",
        ]);

        return $this->success($overtime, 'Lembur berhasil disetujui');
    }

    private function canApprove(Employee $approver, OvertimeRequest $overtime): bool
    {
        // Approver harus supervisor atau department head dari karyawan tersebut
        $dept = $overtime->employee->department;
        return $dept->department_head_id === $approver->id
            || $approver->user->hasPermissionTo('overtime.approve_all');
    }

    private function notifyApprovers(OvertimeRequest $overtime): void
    {
        $dept = $overtime->employee->department;
        $head = Employee::find($dept->department_head_id);

        if ($head?->user) {
            \App\Models\Notification::create([
                'user_id'           => $head->user->id,
                'notification_type' => 'approval',
                'title'             => 'Pengajuan Lembur Baru',
                'message'           => "{$overtime->employee->full_name} mengajukan lembur pada {$overtime->overtime_date->format('d/m/Y')}",
                'data'              => ['overtime_id' => $overtime->id],
                'action_url'        => "/overtime/{$overtime->id}",
            ]);

            // Broadcast via WebSocket
            broadcast(new \App\Events\NewOvertimeRequest($overtime, $head->user->id));
        }
    }
}