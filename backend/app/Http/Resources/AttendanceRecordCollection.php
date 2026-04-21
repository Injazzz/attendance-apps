<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class AttendanceRecordCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public $collects = AttendanceRecordResource::class;

    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,

            'summary' => [
                'total_records'       => $this->collection->count(),
                'total_present'       => $this->collection
                    ->whereIn('status', ['present', 'late'])
                    ->count(),
                'total_absent'        => $this->collection
                    ->where('status', 'absent')
                    ->count(),
                'total_late'          => $this->collection
                    ->where('status', 'late')
                    ->count(),
                'total_leave'         => $this->collection
                    ->whereIn('status', ['leave', 'sick'])
                    ->count(),
                'total_hours'         => round(
                    $this->collection->sum('total_hours'), 2
                ),
                'total_overtime_hours'=> round(
                    $this->collection->sum('overtime_hours'), 2
                ),
                'total_late_minutes'  => $this->collection->sum('late_minutes'),
                'attendance_rate'     => $this->collection->count() > 0
                    ? round(
                        $this->collection->whereIn('status', ['present', 'late'])->count()
                        / $this->collection->count() * 100,
                        2
                    )
                    : 0,
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

    /**
     * Override response to properly format pagination meta
     */
    public function response($request = null)
    {
        return parent::response($request)->setData(
            $this->formatData()
        );
    }

    private function formatData(): array
    {
        $data = [
            'data' => $this->collection,
            'summary' => [
                'total_records'       => $this->collection->count(),
                'total_present'       => $this->collection
                    ->whereIn('status', ['present', 'late'])
                    ->count(),
                'total_absent'        => $this->collection
                    ->where('status', 'absent')
                    ->count(),
                'total_late'          => $this->collection
                    ->where('status', 'late')
                    ->count(),
                'total_leave'         => $this->collection
                    ->whereIn('status', ['leave', 'sick'])
                    ->count(),
                'total_hours'         => round(
                    $this->collection->sum('total_hours'), 2
                ),
                'total_overtime_hours'=> round(
                    $this->collection->sum('overtime_hours'), 2
                ),
                'total_late_minutes'  => $this->collection->sum('late_minutes'),
                'attendance_rate'     => $this->collection->count() > 0
                    ? round(
                        $this->collection->whereIn('status', ['present', 'late'])->count()
                        / $this->collection->count() * 100,
                        2
                    )
                    : 0,
            ],
            'meta' => [
                'current_page' => $this->currentPage(),
                'last_page'    => $this->lastPage(),
                'total'        => $this->total(),
                'per_page'     => $this->perPage(),
                'from'         => $this->firstItem(),
                'to'           => $this->lastItem(),
            ],
            'meta_info' => [
                'generated_at' => now()->toDateTimeString(),
                'timezone'     => config('app.timezone'),
            ],
        ];

        return $data;
    }
}
