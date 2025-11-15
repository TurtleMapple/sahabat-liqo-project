<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'event_at' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:5120',
        ];
    }
}