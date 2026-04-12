<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_code'   => $this->employee_code,
            'full_name'       => $this->full_name,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'gender'          => $this->gender,
            'birthdate'       => $this->birthdate?->format('d/m/Y'),
            'hire_date'       => $this->hire_date?->format('d/m/Y'),
            'employment_type' => $this->employment_type,
            'status'          => $this->status,
            'photo_url'       => $this->getFirstMediaUrl('photo'),

            'department' => $this->whenLoaded('department', fn() => [
                'id'   => $this->department->id,
                'name' => $this->department->dept_name,
                'code' => $this->department->dept_code,
            ]),
            'position' => $this->whenLoaded('position', fn() => [
                'id'    => $this->position->id,
                'name'  => $this->position->position_name,
                'level' => $this->position->position_level,
            ]),
            'site' => $this->whenLoaded('site', fn() => [
                'id'   => $this->site->id,
                'name' => $this->site->site_name,
                'code' => $this->site->site_code,
            ]),

            // Info user account — hanya admin/HRD
            'user' => $this->when(
                $this->relationLoaded('user') &&
                $request->user()?->hasRole(['super_admin', 'admin', 'hrd']),
                fn() => $this->user ? [
                    'id'        => $this->user->id,
                    'username'  => $this->user->username,
                    'email'     => $this->user->email,
                    'role'      => $this->user->role,
                    'is_active' => $this->user->is_active,
                ] : null
            ),

            // Data sensitif
            'id_card' => $this->when(
                $request->user()?->hasRole(['super_admin', 'admin', 'hrd']),
                $this->id_card
            ),
            'npwp' => $this->when(
                $request->user()?->hasRole(['super_admin', 'admin', 'hrd', 'finance']),
                $this->npwp
            ),
            'tax_status' => $this->when(
                $request->user()?->hasRole(['super_admin', 'admin', 'hrd', 'finance']),
                $this->tax_status
            ),
        ];
    }
}
