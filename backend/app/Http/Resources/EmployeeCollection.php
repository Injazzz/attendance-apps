<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

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
        return [
            // Data list karyawan (sudah di-transform oleh EmployeeResource)
            'data' => $this->collection,

            // Statistik tambahan di level collection
            // Ini yang tidak bisa dilakukan oleh Resource biasa
            'summary' => [
                'total'      => $this->collection->count(),
                'active'     => $this->collection->where('status', 'active')->count(),
                'inactive'   => $this->collection->whereIn('status', [
                    'inactive', 'resigned', 'terminated'
                ])->count(),
                'by_type'    => $this->collection
                    ->groupBy('employment_type')
                    ->map(fn($group) => $group->count()),
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
