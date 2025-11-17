<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_name' => $this->group_name,
            'description' => $this->description,
            'gender' => $this->mentor?->profile?->gender,
            'mentor' => $this->when($this->mentor, [
                'id' => $this->mentor?->id,
                'email' => $this->mentor?->email,
                'name' => $this->mentor?->profile?->full_name ?? $this->mentor?->email,
                'gender' => $this->mentor?->profile?->gender,
            ]),
            'mentees' => MenteeResource::collection($this->whenLoaded('mentees')),
            'mentees_count' => $this->whenLoaded('mentees', function() {
                return $this->mentees->count();
            }),
            'meetings_count' => $this->whenLoaded('meetings', function() {
                return $this->meetings->count();
            }),
            'gender_distribution' => $this->whenLoaded('mentees', function() {
                return [
                    'ikhwan' => $this->mentees->where('gender', 'Ikhwan')->count(),
                    'akhwat' => $this->mentees->where('gender', 'Akhwat')->count(),
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}