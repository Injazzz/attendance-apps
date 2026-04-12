<?php
namespace App\Http\Controllers\Api;

use App\Http\Requests\Overtime\StoreOvertimeRequest;
use App\Http\Resources\OvertimeRequestResource;
use App\Models\OvertimeRequest;
use App\Services\OvertimeApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OvertimeController extends BaseController
{
    public function __construct(
        private readonly OvertimeApprovalService $approvalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user     = $request->user();
        $employee = $user->employee;

        $query = OvertimeRequest::with(['employee.department', 'employee.position', 'approvedBy'])
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->start_date, fn($q, $v) => $q->where('overtime_date', '>=', $v))
            ->when($request->end_date, fn($q, $v) => $q->where('overtime_date', '<=', $v));

        // Filter berdasarkan role
        if ($user->hasRole(['employee'])) {
            $query->where('employee_id', $employee->id);
        } elseif ($user->hasRole(['supervisor'])) {
            $query->whereHas('employee', fn($q) =>
                $q->whereHas('department', fn($dq) =>
                    $dq->where('department_head_id', $employee->id)
                )
            );
        }
        // admin, hrd, finance, project_manager → lihat semua

        $results = $query->orderBy('overtime_date', 'desc')
            ->paginate($request->per_page ?? 15);

        return $this->paginatedResponse($results);
    }

    public function store(StoreOvertimeRequest $request): JsonResponse
    {
        $employee = $request->user()->employee;
        $result   = $this->approvalService->submitOvertime($employee, $request->validated());

        if (!isset($result['data'])) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse(
            new OvertimeRequestResource($result['data']),
            $result['message'],
            201
        );
    }

    public function show(OvertimeRequest $overtimeRequest): JsonResponse
    {
        return $this->successResponse(
            new OvertimeRequestResource(
                $overtimeRequest->load(['employee.department', 'approvedBy'])
            )
        );
    }

    public function approve(Request $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        $request->validate(['notes' => 'nullable|string|max:500']);

        $approver = $request->user()->employee;
        $result   = $this->approvalService->approveOvertime(
            $overtimeRequest, $approver, $request->notes
        );

        if (!isset($result['data'])) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse(
            new OvertimeRequestResource($result['data']),
            $result['message']
        );
    }

    public function reject(Request $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        $request->validate(['reason' => 'required|string|min:5|max:500']);

        if ($overtimeRequest->status->value !== 'pending') {
            return $this->errorResponse('Pengajuan sudah diproses sebelumnya');
        }

        $approver = $request->user()->employee;

        $overtimeRequest->update([
            'status'      => 'rejected',
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);

        // Notifikasi ke karyawan
        \App\Models\Notification::create([
            'user_id'           => $overtimeRequest->employee->user->id,
            'notification_type' => 'approval',
            'title'             => 'Pengajuan Lembur Ditolak',
            'message'           => "Lembur {$overtimeRequest->overtime_date->format('d/m/Y')} ditolak: {$request->reason}",
            'data'              => ['overtime_id' => $overtimeRequest->id],
            'action_url'        => "/overtime/{$overtimeRequest->id}",
        ]);

        broadcast(new \App\Events\OvertimeStatusChanged($overtimeRequest, 'rejected'));

        return $this->successResponse(
            new OvertimeRequestResource($overtimeRequest->fresh()),
            'Lembur ditolak'
        );
    }
}
