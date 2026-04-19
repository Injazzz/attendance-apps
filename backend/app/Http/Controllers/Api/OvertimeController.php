<?php
namespace App\Http\Controllers\Api;

use App\Http\Requests\Overtime\StoreOvertimeRequest;
use App\Http\Requests\Overtime\ApproveOvertimeRequest;
use App\Http\Requests\Overtime\RejectOvertimeRequest;
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

    public function show(int $id): JsonResponse
    {
        $overtimeRequest = OvertimeRequest::findOrFail($id);
        return $this->successResponse(
            new OvertimeRequestResource(
                $overtimeRequest->load(['employee.department', 'approvedBy'])
            )
        );
    }

    public function approve(ApproveOvertimeRequest $request, int $id): JsonResponse
    {
        $overtimeRequest = OvertimeRequest::findOrFail($id);
        $approver = $request->user()->employee;
        $result = $this->approvalService->approveOvertime(
            $overtimeRequest,
            $approver,
            $request->validated('notes')
        );

        if (!isset($result['data'])) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse(
            new OvertimeRequestResource($result['data']),
            $result['message']
        );
    }

    public function reject(RejectOvertimeRequest $request, int $id): JsonResponse
    {
        $overtimeRequest = OvertimeRequest::findOrFail($id);
        $approver = $request->user()->employee;
        $result = $this->approvalService->rejectOvertime(
            $overtimeRequest,
            $approver,
            $request->validated('reason')
        );

        if (!isset($result['data'])) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse(
            new OvertimeRequestResource($result['data']),
            $result['message']
        );
    }
}
