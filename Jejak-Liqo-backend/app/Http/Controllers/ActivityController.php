<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ActivityController extends Controller
{
    public function getActivities(Request $request)
    {
        try {
            $activities = collect();
            
            // Get recent users (registrations)
            $recentUsers = User::with('profile')
                ->where('created_at', '>=', now()->subDays(30))
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => 'user_' . $user->id,
                        'type' => 'user_management',
                        'action' => 'Pengguna baru terdaftar',
                        'details' => ($user->profile->full_name ?? $user->email) . ' bergabung sebagai ' . ucfirst($user->role),
                        'user' => 'System',
                        'timestamp' => $user->created_at->toISOString(),
                        'icon' => 'UserPlus',
                        'color' => 'blue'
                    ];
                });

            $activities = $activities->concat($recentUsers);

            // Sort and limit
            $activities = $activities
                ->sortByDesc('timestamp')
                ->take(50)
                ->values();

            // Apply filters
            if ($request->has('type') && $request->type !== 'all') {
                $activities = $activities->where('type', $request->type)->values();
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = strtolower($request->search);
                $activities = $activities->filter(function ($activity) use ($search) {
                    return str_contains(strtolower($activity['action']), $search) ||
                           str_contains(strtolower($activity['details']), $search) ||
                           str_contains(strtolower($activity['user']), $search);
                })->values();
            }

            return response()->json([
                'status' => 'success',
                'data' => $activities,
                'total' => $activities->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}