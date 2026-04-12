<?php
namespace App\Http\Controllers\Api;

use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $positions = Position::with('jobFamily')
            ->when($request->job_family_id, fn($q, $v) => $q->where('job_family_id', $v))
            ->orderBy('position_level')
            ->get();

        return $this->successResponse($positions);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'job_family_id'    => 'required|exists:job_families,id',
            'position_code'    => 'required|string|max:10|unique:positions,position_code',
            'position_name'    => 'required|string|max:100',
            'position_level'   => 'required|integer|min:1|max:99',
            'job_description'  => 'nullable|string',
            'min_qualification'=> 'nullable|string',
        ]);

        $position = Position::create($request->validated());

        return $this->successResponse($position, 'Jabatan berhasil dibuat', 201);
    }

    public function show(Position $position): JsonResponse
    {
        return $this->successResponse($position->load('jobFamily'));
    }

    public function update(Request $request, Position $position): JsonResponse
    {
        $request->validate([
            'position_name'      => 'sometimes|string|max:100',
            'position_level'     => 'sometimes|integer|min:1|max:99',
            'job_description'    => 'nullable|string',
            'custom_permissions' => 'nullable|array',
        ]);

        $position->update($request->validated());

        return $this->successResponse($position->fresh(), 'Jabatan diperbarui');
    }

    public function destroy(Position $position): JsonResponse
    {
        if ($position->employees()->exists()) {
            return $this->errorResponse('Tidak bisa hapus jabatan yang masih dipakai karyawan');
        }

        $position->delete();
        return $this->successResponse(null, 'Jabatan dihapus');
    }
}
