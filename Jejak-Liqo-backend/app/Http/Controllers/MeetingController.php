<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Group;
use App\Http\Resources\MeetingResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $query = Meeting::with(['group.mentor.profile', 'group.mentees', 'attendances.mentee']);
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('topic', 'like', "%{$search}%")
                  ->orWhere('place', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('group', function($groupQuery) use ($search) {
                      $groupQuery->where('group_name', 'like', "%{$search}%")
                                 ->orWhereHas('mentor.profile', function($mentorQuery) use ($search) {
                                     $mentorQuery->where('full_name', 'like', "%{$search}%");
                                 });
                  });
            });
        }
        
        // Filter by group
        if ($request->has('group_id') && $request->group_id) {
            $query->where('group_id', $request->group_id);
        }
        
        // Filter by meeting type
        if ($request->has('meeting_type') && $request->meeting_type) {
            $query->where('meeting_type', $request->meeting_type);
        }
        
        // Filter by date range (when report was created)
        if ($request->has('date_from') && $request->date_from) {
            $query->where('created_at', '>=', $request->date_from . ' 00:00:00');
        }
        
        if ($request->has('date_to') && $request->date_to) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }
        
        $query->orderBy('meeting_date', 'desc');
        
        $perPage = $request->get('per_page', 10);
        $meetings = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Meetings fetched successfully',
            'data' => MeetingResource::collection($meetings->items()),
            'pagination' => [
                'current_page' => $meetings->currentPage(),
                'last_page' => $meetings->lastPage(),
                'per_page' => $meetings->perPage(),
                'total' => $meetings->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'meeting_date' => 'required|date',
            'place' => 'nullable|string|max:255',
            'topic' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'meeting_type' => ['required', Rule::in(['Online', 'Offline', 'Assignment'])],
            'attendances' => 'nullable|array',
            'attendances.*.mentee_id' => 'required|exists:mentees,id',
            'attendances.*.status' => 'required|in:Hadir,Sakit,Izin,Alpa',
            'attendances.*.notes' => 'nullable|string|max:255',

        ]);

        // Get group mentor
        $group = Group::with('mentor')->findOrFail($request->group_id);
        
        if (!$group->mentor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Group must have a mentor to create meetings'
            ], 422);
        }

        // Handle photo uploads
        $photoUrls = [];
        
        if ($request->hasFile('photos')) {
            $files = $request->file('photos');
            if (is_array($files)) {
                foreach ($files as $file) {
                    if ($file->isValid()) {
                        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                        $file->move(public_path('storage/meeting_photos'), $filename);
                        $photoUrls[] = asset('storage/meeting_photos/' . $filename);
                    }
                }
            } else {
                if ($files->isValid()) {
                    $filename = time() . '_' . uniqid() . '.' . $files->getClientOriginalExtension();
                    $files->move(public_path('storage/meeting_photos'), $filename);
                    $photoUrls[] = asset('storage/meeting_photos/' . $filename);
                }
            }
        }

        $meeting = Meeting::create([
            'group_id' => $request->group_id,
            'mentor_id' => $group->mentor_id,
            'meeting_date' => $request->meeting_date,
            'place' => $request->place,
            'topic' => $request->topic,
            'notes' => $request->notes,
            'meeting_type' => $request->meeting_type,
            'photos' => $photoUrls,
        ]);

        // Create attendances if provided
        if ($request->has('attendances') && is_array($request->attendances)) {
            foreach ($request->attendances as $attendanceData) {
                \App\Models\Attendance::create([
                    'meeting_id' => $meeting->id,
                    'mentee_id' => $attendanceData['mentee_id'],
                    'status' => $attendanceData['status'],
                    'notes' => $attendanceData['notes'] ?? null,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Meeting created successfully',
            'data' => new MeetingResource($meeting->load(['group.mentor.profile', 'group.mentees', 'attendances.mentee'])),
        ], 201);
    }

    public function show(Meeting $meeting)
    {
        $meeting->load(['group.mentor.profile', 'group.mentees', 'attendances.mentee']);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting fetched successfully',
            'data' => new MeetingResource($meeting),
        ]);
    }

    public function update(Request $request, Meeting $meeting)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'meeting_date' => 'required|date',
            'place' => 'nullable|string|max:255',
            'topic' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'meeting_type' => ['required', Rule::in(['Online', 'Offline', 'Assignment'])],
            'attendances' => 'nullable|array',
            'attendances.*.mentee_id' => 'required|exists:mentees,id',
            'attendances.*.status' => 'required|in:Hadir,Sakit,Izin,Alpa',
            'attendances.*.notes' => 'nullable|string|max:255',
        ]);

        // Get group mentor
        $group = Group::with('mentor')->findOrFail($request->group_id);
        
        if (!$group->mentor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Group must have a mentor'
            ], 422);
        }

        $meeting->update([
            'group_id' => $request->group_id,
            'mentor_id' => $group->mentor_id,
            'meeting_date' => $request->meeting_date,
            'place' => $request->place,
            'topic' => $request->topic,
            'notes' => $request->notes,
            'meeting_type' => $request->meeting_type,
        ]);

        // Update attendances if provided
        if ($request->has('attendances') && is_array($request->attendances)) {
            // Delete existing attendances
            $meeting->attendances()->delete();
            
            // Create new attendances
            foreach ($request->attendances as $attendanceData) {
                \App\Models\Attendance::create([
                    'meeting_id' => $meeting->id,
                    'mentee_id' => $attendanceData['mentee_id'],
                    'status' => $attendanceData['status'],
                    'notes' => $attendanceData['notes'] ?? null,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Meeting updated successfully',
            'data' => new MeetingResource($meeting->load(['group.mentor.profile', 'group.mentees', 'attendances.mentee'])),
        ]);
    }

    public function destroy(Meeting $meeting)
    {
        $meetingTopic = $meeting->topic ?: 'Pertemuan';
        $meeting->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Catatan pertemuan '{$meetingTopic}' berhasil dihapus",
        ]);
    }

    public function trashed(Request $request)
    {
        $query = Meeting::onlyTrashed()->with(['group.mentor.profile']);
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('topic', 'like', "%{$search}%")
                  ->orWhere('place', 'like', "%{$search}%")
                  ->orWhereHas('group', function($groupQuery) use ($search) {
                      $groupQuery->where('group_name', 'like', "%{$search}%")
                                 ->orWhereHas('mentor.profile', function($mentorQuery) use ($search) {
                                     $mentorQuery->where('full_name', 'like', "%{$search}%");
                                 });
                  });
            });
        }
        
        $query->orderBy('deleted_at', 'desc');
        
        $perPage = $request->get('per_page', 10);
        $meetings = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Trashed meetings fetched successfully',
            'data' => MeetingResource::collection($meetings->items()),
            'pagination' => [
                'current_page' => $meetings->currentPage(),
                'last_page' => $meetings->lastPage(),
                'per_page' => $meetings->perPage(),
                'total' => $meetings->total(),
            ],
        ]);
    }

    public function restore($id)
    {
        $meeting = Meeting::onlyTrashed()->findOrFail($id);
        $meetingTopic = $meeting->topic ?: 'Pertemuan';
        
        $meeting->restore();

        return response()->json([
            'status' => 'success',
            'message' => "Catatan pertemuan '{$meetingTopic}' berhasil dipulihkan",
        ]);
    }

    public function forceDelete($id)
    {
        $meeting = Meeting::onlyTrashed()->findOrFail($id);
        $meetingTopic = $meeting->topic ?: 'Pertemuan';
        
        $meeting->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => "Catatan pertemuan '{$meetingTopic}' berhasil dihapus permanen",
        ]);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:meetings,id',
        ]);

        $meetings = Meeting::onlyTrashed()->whereIn('id', $request->ids)->get();
        
        if ($meetings->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada pertemuan yang ditemukan untuk dipulihkan',
            ], 404);
        }

        foreach ($meetings as $meeting) {
            $meeting->restore();
        }

        return response()->json([
            'status' => 'success',
            'message' => count($request->ids) . ' catatan pertemuan berhasil dipulihkan',
        ]);
    }

    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:meetings,id',
        ]);

        $meetings = Meeting::onlyTrashed()->whereIn('id', $request->ids)->get();
        
        if ($meetings->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada pertemuan yang ditemukan untuk dihapus',
            ], 404);
        }

        foreach ($meetings as $meeting) {
            $meeting->forceDelete();
        }

        return response()->json([
            'status' => 'success',
            'message' => count($request->ids) . ' catatan pertemuan berhasil dihapus permanen',
        ]);
    }

    public function statistics()
    {
        // Total meetings in current year
        $totalMeetings = Meeting::whereYear('meeting_date', now()->year)->count();
        $onlineMeetings = Meeting::where('meeting_type', 'Online')
                                ->whereYear('meeting_date', now()->year)
                                ->count();
        $offlineMeetings = Meeting::where('meeting_type', 'Offline')
                                 ->whereYear('meeting_date', now()->year)
                                 ->count();
        $assignmentMeetings = Meeting::where('meeting_type', 'Assignment')
                                    ->whereYear('meeting_date', now()->year)
                                    ->count();
        
        // This week (Monday to Sunday) - based on when the report was created
        $startOfWeek = now()->startOfWeek(); // Monday
        $endOfWeek = now()->endOfWeek(); // Sunday
        
        $thisWeek = Meeting::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                          ->count();

        return response()->json([
            'status' => 'success',
            'message' => 'Meeting statistics fetched successfully',
            'data' => [
                'total_meetings' => $totalMeetings,
                'online_meetings' => $onlineMeetings,
                'offline_meetings' => $offlineMeetings,
                'assignment_meetings' => $assignmentMeetings,
                'this_week' => $thisWeek,
                'week_start' => $startOfWeek->format('Y-m-d'),
                'week_end' => $endOfWeek->format('Y-m-d'),
            ],
        ]);
    }

    public function getGroups()
    {
        $groups = Group::with('mentor.profile')
                      ->whereNotNull('mentor_id')
                      ->get()
                      ->map(function ($group) {
                          return [
                              'id' => $group->id,
                              'name' => $group->group_name,
                              'mentor' => $group->mentor->profile->full_name ?? $group->mentor->email,
                          ];
                      });

        return response()->json([
            'status' => 'success',
            'data' => $groups,
        ]);
    }
}