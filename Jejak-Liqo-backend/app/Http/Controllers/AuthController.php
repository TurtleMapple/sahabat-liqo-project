<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\UserResource;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::with('profile')->where('email', $request->email)->first();

        $status = 'Failed';

        // Cek apakah email terdaftar
        if (!$user) {
            LoginAttempt::create([
                'user_id' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'status' => 'Email Not Found',
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Email tidak terdaftar',
                'error_type' => 'email_not_found'
            ], 422);
        }

        // Cek apakah akun diblokir
        if ($user->blocked_at) {
            $contact = $user->role === 'mentor' ? 'admin' : 'super admin';
            $blockedAt = $user->blocked_at->format('d/m/Y H:i:s');

            LoginAttempt::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'status' => 'Account Blocked',
            ]);

            return response()->json([
                'status' => 'error',
                'message' => "Akun {$user->role} telah diblokir pada {$blockedAt}, silahkan hubungi {$contact}",
                'error_type' => 'account_blocked',
                'blocked_at' => $blockedAt,
                'contact' => $contact
            ], 422);
        }

        // Cek password
        if (!Hash::check($request->password, $user->password)) {
            LoginAttempt::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'status' => 'Wrong Password',
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Password yang Anda masukkan salah',
                'error_type' => 'wrong_password'
            ], 422);
        }

        // Login berhasil
        $status = 'Success';

        // 🔒 Strict Single Session
        $user->tokens()->delete();

        $token = $user->tokens()->create([
            'name' => 'auth-token',
            'token' => hash('sha256', $plainTextToken = Str::random(80)),
            'abilities' => ['*'],
            'expires_at' => now()->addHours(3),
        ]);

        // 🧠 Catat login attempt berhasil
        LoginAttempt::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'status' => $status,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user),
                'token' => $plainTextToken,
                'token_expires_at' => $token->expires_at->timestamp,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout successful',
        ]);
    }

    public function logoutAll(Request $request)
    {
        $user = $request->user();

        // Hapus semua token milik user ini
        $user->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'All sessions have been logged out.',
        ]);
    }

    public function me(Request $request){
        $user = $request->user()->load('profile');

        return response()->json([
            'status' => 'success',
            'message' => 'User data retrieved successfully',
            'data' => new UserResource($user),
        ]);
    }
}