<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Models\Employee;

class EmployeeCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public $collects = EmployeeResource::class;

    public function toArray(Request $request): array
    {
        // Get total statistics from database (not from paginated collection)
        $totalActive = Employee::where('status', 'active')->count();
        $totalInactive = Employee::whereIn('status', ['inactive', 'resigned', 'terminated'])->count();
        $totalByType = Employee::selectRaw('employment_type, count(*) as count')
            ->groupBy('employment_type')
            ->pluck('count', 'employment_type')
            ->toArray();

        return [
            // Data list karyawan (sudah di-transform oleh EmployeeResource)
            'data' => $this->collection,

            // Statistik dari database (bukan dari current page)
            'summary' => [
                'total'      => $totalActive + $totalInactive,
                'active'     => $totalActive,
                'inactive'   => $totalInactive,
                'by_type'    => $totalByType,
            ],
        ];
    }

    public function with(Request $request): array
    {
        return [
            'meta_info' => [
                'generated_at' => now()->toDateTimeString(),
                'timezone'     => config('app.timezone'),
            ],
        ];
    }
}
