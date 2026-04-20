<?php
namespace App\Http\Controllers\Api;

use App\Models\AttendanceRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Log;

class AttendanceRuleController extends BaseController
{
    /**
     * Get all attendance rules
     */
    public function index(): JsonResponse
    {
        $rules = AttendanceRule::orderBy('rule_name')->get();
        return $this->successResponse($rules);
    }

    /**
     * Get single attendance rule
     */
    public function show(int $id): JsonResponse
    {
        $rule = AttendanceRule::find($id);

        if (!$rule) {
            return $this->errorResponse('Aturan absensi tidak ditemukan', 404);
        }

        return $this->successResponse($rule);
    }

    /**
     * Create new attendance rule
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rule_name'                => 'required|string|max:100|unique:attendance_rules,rule_name',
            'start_time'               => 'required|date_format:H:i:s',
            'end_time'                 => 'required|date_format:H:i:s|after:start_time',
            'late_grace_period'        => 'required|integer|min:0|max:120',
            'late_threshold'           => 'required|integer|min:0|max:480',
            'max_late_minutes_per_month' => 'required|integer|min:0',
            'overtime_start_after'     => 'required|integer|min:0',
        ]);

        $rule = AttendanceRule::create($validated);

        activity()
            ->causedBy(request()->user())
            ->performedOn($rule)
            ->withProperties(['attributes' => $rule->toArray()])
            ->log('Membuat aturan absensi baru');

        return $this->successResponse($rule, 'Aturan absensi berhasil dibuat', 201);
    }

    /**
     * Update attendance rule
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $rule = AttendanceRule::find($id);

        if (!$rule) {
            return $this->errorResponse('Aturan absensi tidak ditemukan', 404);
        }

        $validated = $request->validate([
            'rule_name'                => 'sometimes|string|max:100|unique:attendance_rules,rule_name,' . $id,
            'start_time'               => 'sometimes|date_format:H:i:s',
            'end_time'                 => 'sometimes|date_format:H:i:s|after_or_equal:start_time',
            'late_grace_period'        => 'sometimes|integer|min:0|max:120',
            'late_threshold'           => 'sometimes|integer|min:0|max:480',
            'max_late_minutes_per_month' => 'sometimes|integer|min:0',
            'overtime_start_after'     => 'sometimes|integer|min:0',
        ]);

        $oldValues = $rule->toArray();
        $rule->update($validated);

        activity()
            ->causedBy(request()->user())
            ->performedOn($rule)
            ->withProperties([
                'old' => $oldValues,
                'new' => $rule->toArray(),
            ])
            ->log('Mengubah aturan absensi');

        return $this->successResponse($rule, 'Aturan absensi berhasil diperbarui');
    }

    /**
     * Delete attendance rule
     */
    public function destroy(int $id): JsonResponse
    {
        $rule = AttendanceRule::find($id);

        if (!$rule) {
            return $this->errorResponse('Aturan absensi tidak ditemukan', 404);
        }

        // Check if rule is being used by employees
        $usageCount = \App\Models\Employee::where('attendance_rule_id', $id)->count();
        if ($usageCount > 0) {
            return $this->errorResponse(
                "Aturan absensi sedang digunakan oleh {$usageCount} karyawan. Tidak dapat dihapus.",
                422
            );
        }

        $ruleData = $rule->toArray();
        $rule->delete();

        activity()
            ->causedBy(request()->user())
            ->performedOn($rule)
            ->withProperties(['attributes' => $ruleData])
            ->log('Menghapus aturan absensi');

        return $this->successResponse(null, 'Aturan absensi berhasil dihapus');
    }

    /**
     * Get default rule for quick access
     */
    public function getDefault(): JsonResponse
    {
        $rule = AttendanceRule::first();

        if (!$rule) {
            // Return hard-coded defaults
            return $this->successResponse([
                'id' => null,
                'rule_name' => 'Default',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'late_grace_period' => 15,
                'late_threshold' => 30,
                'max_late_minutes_per_month' => 120,
                'overtime_start_after' => 60,
            ]);
        }

        return $this->successResponse($rule);
    }
}
