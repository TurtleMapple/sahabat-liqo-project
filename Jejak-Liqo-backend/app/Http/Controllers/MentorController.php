<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class MentorController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'mentor')
            ->with(['profile', 'groups', 'groups.mentees']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('profile', function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('nickname', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            })->orWhere('email', 'like', "%{$search}%");
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->whereHas('profile', function($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        // Filter by gender
        if ($request->has('gender') && $request->gender) {
            $query->whereHas('profile', function($q) use ($request) {
                $q->where('gender', $request->gender);
            });
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $mentors = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentors fetched successfully',
            'data' => $mentors->map(function($mentor) {
                return [
                    'id' => $mentor->id,
                    'email' => $mentor->email,
                    'role' => $mentor->role,
                    'blocked_at' => $mentor->blocked_at,
                    'profile' => $mentor->profile ? [
                        'id' => $mentor->profile->id,
                        'full_name' => $mentor->profile->full_name,
                        'gender' => $mentor->profile->gender,
                        'nickname' => $mentor->profile->nickname,
                        'birth_date' => $mentor->profile->birth_date,
                        'phone_number' => $mentor->profile->phone_number,
                        'hobby' => $mentor->profile->hobby,
                        'address' => $mentor->profile->address,
                        'job' => $mentor->profile->job,
                        'profile_picture' => $mentor->profile->profile_picture,
                        'status' => $mentor->profile->status,
                        'status_note' => $mentor->profile->status_note,
                    ] : null,
                    'groups_count' => $mentor->groups->count(),
                    'mentees_count' => $mentor->groups->sum(function($group) {
                        return $group->mentees->count();
                    }),
                    'created_at' => $mentor->created_at,
                    'updated_at' => $mentor->updated_at,
                ];
            }),
            'pagination' => [
                'current_page' => $mentors->currentPage(),
                'last_page' => $mentors->lastPage(),
                'per_page' => $mentors->perPage(),
                'total' => $mentors->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'full_name' => 'required|string|max:255',
            'gender' => 'nullable|in:Ikhwan,Akhwat',
            'nickname' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:255',
            'hobby' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'job' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'nullable|in:Aktif,Non-Aktif',
        ]);

        // Create user
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'mentor',
        ]);

        // Handle profile picture upload
        $profilePicturePath = null;
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $extension = $file->getClientOriginalExtension();
            $emailPrefix = str_replace(['@', '.'], '_', $request->email);
            $fileName = 'mentor_' . $emailPrefix . '_' . time() . '.' . $extension;
            $profilePicturePath = $file->storeAs('profile_pictures', $fileName, 'public');
        }

        // Create profile
        $profile = Profile::create([
            'user_id' => $user->id,
            'full_name' => $request->full_name,
            'gender' => $request->gender,
            'nickname' => $request->nickname,
            'birth_date' => $request->birth_date,
            'phone_number' => $request->phone_number,
            'hobby' => $request->hobby,
            'address' => $request->address,
            'job' => $request->job,
            'profile_picture' => $profilePicturePath,
            'status' => $request->status ?? 'Aktif',
        ]);

        $user->load('profile');

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor created successfully',
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
                'profile' => $profile,
            ],
        ], 201);
    }

    public function show(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        $mentor->load(['profile', 'groups.mentees']);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor fetched successfully',
            'data' => [
                'id' => $mentor->id,
                'email' => $mentor->email,
                'role' => $mentor->role,
                'blocked_at' => $mentor->blocked_at,
                'profile' => $mentor->profile,
                'groups' => $mentor->groups->map(function($group) {
                    return [
                        'id' => $group->id,
                        'group_name' => $group->group_name,
                        'description' => $group->description,
                        'mentees_count' => $group->mentees->count(),
                    ];
                }),
                'created_at' => $mentor->created_at,
                'updated_at' => $mentor->updated_at,
            ],
        ]);
    }

    public function update(Request $request, User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $mentor->id,
            'password' => 'nullable|min:6',
            'full_name' => 'required|string|max:255',
            'gender' => 'nullable|in:Ikhwan,Akhwat',
            'nickname' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:255',
            'hobby' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'job' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'nullable|in:Aktif,Non-Aktif',
            'status_note' => 'nullable|string',
        ]);

        // Update user
        $mentor->update([
            'email' => $request->email,
        ]);

        if ($request->password) {
            $mentor->update([
                'password' => Hash::make($request->password),
            ]);
        }

        // Handle profile picture upload
        $profileData = [
            'full_name' => $request->full_name,
            'gender' => $request->gender,
            'nickname' => $request->nickname,
            'birth_date' => $request->birth_date,
            'phone_number' => $request->phone_number,
            'hobby' => $request->hobby,
            'address' => $request->address,
            'job' => $request->job,
            'status' => $request->status ?? 'Aktif',
            'status_note' => $request->status_note,
        ];

        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($mentor->profile && $mentor->profile->profile_picture) {
                Storage::disk('public')->delete($mentor->profile->profile_picture);
            }
            
            $file = $request->file('profile_picture');
            $extension = $file->getClientOriginalExtension();
            $emailPrefix = str_replace(['@', '.'], '_', $request->email);
            $fileName = 'mentor_' . $emailPrefix . '_' . time() . '.' . $extension;
            $profileData['profile_picture'] = $file->storeAs('profile_pictures', $fileName, 'public');
        }

        // Update or create profile
        $mentor->profile()->updateOrCreate(
            ['user_id' => $mentor->id],
            $profileData
        );

        $mentor->load('profile');

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor updated successfully',
            'data' => [
                'id' => $mentor->id,
                'email' => $mentor->email,
                'profile' => $mentor->profile,
            ],
        ]);
    }

    public function destroy(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        $mentor->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor deleted successfully',
        ]);
    }

    // Get mentor statistics
    public function stats()
    {
        // Total mentors
        $totalMentors = User::where('role', 'mentor')->count();
        $activeMentors = User::where('role', 'mentor')
            ->whereNull('blocked_at')  // Tidak diblokir
            ->whereHas('profile', function($q) {
                $q->where('status', 'Aktif');
            })->count();
        $inactiveMentors = User::where('role', 'mentor')
            ->whereNull('blocked_at')  // Tidak diblokir
            ->whereHas('profile', function($q) {
                $q->where('status', 'Non-Aktif');
            })->count();
        $blockedMentors = User::where('role', 'mentor')
            ->whereNotNull('blocked_at')->count();

        // Mentor Ikhwan breakdown
        $totalIkhwan = User::where('role', 'mentor')
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Ikhwan');
            })->count();
        $activeIkhwan = User::where('role', 'mentor')
            ->whereNull('blocked_at')  // Tidak diblokir
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Ikhwan')->where('status', 'Aktif');
            })->count();
        $inactiveIkhwan = User::where('role', 'mentor')
            ->whereNull('blocked_at')  // Tidak diblokir
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Ikhwan')->where('status', 'Non-Aktif');
            })->count();
        $blockedIkhwan = User::where('role', 'mentor')
            ->whereNotNull('blocked_at')
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Ikhwan');
            })->count();

        // Mentor Akhwat breakdown
        $totalAkhwat = User::where('role', 'mentor')
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Akhwat');
            })->count();
        $activeAkhwat = User::where('role', 'mentor')
            ->whereNull('blocked_at')  // Tidak diblokir
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Akhwat')->where('status', 'Aktif');
            })->count();
        $inactiveAkhwat = User::where('role', 'mentor')
            ->whereNull('blocked_at')  // Tidak diblokir
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Akhwat')->where('status', 'Non-Aktif');
            })->count();
        $blockedAkhwat = User::where('role', 'mentor')
            ->whereNotNull('blocked_at')
            ->whereHas('profile', function($q) {
                $q->where('gender', 'Akhwat');
            })->count();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor statistics fetched successfully',
            'data' => [
                // Overall mentor stats
                'total_mentors' => $totalMentors,
                'active_mentors' => $activeMentors,
                'inactive_mentors' => $inactiveMentors,
                'blocked_mentors' => $blockedMentors,
                
                // Ikhwan mentor stats
                'total_ikhwan' => $totalIkhwan,
                'active_ikhwan' => $activeIkhwan,
                'inactive_ikhwan' => $inactiveIkhwan,
                'blocked_ikhwan' => $blockedIkhwan,
                
                // Akhwat mentor stats
                'total_akhwat' => $totalAkhwat,
                'active_akhwat' => $activeAkhwat,
                'inactive_akhwat' => $inactiveAkhwat,
                'blocked_akhwat' => $blockedAkhwat,
            ],
        ]);
    }

    // Block mentor
    public function block(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        $mentor->update([
            'blocked_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor blocked successfully',
            'data' => [
                'id' => $mentor->id,
                'email' => $mentor->email,
                'blocked_at' => $mentor->blocked_at,
            ],
        ]);
    }

    // Unblock mentor
    public function unblock(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        $mentor->update([
            'blocked_at' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor unblocked successfully',
            'data' => [
                'id' => $mentor->id,
                'email' => $mentor->email,
                'blocked_at' => $mentor->blocked_at,
            ],
        ]);
    }

    // Get trashed mentors
    public function trashed()
    {
        $trashedMentors = User::where('role', 'mentor')
            ->onlyTrashed()
            ->with(['profile'])
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'message' => 'Trashed mentors fetched successfully',
            'data' => $trashedMentors->map(function($mentor) {
                return [
                    'id' => $mentor->id,
                    'email' => $mentor->email,
                    'role' => $mentor->role,
                    'blocked_at' => $mentor->blocked_at,
                    'deleted_at' => $mentor->deleted_at,
                    'profile' => $mentor->profile ? [
                        'full_name' => $mentor->profile->full_name,
                        'gender' => $mentor->profile->gender,
                        'nickname' => $mentor->profile->nickname,
                        'phone_number' => $mentor->profile->phone_number,
                        'profile_picture' => $mentor->profile->profile_picture,
                        'status' => $mentor->profile->status,
                    ] : null,
                    'created_at' => $mentor->created_at,
                ];
            }),
            'pagination' => [
                'current_page' => $trashedMentors->currentPage(),
                'last_page' => $trashedMentors->lastPage(),
                'per_page' => $trashedMentors->perPage(),
                'total' => $trashedMentors->total(),
            ],
        ]);
    }

    // Restore soft deleted mentor
    public function restore($id)
    {
        $mentor = User::where('role', 'mentor')
            ->onlyTrashed()
            ->findOrFail($id);
        
        $mentor->restore();
        $mentor->load('profile');

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor restored successfully',
            'data' => [
                'id' => $mentor->id,
                'email' => $mentor->email,
                'profile' => $mentor->profile,
            ],
        ]);
    }

    // Get info before force delete
    public function forceDeleteInfo($id)
    {
        $mentor = User::where('role', 'mentor')
            ->onlyTrashed()
            ->with(['profile', 'groups.mentees'])
            ->findOrFail($id);
        
        $hasGroups = $mentor->groups && $mentor->groups->count() > 0;
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'mentor' => [
                    'id' => $mentor->id,
                    'email' => $mentor->email,
                    'full_name' => $mentor->profile->full_name ?? 'No profile',
                ],
                'has_groups' => $hasGroups,
                'groups' => $hasGroups ? $mentor->groups->map(function($group) {
                    return [
                        'id' => $group->id,
                        'group_name' => $group->group_name,
                        'mentees_count' => $group->mentees->count(),
                    ];
                }) : [],
                'warning_message' => $hasGroups ? 
                    'Mentor ini mengelola ' . $mentor->groups->count() . ' grup. Jika dihapus, grup akan tetap ada tapi tanpa mentor.' : 
                    'Mentor ini tidak mengelola grup apapun.',
            ],
        ]);
    }

    // Force delete (permanent delete)
    public function forceDelete($id)
    {
        $mentor = User::where('role', 'mentor')
            ->onlyTrashed()
            ->with(['profile', 'groups', 'announcements', 'loginAttempts'])
            ->findOrFail($id);
        
        // Check if mentor has groups assigned - return warning info
        $hasGroups = $mentor->groups && $mentor->groups->count() > 0;
        $groupInfo = [];
        
        if ($hasGroups) {
            $groupInfo = $mentor->groups->map(function($group) {
                return [
                    'id' => $group->id,
                    'group_name' => $group->group_name,
                    'mentees_count' => $group->mentees()->count(),
                ];
            });
        }
        
        try {
            // Set mentor_id to null for all groups (groups remain, but without mentor)
            if ($hasGroups) {
                $mentor->groups()->update(['mentor_id' => null]);
            }
            
            // Delete related data
            if ($mentor->profile) {
                $mentor->profile->forceDelete();
            }
            
            // Delete announcements
            $mentor->announcements()->forceDelete();
            
            // Delete login attempts
            $mentor->loginAttempts()->delete();
            
            // Delete all tokens
            $mentor->tokens()->delete();
            
            // Finally delete the user
            $mentor->forceDelete();

            return response()->json([
                'status' => 'success',
                'message' => 'Mentor permanently deleted',
                'affected_groups' => $groupInfo,
                'warning' => $hasGroups ? 'Groups are now without mentor. Please assign new mentors.' : null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete mentor: ' . $e->getMessage(),
            ], 500);
        }
    }
}