<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Laravel\Fortify\Contracts\PasswordResetResponse;
use Laravel\Fortify\Contracts\RequestPasswordResetLinkResponse;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorAuthenticatable::class);

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
        
        // Customize reset password email
        ResetPassword::toMailUsing(function ($notifiable, $token) {
            $resetUrl = config('app.frontend_url') . '/reset-password/' . $token . '?email=' . urlencode($notifiable->email);
            $userName = $notifiable->profile->full_name ?? null;
            
            return (new MailMessage)
                ->subject('Reset Password - Jejak Liqo')
                ->view('emails.reset-password', [
                    'resetUrl' => $resetUrl,
                    'userName' => $userName
                ]);
        });
        
        // Force JSON responses for API requests
        $this->app->singleton(RequestPasswordResetLinkResponse::class, function () {
            return new class implements RequestPasswordResetLinkResponse {
                public function toResponse($request)
                {
                    return response()->json([
                        'message' => 'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.'
                    ]);
                }
            };
        });
        
        $this->app->singleton(PasswordResetResponse::class, function () {
            return new class implements PasswordResetResponse {
                public function toResponse($request)
                {
                    return response()->json([
                        'message' => 'Password berhasil direset. Silakan login dengan password baru.'
                    ]);
                }
            };
        });
    }
}
