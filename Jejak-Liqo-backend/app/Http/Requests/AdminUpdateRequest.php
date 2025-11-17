<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', Rule::unique('users')->ignore($this->route('admin'))],
            'password' => 'nullable|string|min:8',
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'hobby' => 'nullable|string',
            'address' => 'nullable|string',
            'job' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:Aktif,Non-Aktif',
            'status_note' => 'required_if:status,Non-Aktif|nullable|string',
            'gender' => 'required|in:Ikhwan,Akhwat',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email is required',
            'email.email' => 'Email must be a valid email address',
            'email.unique' => 'Email has already been taken',
            'password.min' => 'Password must be at least 8 characters',
            'full_name.required' => 'Full name is required',
            'gender.required' => 'Gender is required',
            'gender.in' => 'Gender must be either Ikhwan or Akhwat',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be either Aktif or Non-Aktif',
            'status_note.required_if' => 'Status note is required when status is Non-Aktif',
            'profile_picture.image' => 'Profile picture must be an image',
            'profile_picture.mimes' => 'Profile picture must be a file of type: jpeg, png, jpg, gif',
            'profile_picture.max' => 'Profile picture may not be greater than 2MB',
        ];
    }
}
