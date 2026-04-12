<?php
namespace App\Http\Controllers\Api;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $depts = Department::with(['head:id,full_name', 'parent:id,dept_name'])
            ->when($request->company_id, fn($q, $v) => $q->where('company_id', $v))
            ->orderBy('dept_name')
            ->get();

        return $this->successResponse($depts);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'company_id'           => 'required|exists:companies,id',
            'dept_code'            => 'required|string|max:10',
            'dept_name'            => 'required|string|max:50',
            'cost_center'          => 'nullable|string|max:20',
            'department_head_id'   => 'nullable|exists:employees,id',
            'parent_department_id' => 'nullable|exists:departments,id',
        ]);

        $dept = Department::create($request->validated());

        return $this->successResponse($dept, 'Departemen berhasil dibuat', 201);
    }

    public function show(Department $department): JsonResponse
    {
        return $this->successResponse(
            $department->load(['head', 'parent', 'children', 'employees'])
        );
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $request->validate([
            'dept_name'          => 'sometimes|string|max:50',
            'cost_center'        => 'nullable|string|max:20',
            'department_head_id' => 'nullable|exists:employees,id',
        ]);

        $department->update($request->validated());

        return $this->successResponse($department->fresh(), 'Departemen diperbarui');
    }

    public function destroy(Department $department): JsonResponse
    {
        if ($department->employees()->active()->exists()) {
            return $this->errorResponse('Tidak bisa hapus departemen yang masih memiliki karyawan aktif');
        }

        $department->delete();
        return $this->successResponse(null, 'Departemen dihapus');
    }
}
