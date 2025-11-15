<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenteeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'group' => new GroupResource($this->whenLoaded('group')),
            'full_name' => $this->full_name,
            'gender' => $this->gender,
            'nickname' => $this->nickname,
            'birth_date' => $this->birth_date,
            'phone_number' => $this->phone_number,
            'activity_class' => $this->activity_class,
            'hobby' => $this->hobby,
            'address' => $this->address,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}