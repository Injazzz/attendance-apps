<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'username'          => $this->username,
            'email'             => $this->email,
            'role'              => $this->role,
            'is_active'         => $this->is_active,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'last_login'        => $this->last_login?->diffForHumans(),
            'last_login_full'   => $this->last_login?->format('d/m/Y H:i'),
            'employee'          => new EmployeeResource($this->whenLoaded('employee')),
            'permissions'       => $this->when(
                $request->routeIs('auth.me'),
                fn() => $this->getAllPermissions()->pluck('name')
            ),
        ];
    }
}
