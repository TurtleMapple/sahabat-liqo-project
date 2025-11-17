<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeetingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group' => [
                'id' => $this->group?->id,
                'name' => $this->group?->group_name,
                'mentor' => [
                    'id' => $this->group?->mentor?->id,
                    'name' => $this->group?->mentor?->profile?->full_name ?? $this->group?->mentor?->email,
                ],
                'mentees_count' => $this->whenLoaded('group', function() {
                    return $this->group->mentees->count();
                }),
            ],
            'meeting_date' => $this->meeting_date,
            'place' => $this->place,
            'topic' => $this->topic,
            'notes' => $this->notes,
            'meeting_type' => $this->meeting_type,
            'photos' => $this->photos,
            'attendances' => AttendanceResource::collection($this->whenLoaded('attendances')),
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}