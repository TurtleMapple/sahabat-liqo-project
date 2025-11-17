<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MentorController extends Controller
{
    /**
     * Index mentors - Digunakan oleh role: admin
     */
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

    /**
     * Store mentor - Digunakan oleh role: admin
     */
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

    /**
     * Show mentor - Digunakan oleh role: admin
     */
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

    /**
     * Update mentor - Digunakan oleh role: admin
     */
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

    /**
     * Delete mentor - Digunakan oleh role: admin
     */
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

    /**
     * Get mentor statistics - Digunakan oleh role: admin
     */
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

    /**
     * Block mentor - Digunakan oleh role: admin
     */
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

    /**
     * Unblock mentor - Digunakan oleh role: admin
     */
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

    /**
     * Get trashed mentors - Digunakan oleh role: admin
     */
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

    /**
     * Restore soft deleted mentor - Digunakan oleh role: admin
     */
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

    /**
     * Get info before force delete - Digunakan oleh role: admin
     */
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

    /**
     * Force delete (permanent delete) - Digunakan oleh role: admin
     */
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

    /**
     * Daftar kelompok mentor - Digunakan oleh role: mentor
     */
    public function getGroups()
    {
        try {
            $mentorId = Auth::id();
            
            $groups = \App\Models\Group::with(['mentor.profile'])
                ->where('mentor_id', $mentorId)
                ->whereNull('deleted_at')
                ->orderBy('created_at', 'desc')
                ->get();

            // Add category based on mentor's gender
            $groups->each(function ($group) {
                if ($group->mentor && $group->mentor->profile) {
                    $group->category = strtolower($group->mentor->profile->gender) === 'akhwat' ? 'akhwat' : 'ikhwan';
                }
            });

            return response()->json([
                'status' => 'success',
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data kelompok'
            ], 500);
        }
    }

    /**
     * Detail kelompok - Digunakan oleh role: mentor
     */
    public function getGroupDetail($groupId)
    {
        try {
            $mentorId = Auth::id();
            
            $group = \App\Models\Group::with([
                'mentor.profile', 
                'mentees' => function($query) {
                    $query->where('status', 'Aktif');
                }
            ])
                ->where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            // Add category based on mentor's gender
            if ($group->mentor && $group->mentor->profile) {
                $group->category = strtolower($group->mentor->profile->gender) === 'akhwat' ? 'akhwat' : 'ikhwan';
            }

            // Add meetings count from database
            $group->meetings_count = \App\Models\Meeting::where('group_id', $groupId)->count();

            return response()->json([
                'status' => 'success',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail kelompok'
            ], 500);
        }
    }

    /**
     * Statistik dashboard - Digunakan oleh role: mentor
     */
    public function getDashboardStats()
    {
        try {
            $mentorId = Auth::id();
            
            // Get total groups for this mentor
            $totalGroups = \App\Models\Group::where('mentor_id', $mentorId)->count();
            
            // Get total mentees in mentor's groups
            $totalMentees = \App\Models\Group::where('mentor_id', $mentorId)
                ->withCount('mentees')
                ->get()
                ->sum('mentees_count');
            
            // Get monthly activities (meetings this month)
            $monthlyActivities = \App\Models\Meeting::whereHas('group', function($query) use ($mentorId) {
                $query->where('mentor_id', $mentorId);
            })
            ->whereMonth('meeting_date', now()->month)
            ->whereYear('meeting_date', now()->year)
            ->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'totalGroups' => $totalGroups,
                    'totalMentees' => $totalMentees,
                    'monthlyActivities' => $monthlyActivities
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil statistik dashboard'
            ], 500);
        }
    }

    /**
     * Buat kelompok baru - Digunakan oleh role: mentor
     */
    public function createGroup(Request $request)
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        try {
            $mentorId = Auth::id();
            $mentor = User::with('profile')->find($mentorId);
            
            if (!$mentor || !$mentor->profile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $group = \App\Models\Group::create([
                'group_name' => $request->group_name,
                'description' => $request->description,
                'mentor_id' => $mentorId
            ]);

            // Reload group with mentor data and add category based on gender
            $group = $group->fresh(['mentor.profile']);
            $group->category = strtolower($mentor->profile->gender) === 'akhwat' ? 'akhwat' : 'ikhwan';

            return response()->json([
                'status' => 'success',
                'message' => 'Kelompok berhasil dibuat',
                'data' => $group
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat kelompok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tambah mentee baru - Digunakan oleh role: mentor
     */
    public function addMentees(Request $request, $groupId)
    {
        $request->validate([
            'mentees' => 'required|array',
            'mentees.*.full_name' => 'required|string|max:255',
            'mentees.*.gender' => 'required|string',
        ]);

        try {
            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            $results = [];
            foreach ($request->mentees as $menteeData) {
                // Map status values
                $status = 'Aktif';
                if (isset($menteeData['status'])) {
                    $status = $menteeData['status'] === 'active' ? 'Aktif' : 'Non-Aktif';
                }

                $mentee = \App\Models\Mentee::create([
                    'full_name' => $menteeData['full_name'],
                    'nickname' => $menteeData['nickname'] ?? null,
                    'gender' => $menteeData['gender'],
                    'phone_number' => $menteeData['phone_number'] ?? null,
                    'birth_date' => $menteeData['birth_date'] ?? null,
                    'activity_class' => $menteeData['class'] ?? null,
                    'hobby' => $menteeData['hobby'] ?? null,
                    'address' => $menteeData['address'] ?? null,
                    'status' => $status,
                    'group_id' => $groupId,
                ]);
                $results[] = $mentee;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Mentee berhasil ditambahkan',
                'data' => $results
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan mentee',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * Tambah mentee existing - Digunakan oleh role: mentor
     */
    public function addExistingMenteesToGroup(Request $request, $groupId)
    {
        try {
            $request->validate([
                'mentee_ids' => 'required|array',
                'mentee_ids.*' => 'integer|exists:mentees,id'
            ]);

            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            // Only add mentees that don't have a group (available mentees)
            $updated = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
                ->whereNull('group_id')
                ->update(['group_id' => $groupId]);

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil menambahkan {$updated} mentee ke kelompok",
                'data' => [
                    'updated_count' => $updated,
                    'group_id' => $groupId
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan mentee ke kelompok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pindah mentee antar kelompok - Digunakan oleh role: mentor
     */
    public function moveMentees(Request $request, $groupId)
    {
        try {
            $request->validate([
                'mentee_ids' => 'required|array',
                'mentee_ids.*' => 'integer|exists:mentees,id'
            ]);

            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            // Move mentees from other groups to this group
            $updated = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
                ->whereNotNull('group_id')
                ->update(['group_id' => $groupId]);

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil memindahkan {$updated} mentee ke kelompok",
                'data' => [
                    'updated_count' => $updated,
                    'group_id' => $groupId
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memindahkan mentee ke kelompok',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    // ============================================
    // METHOD UNTUK ROLE MENTOR
    // ============================================

    /**
     * Ambil profile mentor - Digunakan oleh role: mentor
     */
    public function getProfile()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak ditemukan'
                ], 404);
            }
            
            $user->load('profile');
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile' => $user->profile ? [
                        'full_name' => $user->profile->full_name,
                        'nickname' => $user->profile->nickname,
                        'phone_number' => $user->profile->phone_number,
                        'gender' => $user->profile->gender,
                        'birth_date' => $user->profile->birth_date,
                        'address' => $user->profile->address,
                        'job' => $user->profile->job,
                        'hobby' => $user->profile->hobby,
                        'status' => $user->profile->status,
                        'profile_picture' => $user->profile->profile_picture
                    ] : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data profile'
            ], 500);
        }
    }

    /**
     * Update profile mentor - Digunakan oleh role: mentor
     */
    public function updateProfile(Request $request)
    {
        try {
            $request->validate([
                'full_name' => 'nullable|string|max:255',
                'nickname' => 'nullable|string|max:255',
                'phone_number' => 'nullable|string|max:255',
                'job' => 'nullable|string|max:255',
                'address' => 'nullable|string'
            ]);

            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak ditemukan'
                ], 404);
            }

            // Update or create profile
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $request->full_name,
                    'nickname' => $request->nickname,
                    'phone_number' => $request->phone_number,
                    'job' => $request->job,
                    'address' => $request->address
                ]
            );

            $user->load('profile');

            return response()->json([
                'status' => 'success',
                'message' => 'Profile berhasil diperbarui',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile' => $user->profile
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui profile'
            ], 500);
        }
    }

    /**
     * Kelompok yang dihapus - Digunakan oleh role: mentor
     */
    public function getTrashedGroups()
    {
        try {
            $mentorId = Auth::id();
            
            $groups = \App\Models\Group::onlyTrashed()
                ->with(['mentor.profile'])
                ->where('mentor_id', $mentorId)
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data kelompok terhapus'
            ], 500);
        }
    }

    /**
     * Mentee dalam kelompok - Digunakan oleh role: mentor
     */
    public function getGroupMentees(Request $request, $groupId)
    {
        try {
            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            $perPage = $request->get('per_page', 5);
            $search = $request->get('search');
            
            $query = \App\Models\Mentee::where('group_id', $groupId)
                ->where('status', 'Aktif');
            
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('nickname', 'like', "%{$search}%");
                });
            }
            
            $mentees = $query->orderBy('full_name', 'asc')->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $mentees->items(),
                'pagination' => [
                    'current_page' => $mentees->currentPage(),
                    'last_page' => $mentees->lastPage(),
                    'per_page' => $mentees->perPage(),
                    'total' => $mentees->total(),
                    'from' => $mentees->firstItem(),
                    'to' => $mentees->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data mentee'
            ], 500);
        }
    }

    /**
     * Semua mentee kelompok - Digunakan oleh role: mentor
     */
    public function getGroupAllMentees($groupId)
    {
        try {
            $mentorId = Auth::id();
            
            $group = \App\Models\Group::with([
                'mentor.profile', 
                'mentees' // Get all mentees without filtering
            ])
                ->where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail kelompok'
            ], 500);
        }
    }

    /**
     * Update kelompok - Digunakan oleh role: mentor
     */
    public function updateGroup(Request $request, $groupId)
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        try {
            $mentorId = Auth::id();
            
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            $group->update([
                'group_name' => $request->group_name,
                'description' => $request->description
            ]);

            $group->load('mentor.profile');

            return response()->json([
                'status' => 'success',
                'message' => 'Kelompok berhasil diperbarui',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui kelompok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus kelompok - Digunakan oleh role: mentor
     */
    public function deleteGroup($groupId)
    {
        try {
            $mentorId = Auth::id();
            
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            DB::beginTransaction();
            
            // Set group_id to null for all mentees in this group
            \App\Models\Mentee::where('group_id', $groupId)
                ->update(['group_id' => null]);
            
            // Soft delete the group
            $group->delete();
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Kelompok berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus kelompok'
            ], 500);
        }
    }

    /**
     * Restore kelompok - Digunakan oleh role: mentor
     */
    public function restoreGroup($groupId)
    {
        try {
            $mentorId = Auth::id();
            
            $group = \App\Models\Group::onlyTrashed()
                ->where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan'
                ], 404);
            }

            DB::beginTransaction();
            
            // Restore the group
            $group->restore();
            
            // Note: We don't automatically restore mentees to this group
            // They remain as "available mentees" and can be manually added back
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Kelompok berhasil dipulihkan. Mentee dapat ditambahkan kembali dari daftar mentee yang tersedia.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memulihkan kelompok'
            ], 500);
        }
    }

    /**
     * Daftar pertemuan mentor - Digunakan oleh role: mentor
     */
    public function getMeetings()
    {
        try {
            $mentorId = Auth::id();
            
            // Get meetings directly by mentor_id or through groups
            $meetings = \App\Models\Meeting::where('mentor_id', $mentorId)
                ->orWhereHas('group', function($query) use ($mentorId) {
                    $query->where('mentor_id', $mentorId);
                })
            ->with(['group', 'attendances'])
            ->orderBy('meeting_date', 'desc')
            ->get()
            ->map(function($meeting) {
                // Calculate attendance stats - case insensitive comparison
                $attendanceStats = [
                    'hadir' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'hadir'; })->count(),
                    'sakit' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'sakit'; })->count(),
                    'izin' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'izin'; })->count(),
                    'alpha' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'alpha'; })->count(),
                ];

                return [
                    'id' => $meeting->id,
                    'title' => $meeting->topic,
                    'group_name' => $meeting->group ? $meeting->group->group_name : 'No Group',
                    'meeting_date' => $meeting->meeting_date,
                    'location' => $meeting->place,
                    'type' => strtolower($meeting->meeting_type ?? 'offline'),
                    'created_at' => $meeting->created_at,
                    'attendance' => $attendanceStats
                ];
            });

            // Calculate weekly stats based on created_at (Monday to Sunday)
            $weekStart = now()->startOfWeek();
            $weekEnd = now()->endOfWeek();
            $weeklyTotal = $meetings->filter(function($meeting) use ($weekStart, $weekEnd) {
                $createdAt = \Carbon\Carbon::parse($meeting['created_at']);
                return $createdAt->between($weekStart, $weekEnd);
            })->count();

            $stats = [
                'weeklyTotal' => $weeklyTotal
            ];

            return response()->json([
                'status' => 'success',
                'data' => $meetings,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data pertemuan'
            ], 500);
        }
    }

    /**
     * Pertemuan yang dihapus - Digunakan oleh role: mentor
     */
    public function getTrashedMeetings()
    {
        try {
            $mentorId = Auth::id();
            
            $meetings = \App\Models\Meeting::onlyTrashed()
                ->where(function($query) use ($mentorId) {
                    $query->where('mentor_id', $mentorId)
                          ->orWhereHas('group', function($q) use ($mentorId) {
                              $q->where('mentor_id', $mentorId);
                          });
                })
                ->with(['group'])
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function($meeting) {
                    return [
                        'id' => $meeting->id,
                        'title' => $meeting->topic,
                        'group_name' => $meeting->group ? $meeting->group->group_name : 'No Group',
                        'meeting_date' => $meeting->meeting_date,
                        'location' => $meeting->place,
                        'type' => strtolower($meeting->meeting_type ?? 'offline'),
                        'deleted_at' => $meeting->deleted_at,
                        'created_at' => $meeting->created_at
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $meetings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data pertemuan terhapus'
            ], 500);
        }
    }

    /**
     * Detail pertemuan - Digunakan oleh role: mentor
     */
    public function getMeetingDetail($meetingId)
    {
        try {
            $mentorId = Auth::id();
            
            $meeting = \App\Models\Meeting::where('id', $meetingId)
                ->where(function($query) use ($mentorId) {
                    $query->where('mentor_id', $mentorId)
                          ->orWhereHas('group', function($q) use ($mentorId) {
                              $q->where('mentor_id', $mentorId);
                          });
                })
                ->with([
                    'group.mentees' => function($query) {
                        $query->where('status', 'Aktif');
                    },
                    'attendances.mentee'
                ])
                ->first();

            if (!$meeting) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pertemuan tidak ditemukan'
                ], 404);
            }

            // Get only active mentees in the group with their attendance status
            $mentees = $meeting->group->mentees->map(function($mentee) use ($meeting) {
                $attendance = $meeting->attendances->where('mentee_id', $mentee->id)->first();
                return [
                    'id' => $mentee->id,
                    'full_name' => $mentee->full_name,
                    'nickname' => $mentee->nickname,
                    'status' => $attendance ? strtolower($attendance->status) : 'tidak hadir'
                ];
            });

            $result = [
                'id' => $meeting->id,
                'title' => $meeting->topic,
                'group_name' => $meeting->group->group_name,
                'group_created_at' => $meeting->group->created_at,
                'meeting_date' => $meeting->meeting_date,
                'location' => $meeting->place,
                'type' => strtolower($meeting->meeting_type ?? 'offline'),
                'created_at' => $meeting->created_at,
                'photos' => $this->parsePhotos($meeting->photos),
                'mentees' => $mentees,
                'attendance' => [
                    'hadir' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'hadir'; })->count(),
                    'sakit' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'sakit'; })->count(),
                    'izin' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'izin'; })->count(),
                    'alpha' => $meeting->attendances->filter(function($att) { return strtolower($att->status) === 'alpha'; })->count(),
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail pertemuan'
            ], 500);
        }
    }

    /**
     * Buat pertemuan baru - Digunakan oleh role: mentor
     */
    public function createMeeting(Request $request)
    {
        try {
            $request->validate([
                'group_id' => 'required|exists:groups,id',
                'topic' => 'required|string|max:255',
                'meeting_date' => 'required|date',
                'meeting_type' => 'required|in:offline,online,assignment',
                'place' => 'required|string|max:255',
                'notes' => 'nullable|string',
                'photos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
                'attendances' => 'nullable|string'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $request->group_id)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            DB::beginTransaction();

            // Handle photo uploads
            $photoUrls = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('meeting_photos', 'public');
                    $photoUrls[] = asset('storage/' . $path);
                }
            }

            // Create meeting
            $meeting = \App\Models\Meeting::create([
                'group_id' => $request->group_id,
                'mentor_id' => $mentorId,
                'topic' => $request->topic,
                'meeting_date' => $request->meeting_date,
                'meeting_type' => $request->meeting_type,
                'place' => $request->place,
                'notes' => $request->notes,
                'photos' => !empty($photoUrls) ? json_encode($photoUrls) : null
            ]);

            // Create attendance records if provided
            if ($request->attendances) {
                $attendances = is_string($request->attendances) ? json_decode($request->attendances, true) : $request->attendances;
                
                if (is_array($attendances)) {
                    foreach ($attendances as $attendance) {
                        // Verify mentee exists and belongs to the group
                        $mentee = \App\Models\Mentee::where('id', $attendance['mentee_id'])
                            ->where('group_id', $request->group_id)
                            ->first();
                        
                        if ($mentee) {
                            \App\Models\Attendance::create([
                                'meeting_id' => $meeting->id,
                                'mentee_id' => $attendance['mentee_id'],
                                'status' => $attendance['status'],
                                'notes' => $attendance['note'] ?? null
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            $meeting->load(['group', 'attendances.mentee']);

            return response()->json([
                'status' => 'success',
                'message' => 'Pertemuan berhasil dibuat',
                'data' => $meeting
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error creating meeting: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat pertemuan',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update pertemuan - Digunakan oleh role: mentor
     */
    public function updateMeeting(Request $request, $meetingId)
    {
        try {
            Log::info('UpdateMeeting request data:', $request->all());
            
            $request->validate([
                'topic' => 'required|string|max:255',
                'meeting_date' => 'required|date',
                'meeting_type' => 'required|in:offline,online,assignment',
                'place' => 'required|string|max:255',
                'notes' => 'nullable|string',
                'existing_photos' => 'nullable|string',
                'photos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $mentorId = Auth::id();
            
            $meeting = \App\Models\Meeting::where('id', $meetingId)
                ->where(function($query) use ($mentorId) {
                    $query->where('mentor_id', $mentorId)
                          ->orWhereHas('group', function($q) use ($mentorId) {
                              $q->where('mentor_id', $mentorId);
                          });
                })
                ->first();

            if (!$meeting) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pertemuan tidak ditemukan'
                ], 404);
            }

            // Handle photos
            $photoUrls = [];
            
            // Delete removed photos from storage
            $oldPhotos = $this->parsePhotos($meeting->photos);
            $existingPhotos = $this->parsePhotos($request->existing_photos);
            
            if (is_array($oldPhotos) && is_array($existingPhotos)) {
                $deletedPhotos = array_diff($oldPhotos, $existingPhotos);
                foreach ($deletedPhotos as $photoUrl) {
                    $path = str_replace(asset('storage/'), '', $photoUrl);
                    Storage::disk('public')->delete($path);
                }
            }
            
            // Keep existing photos that weren't deleted
            if (is_array($existingPhotos)) {
                $photoUrls = array_merge($photoUrls, $existingPhotos);
            }
            
            // Add new photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('meeting_photos', 'public');
                    $photoUrls[] = asset('storage/' . $path);
                }
            }

            DB::beginTransaction();
            
            $meeting->update([
                'topic' => $request->topic,
                'meeting_date' => $request->meeting_date,
                'meeting_type' => $request->meeting_type,
                'place' => $request->place,
                'notes' => $request->notes,
                'photos' => !empty($photoUrls) ? json_encode($photoUrls) : null
            ]);

            // Update attendance records if provided
            if ($request->attendances) {
                $attendances = is_string($request->attendances) ? json_decode($request->attendances, true) : $request->attendances;
                
                if (is_array($attendances)) {
                    // Delete existing attendance records
                    \App\Models\Attendance::where('meeting_id', $meetingId)->delete();
                    
                    // Create new attendance records
                    foreach ($attendances as $attendance) {
                        // Verify mentee exists and belongs to the group
                        $mentee = \App\Models\Mentee::where('id', $attendance['mentee_id'])
                            ->where('group_id', $meeting->group_id)
                            ->first();
                        
                        if ($mentee) {
                            \App\Models\Attendance::create([
                                'meeting_id' => $meeting->id,
                                'mentee_id' => $attendance['mentee_id'],
                                'status' => $attendance['status'],
                                'notes' => $attendance['note'] ?? null
                            ]);
                        }
                    }
                }
            }
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pertemuan berhasil diperbarui',
                'data' => $meeting
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', $e->errors());
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update meeting error:', ['message' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui pertemuan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus pertemuan - Digunakan oleh role: mentor
     */
    public function deleteMeeting($meetingId)
    {
        try {
            $mentorId = Auth::id();
            
            $meeting = \App\Models\Meeting::where('id', $meetingId)
                ->where(function($query) use ($mentorId) {
                    $query->where('mentor_id', $mentorId)
                          ->orWhereHas('group', function($q) use ($mentorId) {
                              $q->where('mentor_id', $mentorId);
                          });
                })
                ->first();

            if (!$meeting) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pertemuan tidak ditemukan'
                ], 404);
            }

            $meeting->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Pertemuan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus pertemuan'
            ], 500);
        }
    }

    /**
     * Restore pertemuan - Digunakan oleh role: mentor
     */
    public function restoreMeeting($meetingId)
    {
        try {
            $mentorId = Auth::id();
            
            $meeting = \App\Models\Meeting::onlyTrashed()
                ->where('id', $meetingId)
                ->where(function($query) use ($mentorId) {
                    $query->where('mentor_id', $mentorId)
                          ->orWhereHas('group', function($q) use ($mentorId) {
                              $q->where('mentor_id', $mentorId);
                          });
                })
                ->first();

            if (!$meeting) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pertemuan tidak ditemukan'
                ], 404);
            }

            $meeting->restore();

            return response()->json([
                'status' => 'success',
                'message' => 'Pertemuan berhasil dipulihkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memulihkan pertemuan'
            ], 500);
        }
    }

    /**
     * Pengumuman untuk mentor - Digunakan oleh role: mentor
     */
    public function getAnnouncements(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $page = $request->get('page', 1);
            
            $announcements = \App\Models\Announcement::with('user')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'data' => $announcements->items(),
                    'total' => $announcements->total(),
                    'current_page' => $announcements->currentPage(),
                    'last_page' => $announcements->lastPage(),
                    'per_page' => $announcements->perPage()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data pengumuman'
            ], 500);
        }
    }

    // ============================================
    // METHOD UNTUK ROLE ADMIN (sudah ada sebelumnya)
    // ============================================

    /**
     * Edit mentor - Digunakan oleh role: admin
     */
    public function edit(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor data for edit fetched successfully',
            'data' => $mentor->load('profile'),
        ]);
    }

    /**
     * Debug method - Digunakan oleh role: admin
     */
    public function debug(Request $request)
    {
        return response()->json([
            'received_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'gender_value' => $request->get('gender'),
            'gender_type' => gettype($request->get('gender')),
        ]);
    }

    /**
     * Private method untuk statistik - Digunakan oleh role: admin
     */
    private function getStats()
    {
        $totalMentors = User::where('role', 'mentor')->whereNull('deleted_at')->count();
        $activeMentors = User::where('role', 'mentor')->whereNull('deleted_at')->whereNull('blocked_at')->count();
        $blockedMentors = User::where('role', 'mentor')->whereNull('deleted_at')->whereNotNull('blocked_at')->count();
        $trashedMentors = User::onlyTrashed()->where('role', 'mentor')->count();
        
        $genderStats = User::where('role', 'mentor')
            ->whereNull('users.deleted_at')
            ->join('profiles', 'users.id', '=', 'profiles.user_id')
            ->selectRaw('profiles.gender, COUNT(*) as count')
            ->groupBy('profiles.gender')
            ->pluck('count', 'gender')
            ->toArray();

        return [
            'totalMentors' => $totalMentors,
            'activeMentors' => $activeMentors,
            'blockedMentors' => $blockedMentors,
            'trashedMentors' => $trashedMentors,
            'ikhwanCount' => $genderStats['Ikhwan'] ?? 0,
            'akhwatCount' => $genderStats['Akhwat'] ?? 0,
        ];
    }

    /**
     * Helper method to safely parse photos data
     */
    private function parsePhotos($photos)
    {
        if (is_null($photos)) {
            return [];
        }
        
        if (is_array($photos)) {
            return $photos;
        }
        
        if (is_string($photos)) {
            $decoded = json_decode($photos, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }
}