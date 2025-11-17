<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email tidak ditemukan dalam sistem.'
            ], 404);
        }

        // Generate reset token
        $token = Str::random(64);
        
        // Store token in password_resets table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        // Send email (with queue for production)
        try {
            if (env('MAIL_MAILER') === 'log') {
                // Development mode - show reset link in response
                $resetUrl = env('FRONTEND_URL') . '/reset-password/' . $token . '?email=' . urlencode($request->email);
                
                \Log::info('Password Reset Link Generated', [
                    'email' => $request->email,
                    'reset_url' => $resetUrl,
                    'token' => $token
                ]);
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Link reset password telah digenerate. Cek log Laravel untuk link reset.',
                    'dev_reset_url' => $resetUrl // Only in development
                ]);
            } else {
                // Production mode - send actual email
                Mail::send('emails.password-reset', [
                    'token' => $token,
                    'email' => $request->email,
                    'name' => $user->profile->full_name ?? 'User',
                    'reset_url' => env('FRONTEND_URL') . '/reset-password/' . $token . '?email=' . urlencode($request->email)
                ], function ($message) use ($request) {
                    $message->to($request->email);
                    $message->subject('Reset Password - Jejak Liqo');
                });

                return response()->json([
                    'status' => 'success',
                    'message' => 'Link reset password telah dikirim ke email Anda.'
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email. Silakan coba lagi.'
            ], 500);
        }
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Check if token exists and is valid
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$passwordReset || !Hash::check($request->token, $passwordReset->token)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token reset password tidak valid atau sudah kedaluwarsa.'
            ], 400);
        }

        // Check if token is not older than 1 hour
        if (now()->diffInMinutes($passwordReset->created_at) > 60) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token reset password sudah kedaluwarsa.'
            ], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil direset. Silakan login dengan password baru.'
        ]);
    }
}