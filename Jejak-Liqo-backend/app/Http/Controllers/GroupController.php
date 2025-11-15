<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use App\Models\GroupMentorHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $query = Group::with(['mentor.profile', 'mentees', 'meetings']);
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('group_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('mentor.profile', function($mentorQuery) use ($search) {
                      $mentorQuery->where('full_name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Filter by group type
        if ($request->has('group_type') && $request->group_type) {
            $groupType = $request->group_type;
            if ($groupType === 'ikhwan') {
                $query->whereHas('mentor.profile', function($q) {
                    $q->where('gender', 'Ikhwan');
                });
            } elseif ($groupType === 'akhwat') {
                $query->whereHas('mentor.profile', function($q) {
                    $q->where('gender', 'Akhwat');
                });
            }
        }
        
        $perPage = $request->get('per_page', 10);
        $groups = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Groups fetched successfully',
            'data' => GroupResource::collection($groups->items()),
            'pagination' => [
                'current_page' => $groups->currentPage(),
                'last_page' => $groups->lastPage(),
                'per_page' => $groups->perPage(),
                'total' => $groups->total(),
            ],
        ]);
    }

    public function statistics()
    {
        $totalGroups = Group::count();
        
        $ikhwanGroups = Group::whereHas('mentor.profile', function ($query) {
            $query->where('gender', 'Ikhwan');
        })->count();
        
        $akhwatGroups = Group::whereHas('mentor.profile', function ($query) {
            $query->where('gender', 'Akhwat');
        })->count();

        return response()->json([
            'status' => 'success',
            'message' => 'Group statistics fetched successfully',
            'data' => [
                'total_groups' => $totalGroups,
                'ikhwan_groups' => $ikhwanGroups,
                'akhwat_groups' => $akhwatGroups,
            ],
        ]);
    }

    public function getAvailableMentors()
    {
        $mentors = User::where('role', 'mentor')
            ->with('profile')
            ->get()
            ->filter(function ($mentor) {
                return $mentor->profile && $mentor->profile->full_name && $mentor->profile->gender;
            })
            ->map(function ($mentor) {
                return [
                    'id' => $mentor->id,
                    'name' => $mentor->profile->full_name,
                    'gender' => $mentor->profile->gender,
                ];
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => $mentors,
        ]);
    }

    public function getMentorGender($mentorId)
    {
        $mentor = User::where('role', 'mentor')
            ->with('profile')
            ->find($mentorId);
        
        if (!$mentor || !$mentor->profile || !$mentor->profile->full_name || !$mentor->profile->gender) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mentor not found or profile incomplete'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'mentor_id' => $mentor->id,
                'mentor_name' => $mentor->profile->full_name,
                'gender' => $mentor->profile->gender
            ]
        ]);
    }

    public function getAvailableMentees(Request $request)
    {
        // Jika mentor_id diberikan, filter berdasarkan gender mentor
        if ($request->has('mentor_id') && $request->mentor_id) {
            $mentor = User::where('role', 'mentor')
                ->with('profile')
                ->find($request->mentor_id);
                
            if (!$mentor || !$mentor->profile || !$mentor->profile->gender) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Mentor not found or gender not available',
                    'data' => []
                ], 400);
            }
            
            $mentorGender = $mentor->profile->gender;

            // Get mentees with same gender as mentor
            $mentees = \App\Models\Mentee::where('gender', $mentorGender)
                ->select('id', 'full_name', 'gender', 'activity_class', 'group_id')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $mentees,
                'mentor_gender' => $mentorGender
            ]);
        }

        // Jika tidak ada mentor_id, return semua mentees
        $mentees = \App\Models\Mentee::select('id', 'full_name', 'gender', 'activity_class', 'group_id')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $mentees
        ]);
    }

    public function store(GroupRequest $request)
    {
        $group = Group::create($request->validated());
        
        // Assign mentees if provided
        if ($request->has('mentee_ids') && is_array($request->mentee_ids) && count($request->mentee_ids) > 0) {
            // Update ALL selected mentees (including those with existing groups)
            $updatedCount = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
                ->update(['group_id' => $group->id]);
                
            // Log mentees that were moved from other groups
            $movedMentees = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
                ->whereNotNull('group_id')
                ->where('group_id', '!=', $group->id)
                ->get();
                
            if ($movedMentees->count() > 0) {
                Log::info('Mentees moved to new group', [
                    'group_id' => $group->id,
                    'moved_mentees' => $movedMentees->pluck('full_name', 'id')->toArray()
                ]);
            }
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Group created successfully',
            'data' => new GroupResource($group->load('mentor.profile', 'mentees')),
        ], 201);
    }

    public function show(Group $group)
    {
        $group->load(['mentor.profile', 'mentees', 'meetings']);
        return response()->json([
            'status' => 'success',
            'message' => 'Group fetched successfully',
            'data' => new GroupResource($group),
        ]);
    }

    public function update(GroupRequest $request, Group $group)
    {
        $oldMentorId = $group->mentor_id;
        $group->update($request->validated());

        // Handle mentees update if provided
        if ($request->has('mentee_ids')) {
            // Remove all current mentees from group
            \App\Models\Mentee::where('group_id', $group->id)
                ->update(['group_id' => null]);
            
            // Add new mentees if any provided
            if (is_array($request->mentee_ids) && count($request->mentee_ids) > 0) {
                \App\Models\Mentee::whereIn('id', $request->mentee_ids)
                    ->update(['group_id' => $group->id]);
            }
        }

        if ($request->mentor_id != $oldMentorId) {
            GroupMentorHistory::create([
                'group_id' => $group->id,
                'from_mentor_id' => $oldMentorId,
                'to_mentor_id' => $request->mentor_id,
                'changed_by' => Auth::id(),
            ]);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Group updated successfully',
            'data' => new GroupResource($group->load('mentor.profile', 'mentees')),
        ]);
    }

    public function destroy(Group $group)
    {
        // Get group info for logging
        $groupName = $group->group_name;
        $menteeCount = $group->mentees()->count();
        
        // Soft delete the group (mentees tetap terhubung)
        $group->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => "Kelompok '{$groupName}' berhasil dihapus sementara. {$menteeCount} mentee akan ikut tersembunyi.",
        ]);
    }
    
    // Get trashed groups
    public function trashed(Request $request)
    {
        $query = Group::onlyTrashed()->with(['mentor.profile', 'mentees', 'meetings']);
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('group_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('mentor.profile', function($mentorQuery) use ($search) {
                      $mentorQuery->where('full_name', 'like', "%{$search}%");
                  });
            });
        }
        
        $perPage = $request->get('per_page', 10);
        $groups = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Trashed groups fetched successfully',
            'data' => GroupResource::collection($groups->items()),
            'pagination' => [
                'current_page' => $groups->currentPage(),
                'last_page' => $groups->lastPage(),
                'per_page' => $groups->perPage(),
                'total' => $groups->total(),
            ],
        ]);
    }
    
    // Restore trashed group
    public function restore($id)
    {
        $group = Group::onlyTrashed()->withCount('mentees')->findOrFail($id);
        $group->restore();
        
        return response()->json([
            'status' => 'success',
            'message' => "Kelompok '{$group->group_name}' berhasil dipulihkan dengan {$group->mentees_count} mentee.",
        ]);
    }
    
    // Force delete group permanently
    public function forceDelete($id)
    {
        $group = Group::onlyTrashed()->findOrFail($id);
        $groupName = $group->group_name;
        $menteeCount = $group->mentees()->count();
        
        // Remove all mentees from group before permanent deletion
        \App\Models\Mentee::where('group_id', $group->id)
            ->update(['group_id' => null]);
        
        // Force delete the group permanently
        $group->forceDelete();
        
        return response()->json([
            'status' => 'success',
            'message' => "Kelompok '{$groupName}' berhasil dihapus permanen. {$menteeCount} mentee telah dilepas dari kelompok.",
        ]);
    }

    // Get mentees in specific group
    public function getGroupMentees(Group $group)
    {
        $mentees = $group->mentees()->select('id', 'full_name', 'gender', 'activity_class')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $mentees,
        ]);
    }

    // Add existing mentees to group (by IDs) - SECURE VERSION
    public function addMenteesToGroup(Request $request, Group $group)
    {
        $request->validate([
            'mentee_ids' => 'required|array|min:1',
            'mentee_ids.*' => 'exists:mentees,id',
        ]);

        // Validate mentor exists and has gender
        if (!$group->mentor_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Group must have a mentor before adding mentees'
            ], 422);
        }

        $mentor = User::with('profile')->find($group->mentor_id);
        if (!$mentor || !$mentor->profile || !$mentor->profile->gender) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mentor profile incomplete'
            ], 422);
        }

        $mentorGender = $mentor->profile->gender;

        // Get mentees and validate
        $mentees = \App\Models\Mentee::whereIn('id', $request->mentee_ids)->get();
        
        foreach ($mentees as $mentee) {
            // Check if mentee already has a group
            if ($mentee->group_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Mentee {$mentee->full_name} already belongs to another group"
                ], 422);
            }
            
            // Check gender compatibility
            if ($mentee->gender !== $mentorGender) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Mentee {$mentee->full_name} has different gender than mentor"
                ], 422);
            }
        }

        // Update mentees group_id
        $updatedCount = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
            ->whereNull('group_id')
            ->update(['group_id' => $group->id]);

        return response()->json([
            'status' => 'success',
            'message' => "Successfully added {$updatedCount} mentees to group",
            'updated_count' => $updatedCount,
        ]);
    }

    // Remove mentees from group (set group_id to null) - SECURE VERSION
    public function removeMenteesFromGroup(Request $request, Group $group)
    {
        $request->validate([
            'mentee_ids' => 'required|array|min:1',
            'mentee_ids.*' => 'exists:mentees,id',
        ]);

        // Validate mentees belong to this group
        $mentees = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
            ->where('group_id', $group->id)
            ->get();

        if ($mentees->count() !== count($request->mentee_ids)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Some mentees do not belong to this group'
            ], 422);
        }

        // Remove from group (set group_id to null)
        $updatedCount = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
            ->where('group_id', $group->id)
            ->update(['group_id' => null]);

        return response()->json([
            'status' => 'success',
            'message' => "Successfully removed {$updatedCount} mentees from group",
            'updated_count' => $updatedCount,
        ]);
    }

    // Add mentees to group (CREATE NEW) - LEGACY METHOD
    public function addMentees(Request $request, Group $group)
    {
        $request->validate([
            'mentees' => 'required|array|min:1',
            'mentees.*.full_name' => 'required|string|max:255',
            'mentees.*.gender' => 'required|in:Ikhwan,Akhwat',
            'mentees.*.nickname' => 'nullable|string|max:255',
            'mentees.*.birth_date' => 'nullable|date',
            'mentees.*.phone_number' => 'nullable|string|max:255',
            'mentees.*.activity_class' => 'nullable|string|max:255',
            'mentees.*.hobby' => 'nullable|string|max:255',
            'mentees.*.address' => 'nullable|string',
            'mentees.*.status' => 'nullable|in:Aktif,Non-Aktif',
        ]);

        // Validate gender consistency with mentor
        $group->load('mentor.profile');
        $mentorGender = $group->mentor->profile->gender ?? null;
        
        if ($mentorGender) {
            foreach ($request->mentees as $menteeData) {
                if ($menteeData['gender'] !== $mentorGender) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'All mentees must have the same gender as the mentor (' . $mentorGender . ')'
                    ], 422);
                }
            }
        }

        $createdMentees = [];
        foreach ($request->mentees as $menteeData) {
            $menteeData['group_id'] = $group->id;
            $createdMentees[] = $group->mentees()->create($menteeData);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully added ' . count($createdMentees) . ' mentees to group',
            'data' => $createdMentees,
            'created_count' => count($createdMentees),
        ], 201);
    }

    // Remove mentees from group (DELETE) - LEGACY METHOD
    public function removeMentees(Request $request, Group $group)
    {
        $request->validate([
            'mentee_ids' => 'required|array|min:1',
            'mentee_ids.*' => 'exists:mentees,id',
        ]);

        $deletedCount = $group->mentees()->whereIn('id', $request->mentee_ids)->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Successfully removed {$deletedCount} mentees from group",
            'deleted_count' => $deletedCount,
        ]);
    }

    // Move mentees between groups
    public function moveMentees(Request $request, Group $group)
    {
        $request->validate([
            'mentee_ids' => 'required|array|min:1',
            'mentee_ids.*' => 'exists:mentees,id',
            'target_group_id' => 'required|exists:groups,id',
        ]);

        $updatedCount = $group->mentees()
            ->whereIn('id', $request->mentee_ids)
            ->update(['group_id' => $request->target_group_id]);

        return response()->json([
            'status' => 'success',
            'message' => "Successfully moved {$updatedCount} mentees to another group",
            'moved_count' => $updatedCount,
        ]);
    }

    // Get all mentees for group form (including those with existing groups)
    public function getMenteesForForm(Request $request)
    {
        $query = \App\Models\Mentee::select('id', 'full_name', 'gender', 'activity_class', 'group_id');
        
        // Filter by gender if provided
        if ($request->has('gender') && $request->gender) {
            $query->where('gender', $request->gender);
        }
        
        $mentees = $query->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Mentees for form fetched successfully',
            'data' => $mentees
        ]);
    }

    // Get mentors for edit group (filtered by group gender + current mentor)
    public function getMentorsForEdit(Group $group)
    {
        $group->load('mentor.profile');
        $groupGender = $group->mentor->profile->gender ?? null;
        
        if (!$groupGender) {
            return response()->json([
                'status' => 'error',
                'message' => 'Group mentor gender not found'
            ], 400);
        }
        
        $mentors = User::where('role', 'mentor')
            ->with('profile')
            ->whereHas('profile', function($q) use ($groupGender) {
                $q->where('gender', $groupGender)
                  ->whereNotNull('full_name');
            })
            ->get()
            ->map(function ($mentor) {
                return [
                    'id' => $mentor->id,
                    'name' => $mentor->profile->full_name,
                    'gender' => $mentor->profile->gender,
                ];
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => $mentors,
            'group_gender' => $groupGender
        ]);
    }
    
    // Get mentees for edit group (filtered by group gender)
    public function getMenteesForEdit(Group $group)
    {
        $group->load('mentor.profile');
        $groupGender = $group->mentor->profile->gender ?? null;
        
        if (!$groupGender) {
            return response()->json([
                'status' => 'error',
                'message' => 'Group mentor gender not found'
            ], 400);
        }
        
        $mentees = \App\Models\Mentee::where('gender', $groupGender)
            ->select('id', 'full_name', 'gender', 'activity_class', 'group_id')
            ->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Mentees for edit group fetched successfully',
            'data' => $mentees,
            'group_gender' => $groupGender
        ]);
    }

    // Debug method to check data availability
    public function debugData()
    {
        $totalUsers = User::count();
        $totalMentors = User::where('role', 'mentor')->count();
        $mentorsWithProfile = User::where('role', 'mentor')
            ->whereHas('profile')
            ->count();
        $mentorsWithCompleteProfile = User::where('role', 'mentor')
            ->whereHas('profile', function($q) {
                $q->whereNotNull('full_name')
                  ->whereNotNull('gender');
            })
            ->count();
        $totalMentees = \App\Models\Mentee::count();
        $menteesWithoutGroup = \App\Models\Mentee::whereNull('group_id')->count();
        
        return response()->json([
            'status' => 'success',
            'debug_data' => [
                'total_users' => $totalUsers,
                'total_mentors' => $totalMentors,
                'mentors_with_profile' => $mentorsWithProfile,
                'mentors_with_complete_profile' => $mentorsWithCompleteProfile,
                'total_mentees' => $totalMentees,
                'mentees_without_group' => $menteesWithoutGroup,
            ]
        ]);
    }
}