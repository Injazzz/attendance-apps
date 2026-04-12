<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceScanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'scan_type' => $this->scan_type,
            'scan_time' => $this->scan_time?->format('H:i:s'),
            'scan_date' => $this->scan_date?->format('Y-m-d'),
            'latitude'  => $this->latitude,
            'longitude' => $this->longitude,
            'status'    => $this->status,
        ];
    }
}
