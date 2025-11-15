<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\User;
use App\Models\Mentee;

class GroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'mentor_id' => 'required|exists:users,id',
            'mentee_ids' => 'nullable|array',
            'mentee_ids.*' => 'exists:mentees,id',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->mentor_id && $this->mentee_ids) {
                $mentor = User::with('profile')->find($this->mentor_id);
                $mentorGender = $mentor->profile->gender ?? null;
                
                if ($mentorGender) {
                    $mentees = Mentee::whereIn('id', $this->mentee_ids)->get();
                    foreach ($mentees as $mentee) {
                        if ($mentee->gender !== $mentorGender) {
                            $validator->errors()->add('mentee_ids', 'Semua mentee harus memiliki gender yang sama dengan mentor (' . $mentorGender . ')');
                            break;
                        }
                    }
                }
            }
        });
    }
}