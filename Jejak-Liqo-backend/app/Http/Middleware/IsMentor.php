<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsMentor
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->role === 'mentor') {
            return $next($request);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized access. Only mentors can perform this action.',
        ], 403);
    }
}