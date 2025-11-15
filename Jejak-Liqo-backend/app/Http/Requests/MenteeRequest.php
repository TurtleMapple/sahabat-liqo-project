<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MenteeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_id' => 'nullable|exists:groups,id',
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:255',
            'activity_class' => 'nullable|string|max:255',
            'hobby' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|in:Aktif,Non-Aktif',
            'gender' => 'nullable|in:Ikhwan,Akhwat',
        ];
    }
}