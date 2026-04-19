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
        // Calculate is_valid: must be active AND within valid time window
        $now = now();
        $isValid = $this->is_active
            && $now->isBetween($this->valid_from, $this->valid_to);

        return [
            'id'              => $this->id,
            'session_token'   => $this->session_token,
            'display_id'      => $this->display_id,
            'site_id'         => $this->site_id,
            'qr_type'         => $this->qr_type,
            'valid_from'      => $this->valid_from?->format('Y-m-d H:i:s'),
            'valid_to'        => $this->valid_to?->format('Y-m-d H:i:s'),
            'current_scans'   => $this->current_scans,
            'is_active'       => $this->is_active,
            'is_valid'        => $isValid,
            'created_at'      => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
