<?php
namespace App\Http\Controllers\Api;

use App\Models\CompanySite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $sites = CompanySite::with('company:id,company_name')
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->orderBy('site_name')
            ->get();

        return $this->successResponse($sites);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'site_code'      => 'required|string|max:20|unique:company_sites',
            'site_name'      => 'required|string|max:100',
            'address'        => 'nullable|string',
            'project_manager'=> 'nullable|string|max:100',
            'start_date'     => 'required|date',
            'end_date'       => 'nullable|date|after:start_date',
            'status'         => 'required|in:active,completed,hold',
            'gps_latitude'   => 'required|numeric|between:-90,90',
            'gps_longitude'  => 'required|numeric|between:-180,180',
            'gps_radius'     => 'required|integer|min:10|max:5000',
        ]);

        $site = CompanySite::create($validated);

        return $this->successResponse($site, 'Site berhasil dibuat', 201);
    }

    public function show(int $id): JsonResponse
    {
        $site = CompanySite::findOrFail($id);
        return $this->successResponse($site->load(['company', 'employees']));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $site = CompanySite::findOrFail($id);
        $validated = $request->validate([
            'site_name'      => 'sometimes|string|max:100',
            'address'        => 'nullable|string',
            'project_manager'=> 'nullable|string|max:100',
            'status'         => 'sometimes|in:active,completed,hold',
            'gps_latitude'   => 'sometimes|numeric|between:-90,90',
            'gps_longitude'  => 'sometimes|numeric|between:-180,180',
            'gps_radius'     => 'sometimes|integer|min:10|max:5000',
            'end_date'       => 'nullable|date',
        ]);

        $site->update($validated);

        return $this->successResponse($site->fresh(), 'Site diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        $site = CompanySite::findOrFail($id);
        if ($site->employees()->active()->exists()) {
            return $this->errorResponse('Site masih memiliki karyawan aktif');
        }

        $site->update(['status' => 'completed']);
        return $this->successResponse(null, 'Site dinonaktifkan');
    }
}
