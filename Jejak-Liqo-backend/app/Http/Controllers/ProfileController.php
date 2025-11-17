<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show()
    {
        try {
            $user = Auth::user();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Profile retrieved successfully',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'profile' => $user->profile ? [
                        'full_name' => $user->profile->full_name,
                        'nickname' => $user->profile->nickname,
                        'gender' => $user->profile->gender,
                        'birth_date' => $user->profile->birth_date,
                        'phone_number' => $user->profile->phone_number,
                        'address' => $user->profile->address,
                        'job' => $user->profile->job,
                        'hobby' => $user->profile->hobby,
                        'profile_picture' => $user->profile->profile_picture,
                        'status' => $user->profile->status ?? 'Aktif',
                    ] : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $user = Auth::user();
            
            $request->validate([
                'full_name' => 'required|string|max:255',
                'nickname' => 'nullable|string|max:100',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'phone_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'job' => 'nullable|string|max:100',
                'hobby' => 'nullable|string|max:200',
                'birth_date' => 'nullable|date',
                'gender' => 'nullable|string|in:Ikhwan,Akhwat',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Update user email
            $user->update([
                'email' => $request->email
            ]);

            // Update or create profile
            $profileData = [
                'full_name' => $request->full_name,
                'nickname' => $request->nickname,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'job' => $request->job,
                'hobby' => $request->hobby,
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
            ];

            // Handle profile picture upload or removal
            if ($request->has('remove_profile_picture')) {
                // Delete old profile picture if exists
                if ($user->profile && $user->profile->profile_picture) {
                    Storage::disk('public')->delete($user->profile->profile_picture);
                }
                $profileData['profile_picture'] = null;
            } elseif ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($user->profile && $user->profile->profile_picture) {
                    Storage::disk('public')->delete($user->profile->profile_picture);
                }
                
                $profileData['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'data' => $user->fresh()->load('profile')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $request->validate([
                'current_password' => 'required',
                'new_password' => ['required', 'confirmed', Password::min(6)],
            ]);

            $user = Auth::user();

            // Check if current password is correct
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Current password is incorrect',
                    'errors' => [
                        'current_password' => ['Password saat ini tidak benar']
                    ]
                ], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Password changed successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to change password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}