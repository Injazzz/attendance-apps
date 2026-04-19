<?php
namespace App\Http\Controllers\Api;

use App\Models\JobFamily;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobFamilyController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $jobFamilies = JobFamily::orderBy('family_name')->get();

        return $this->successResponse($jobFamilies);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'family_code'       => 'required|string|max:20|unique:job_families,family_code',
            'family_name'       => 'required|string|max:100',
            'level_range_start' => 'nullable|integer|min:1|max:99',
            'level_range_end'   => 'nullable|integer|min:1|max:99',
        ]);

        $jobFamily = JobFamily::create($validated);

        return $this->successResponse($jobFamily, 'Job Family berhasil dibuat', 201);
    }

    public function show(int $id): JsonResponse
    {
        $jobFamily = JobFamily::findOrFail($id);
        return $this->successResponse(
            $jobFamily->load('positions:id,position_code,position_name,position_level')
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $jobFamily = JobFamily::findOrFail($id);
        $validated = $request->validate([
            'family_code'       => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('job_families', 'family_code')->ignore($id),
            ],
            'family_name'       => 'sometimes|string|max:100',
            'level_range_start' => 'nullable|integer|min:1|max:99',
            'level_range_end'   => 'nullable|integer|min:1|max:99',
        ]);

        $jobFamily->update($validated);

        return $this->successResponse($jobFamily->fresh(), 'Job Family diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        $jobFamily = JobFamily::findOrFail($id);
        if ($jobFamily->positions()->exists()) {
            return $this->errorResponse('Tidak bisa hapus job family yang masih dipakai posisi');
        }

        $jobFamily->delete();
        return $this->successResponse(null, 'Job Family dihapus');
    }
}
