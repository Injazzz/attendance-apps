<?php
namespace App\Http\Controllers\Api;

use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
        $validated = $request->validate([
            'job_family_id'    => 'required|exists:job_families,id',
            'position_code'    => 'required|string|max:10|unique:positions,position_code',
            'position_name'    => 'required|string|max:100',
            'position_level'   => 'required|integer|min:1|max:99',
            'job_description'  => 'nullable|string',
            'min_qualification'=> 'nullable|string',
        ]);

        $position = Position::create($validated);

        return $this->successResponse(
            $position->load('jobFamily:id,family_name'),
            'Jabatan berhasil dibuat',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $position = Position::findOrFail($id);
        return $this->successResponse($position->load('jobFamily'));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $position = Position::findOrFail($id);
        $validated = $request->validate([
            'position_code'      => [
                'sometimes',
                'string',
                'max:10',
                Rule::unique('positions', 'position_code')->ignore($id),
            ],
            'position_name'      => 'sometimes|string|max:100',
            'position_level'     => 'sometimes|integer|min:1|max:99',
            'job_family_id'      => 'sometimes|exists:job_families,id',
            'job_description'    => 'nullable|string',
            'min_qualification'  => 'nullable|string',
            'custom_permissions' => 'nullable|array',
        ]);

        $position->update($validated);

        return $this->successResponse(
            $position->fresh('jobFamily:id,family_name'),
            'Jabatan diperbarui'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $position = Position::findOrFail($id);
        if ($position->employees()->exists()) {
            return $this->errorResponse('Tidak bisa hapus jabatan yang masih dipakai karyawan');
        }

        $position->delete();
        return $this->successResponse(null, 'Jabatan dihapus');
    }
}
