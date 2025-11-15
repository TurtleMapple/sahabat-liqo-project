<?php

use App\Http\Middleware\EnsureTokenNotExpired;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', 
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 1. Daftarkan alias agar bisa dipanggil lewat string di route
        $middleware->alias([
            'token.valid' => EnsureTokenNotExpired::class,
        ]);

        // 2. Tambahkan ke group API agar otomatis diterapkan ke semua route api
        $middleware->api(append: [
            EnsureTokenNotExpired::class,
        ]);

        // 3. Handle CORS untuk semua request
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->web(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
