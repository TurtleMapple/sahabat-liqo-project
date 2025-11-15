<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Mentee;
use App\Models\Meeting;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function getTopGroups()
    {
        try {
            $topGroups = Group::with(['mentor.profile'])
                ->withCount('meetings')
                ->orderBy('meetings_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'group_name' => $group->group_name,
                        'mentor_name' => $group->mentor->profile->full_name ?? $group->mentor->name ?? 'Tidak ada mentor',
                        'meetings_count' => $group->meetings_count
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Top groups fetched successfully',
                'data' => $topGroups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch top groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTopMentees()
    {
        try {
            $topMentees = Mentee::with(['group'])
                ->select('mentees.*')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id 
                     AND attendances.status = "Hadir") as total_present
                ')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id) as total_meetings
                ')
                ->selectRaw('
                    CASE 
                        WHEN (SELECT COUNT(*) FROM attendances 
                              JOIN meetings ON attendances.meeting_id = meetings.id 
                              WHERE attendances.mentee_id = mentees.id) > 0
                        THEN ROUND(
                            (SELECT COUNT(*) FROM attendances 
                             JOIN meetings ON attendances.meeting_id = meetings.id 
                             WHERE attendances.mentee_id = mentees.id 
                             AND attendances.status = "Hadir") * 100.0 / 
                            (SELECT COUNT(*) FROM attendances 
                             JOIN meetings ON attendances.meeting_id = meetings.id 
                             WHERE attendances.mentee_id = mentees.id), 0
                        )
                        ELSE 0
                    END as attendance_percentage
                ')
                ->having('total_meetings', '>', 0)
                ->orderBy('attendance_percentage', 'desc')
                ->orderBy('total_present', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($mentee) {
                    return [
                        'id' => $mentee->id,
                        'full_name' => $mentee->full_name,
                        'group_name' => $mentee->group->group_name ?? 'Tidak ada kelompok',
                        'attendance_percentage' => (int) $mentee->attendance_percentage,
                        'total_present' => $mentee->total_present,
                        'total_meetings' => $mentee->total_meetings
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Top mentees fetched successfully',
                'data' => $topMentees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch top mentees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMenteeStats($menteeId)
    {
        try {
            $mentee = Mentee::with(['group'])->findOrFail($menteeId);
            
            $stats = Mentee::where('id', $menteeId)
                ->select('mentees.*')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id 
                     AND attendances.status = "Hadir") as total_present
                ')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id 
                     AND attendances.status = "Sakit") as total_sakit
                ')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id 
                     AND attendances.status = "Izin") as total_izin
                ')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id 
                     AND attendances.status = "Alpa") as total_alpa
                ')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id) as total_meetings
                ')
                ->selectRaw('
                    CASE 
                        WHEN (SELECT COUNT(*) FROM attendances 
                              JOIN meetings ON attendances.meeting_id = meetings.id 
                              WHERE attendances.mentee_id = mentees.id) > 0
                        THEN ROUND(
                            (SELECT COUNT(*) FROM attendances 
                             JOIN meetings ON attendances.meeting_id = meetings.id 
                             WHERE attendances.mentee_id = mentees.id 
                             AND attendances.status = "Hadir") * 100.0 / 
                            (SELECT COUNT(*) FROM attendances 
                             JOIN meetings ON attendances.meeting_id = meetings.id 
                             WHERE attendances.mentee_id = mentees.id), 0
                        )
                        ELSE 0
                    END as attendance_percentage
                ')
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Mentee stats fetched successfully',
                'data' => [
                    'id' => $stats->id,
                    'full_name' => $stats->full_name,
                    'group_name' => $mentee->group->group_name ?? 'Tidak ada kelompok',
                    'total_meetings' => (int) $stats->total_meetings,
                    'total_present' => (int) $stats->total_present,
                    'total_sakit' => (int) $stats->total_sakit,
                    'total_izin' => (int) $stats->total_izin,
                    'total_alpa' => (int) $stats->total_alpa,
                    'attendance_percentage' => (int) $stats->attendance_percentage
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch mentee stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTopMentors()
    {
        try {
            $topMentors = DB::table('meetings')
                ->join('users', 'meetings.mentor_id', '=', 'users.id')
                ->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
                ->select(
                    'users.id',
                    DB::raw('IFNULL(profiles.full_name, SUBSTRING_INDEX(users.email, "@", 1)) as mentor_name'),
                    DB::raw('COUNT(meetings.id) as meetings_count')
                )
                ->whereNull('meetings.deleted_at')
                ->groupBy('users.id')
                ->orderBy('meetings_count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($mentor) {
                    return [
                        'id' => $mentor->id,
                        'mentor_name' => $mentor->mentor_name,
                        'group_name' => 'Multi Kelompok',
                        'meetings_count' => (int) $mentor->meetings_count
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Top mentors fetched successfully',
                'data' => $topMentors
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch top mentors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLeastActiveGroups()
    {
        try {
            $leastActiveGroups = Group::with(['mentor.profile'])
                ->withCount('meetings')
                ->orderBy('meetings_count', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'group_name' => $group->group_name,
                        'mentor_name' => $group->mentor->profile->full_name ?? $group->mentor->name ?? 'Tidak ada mentor',
                        'meetings_count' => $group->meetings_count
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Least active groups fetched successfully',
                'data' => $leastActiveGroups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch least active groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLeastActiveMentees()
    {
        try {
            $leastActiveMentees = Mentee::with(['group'])
                ->select('mentees.*')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id 
                     AND attendances.status = "Hadir") as total_present
                ')
                ->selectRaw('
                    (SELECT COUNT(*) FROM attendances 
                     JOIN meetings ON attendances.meeting_id = meetings.id 
                     WHERE attendances.mentee_id = mentees.id) as total_meetings
                ')
                ->selectRaw('
                    CASE 
                        WHEN (SELECT COUNT(*) FROM attendances 
                              JOIN meetings ON attendances.meeting_id = meetings.id 
                              WHERE attendances.mentee_id = mentees.id) > 0
                        THEN ROUND(
                            (SELECT COUNT(*) FROM attendances 
                             JOIN meetings ON attendances.meeting_id = meetings.id 
                             WHERE attendances.mentee_id = mentees.id 
                             AND attendances.status = "Hadir") * 100.0 / 
                            (SELECT COUNT(*) FROM attendances 
                             JOIN meetings ON attendances.meeting_id = meetings.id 
                             WHERE attendances.mentee_id = mentees.id), 0
                        )
                        ELSE 0
                    END as attendance_percentage
                ')
                ->having('total_meetings', '>', 0)
                ->orderBy('attendance_percentage', 'asc')
                ->orderBy('total_present', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($mentee) {
                    return [
                        'id' => $mentee->id,
                        'full_name' => $mentee->full_name,
                        'group_name' => $mentee->group->group_name ?? 'Tidak ada kelompok',
                        'attendance_percentage' => (int) $mentee->attendance_percentage,
                        'total_present' => $mentee->total_present,
                        'total_meetings' => $mentee->total_meetings
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Least active mentees fetched successfully',
                'data' => $leastActiveMentees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch least active mentees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLeastActiveMentors()
    {
        try {
            $leastActiveMentors = DB::table('meetings')
                ->join('users', 'meetings.mentor_id', '=', 'users.id')
                ->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
                ->select(
                    'users.id',
                    DB::raw('IFNULL(profiles.full_name, SUBSTRING_INDEX(users.email, "@", 1)) as mentor_name'),
                    DB::raw('COUNT(meetings.id) as meetings_count')
                )
                ->whereNull('meetings.deleted_at')
                ->groupBy('users.id')
                ->orderBy('meetings_count', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($mentor) {
                    return [
                        'id' => $mentor->id,
                        'mentor_name' => $mentor->mentor_name,
                        'group_name' => 'Multi Kelompok',
                        'meetings_count' => (int) $mentor->meetings_count
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Least active mentors fetched successfully',
                'data' => $leastActiveMentors
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch least active mentors',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}