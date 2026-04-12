<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QrSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'overtime_date' => $this->overtime_date?->format('Y-m-d'),
            'start_time'    => $this->start_time,
            'end_time'      => $this->end_time,
            'total_hours'   => $this->total_hours,
            'reason'        => $this->reason,
            'status'        => $this->status,
            'status_label'  => $this->status?->label ?? $this->status,
            'approved_at'   => $this->approved_at?->format('d/m/Y H:i'),
            'employee'      => $this->whenLoaded('employee', fn() => [
                'id'   => $this->employee->id,
                'name' => $this->employee->full_name,
            ]),
            'approved_by'   => $this->whenLoaded('approvedBy', fn() => [
                'id'   => $this->approvedBy?->id,
                'name' => $this->approvedBy?->full_name,
            ]),
            'created_at'    => $this->created_at->diffForHumans(),
        ];
    }
}
