<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'type'              => $this->notification_type,
            'title'             => $this->title,
            'message'           => $this->message,
            'data'              => $this->data,
            'is_read'           => $this->is_read,
            'action_url'        => $this->action_url,
            'created_at'        => $this->created_at->diffForHumans(),
            'created_at_full'   => $this->created_at->format('d/m/Y H:i'),
        ];
    }
}
