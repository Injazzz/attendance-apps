<?php
namespace App\Http\Controllers\Api;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends BaseController
{
    public function index(): JsonResponse
    {
        return $this->successResponse(
            Company::with('sites')->orderBy('company_name')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'company_code'  => 'required|string|max:20|unique:companies',
            'company_name'  => 'required|string|max:100',
            'industry_type' => 'required|in:construction,manufacturing,logistics,retail,hospitality,office,other',
            'address'       => 'nullable|string',
            'phone'         => 'nullable|string|max:15',
            'email'         => 'nullable|email|max:100',
            'tax_id'        => 'nullable|string|max:50',
            'logo'          => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $company = Company::create($request->except('logo'));

        if ($request->hasFile('logo')) {
            $company->addMedia($request->file('logo'))->toMediaCollection('logo');
        }

        return $this->successResponse($company, 'Perusahaan berhasil dibuat', 201);
    }

    public function show(int $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        return $this->successResponse($company->load('sites'));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        $request->validate([
            'company_name' => 'sometimes|string|max:100',
            'address'      => 'nullable|string',
            'phone'        => 'nullable|string|max:15',
            'email'        => 'nullable|email',
            'tax_id'       => 'nullable|string|max:50',
            'logo'         => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $company->update($request->except('logo'));

        if ($request->hasFile('logo')) {
            $company->addMedia($request->file('logo'))->toMediaCollection('logo');
        }

        return $this->successResponse($company->fresh(), 'Perusahaan diperbarui');
    }

    public function destroy(int $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        return $this->errorResponse('Perusahaan tidak dapat dihapus dari sistem');
    }
}
