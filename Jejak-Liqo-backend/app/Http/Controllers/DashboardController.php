<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Group;
use App\Models\Mentee;
use App\Models\Meeting;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Hitung total untuk setiap kategori
        $startOfWeek = now()->startOfWeek(); // Senin minggu ini
        $total_reports = Meeting::where('meeting_date', '>=', $startOfWeek)->count(); // Total Laporan minggu ini (Senin-Minggu)
        $total_mentors = User::where('role', 'mentor')->count();
        $total_mentees = Mentee::count();
        $total_admins = User::where('role', 'admin')->whereNull('deleted_at')->count();

        $stats = [
            'totalLaporan' => $total_reports,
            'totalMentor' => $total_mentors,
            'totalMentee' => $total_mentees,
            'totalAdmin' => $total_admins,
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard statistics fetched successfully',
            'data' => $stats,
        ]);
    }

    public function statsComparison()
    {
        $startOfWeek = now()->startOfWeek();
        $startOfMonth = now()->startOfMonth();
        
        // TOTAL KESELURUHAN (angka besar utama)
        $totals = [
            'totalMentee' => Mentee::count(),                           // Total keseluruhan
            'totalLaporan' => Meeting::where('meeting_date', '>=', $startOfWeek)->count(), // Total minggu ini saja
            'totalAdmin' => User::where('role', 'admin')->whereNull('deleted_at')->count(),      // Total keseluruhan
            'totalMentor' => User::where('role', 'mentor')->count(),    // Total keseluruhan
        ];

        // PENAMBAHAN PERIODE INI (angka kecil trend)
        $additions = [
            'totalMentee' => Mentee::where('created_at', '>=', $startOfMonth)->count(),                    // Penambahan bulan ini (reset tiap bulan)
            'totalLaporan' => Meeting::where('meeting_date', '>=', $startOfWeek)->count(),                  // Penambahan minggu ini (reset tiap minggu)
            'totalAdmin' => User::where('role', 'admin')->whereNull('deleted_at')->where('created_at', '>=', $startOfMonth)->count(),   // Penambahan bulan ini (reset tiap bulan)
            'totalMentor' => User::where('role', 'mentor')->where('created_at', '>=', $startOfMonth)->count(), // Penambahan bulan ini (reset tiap bulan)
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard statistics with additions fetched successfully',
            'data' => [
                'totals' => $totals,        // Angka besar utama
                'additions' => $additions,  // Angka kecil penambahan
            ],
        ]);
    }

    public function totalReports()
    {
        $totalAll = Meeting::count();
        $totalThisWeek = Meeting::where('meeting_date', '>=', now()->startOfWeek())->count();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Total reports fetched successfully',
            'data' => [
                'totalAll' => $totalAll,
                'totalThisWeek' => $totalThisWeek,
            ],
        ]);
    }

    public function recentAdmins()
    {
        $recentAdmins = User::with('profile')
            ->where('role', 'admin')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'name' => $admin->profile->full_name ?? 'Admin User',
                    'email' => $admin->email,
                    'joinDate' => $admin->created_at->format('d M Y'),
                    'profile_picture' => $admin->profile->profile_picture ? url('storage/' . $admin->profile->profile_picture) : null
                ];
            });

        return response()->json([
            'status' => 'success',
            'message' => 'Recent admins fetched successfully',
            'data' => $recentAdmins,
        ]);
    }
    
    public function yearlyTrend()
    {
        $currentYear = now()->year;
        
        // Get monthly meeting counts for current year
        $monthlyData = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        for ($month = 1; $month <= 12; $month++) {
            $meetingCount = Meeting::whereYear('meeting_date', $currentYear)
                ->whereMonth('meeting_date', $month)
                ->count();
                
            $monthlyData[] = [
                'month' => $monthNames[$month - 1],
                'meetings' => $meetingCount
            ];
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Yearly trend data fetched successfully',
            'data' => $monthlyData,
            'year' => $currentYear
        ]);
    }

    public function weeklyTrend()
    {
        $weeks = [];
        $today = now();
        
        // Generate 4 weeks data
        for ($i = 3; $i >= 0; $i--) {
            $weekStart = $today->copy()->subWeeks($i)->startOfWeek();
            $weekEnd = $weekStart->copy()->endOfWeek();
            
            $meetingCount = Meeting::whereBetween('meeting_date', [
                $weekStart->format('Y-m-d'),
                $weekEnd->format('Y-m-d')
            ])->count();
            
            $weeks[] = [
                'week' => 'Minggu ' . (4 - $i),
                'dateRange' => $weekStart->format('j/n') . ' - ' . $weekEnd->format('j/n'),
                'meetings' => $meetingCount
            ];
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Weekly trend data fetched successfully',
            'data' => $weeks
        ]);
    }

    public function upcomingEvents()
    {
        $events = [];
        
        // Get upcoming meetings (next 7 days)
        $upcomingMeetings = Meeting::with(['group'])
            ->where('meeting_date', '>=', now())
            ->where('meeting_date', '<=', now()->addDays(7))
            ->orderBy('meeting_date', 'asc')
            ->limit(5)
            ->get();
            
        foreach ($upcomingMeetings as $meeting) {
            $events[] = [
                'id' => $meeting->id,
                'title' => $meeting->topic ?: ('Pertemuan ' . ($meeting->group->group_name ?? 'Kelompok')),
                'type' => 'meeting',
                'date' => $meeting->meeting_date->format('Y-m-d'),
                'time' => $meeting->meeting_date->format('H:i'),
                'group' => $meeting->group->group_name ?? null
            ];
        }
        
        // Get active announcements (event_at in next 7 days)
        $upcomingAnnouncements = \App\Models\Announcement::where('event_at', '>=', now())
            ->where('event_at', '<=', now()->addDays(7))
            ->orderBy('event_at', 'asc')
            ->limit(3)
            ->get();
            
        foreach ($upcomingAnnouncements as $announcement) {
            $events[] = [
                'id' => 'ann_' . $announcement->id,
                'title' => $announcement->title,
                'type' => 'announcement',
                'date' => $announcement->event_at->format('Y-m-d'),
                'time' => $announcement->event_at->format('H:i')
            ];
        }
        
        // Sort by date and time
        usort($events, function($a, $b) {
            return strcmp($a['date'] . ' ' . $a['time'], $b['date'] . ' ' . $b['time']);
        });
        
        return response()->json([
            'status' => 'success',
            'message' => 'Upcoming events fetched successfully',
            'data' => array_slice($events, 0, 5) // Limit to 5 events
        ]);
    }
}