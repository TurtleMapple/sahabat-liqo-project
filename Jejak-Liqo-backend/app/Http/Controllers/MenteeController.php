<?php

namespace App\Http\Controllers;

use App\Http\Requests\MenteeRequest;
use App\Http\Resources\MenteeResource;
use App\Models\Mentee;
use App\Models\MenteeGroupHistory;
use Illuminate\Http\Request;

class MenteeController extends Controller
{
    public function index(Request $request)
    {
        $query = Mentee::with(['group'])
            ->whereHas('group', function($q) {
                $q->whereNull('deleted_at');
            })
            ->orWhereNull('group_id');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('nickname', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('activity_class', 'like', "%{$search}%");
            });
        }

        // Filter by group
        if ($request->has('group_id') && $request->group_id) {
            $query->where('group_id', $request->group_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by gender
        if ($request->has('gender') && $request->gender) {
            $query->where('gender', $request->gender);
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $mentees = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentees fetched successfully',
            'data' => MenteeResource::collection($mentees),
            'pagination' => [
                'current_page' => $mentees->currentPage(),
                'last_page' => $mentees->lastPage(),
                'per_page' => $mentees->perPage(),
                'total' => $mentees->total(),
            ],
        ]);
    }

    public function store(MenteeRequest $request)
    {
        $mentee = Mentee::create($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Mentee created successfully',
            'data' => new MenteeResource($mentee),
        ], 201);
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'mentees' => 'required|array|min:1',
            'mentees.*.group_id' => 'nullable|exists:groups,id',
            'mentees.*.full_name' => 'required|string|max:255',
            'mentees.*.gender' => 'nullable|in:Ikhwan,Akhwat',
            'mentees.*.nickname' => 'nullable|string|max:255',
            'mentees.*.birth_date' => 'nullable|date',
            'mentees.*.phone_number' => 'nullable|string|max:255',
            'mentees.*.activity_class' => 'nullable|string|max:255',
            'mentees.*.hobby' => 'nullable|string|max:255',
            'mentees.*.address' => 'nullable|string',
            'mentees.*.status' => 'nullable|in:Aktif,Non-Aktif',
        ]);

        $createdMentees = [];
        foreach ($request->mentees as $menteeData) {
            $createdMentees[] = Mentee::create($menteeData);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully created ' . count($createdMentees) . ' mentees',
            'data' => MenteeResource::collection($createdMentees),
            'created_count' => count($createdMentees),
        ], 201);
    }

    public function show(Mentee $mentee)
    {
        $mentee->load('group');
        return response()->json([
            'status' => 'success',
            'message' => 'Mentee fetched successfully',
            'data' => new MenteeResource($mentee),
        ]);
    }

    public function update(MenteeRequest $request, Mentee $mentee)
    {
        $oldGroupId = $mentee->group_id;
        $mentee->update($request->validated());

        // Hanya track history jika group_id benar-benar berubah
        if ($request->has('group_id') && $request->group_id != $oldGroupId) {
            MenteeGroupHistory::create([
                'mentee_id' => $mentee->id,
                'from_group_id' => $oldGroupId,
                'to_group_id' => $request->group_id,
                'moved_at' => now(),
                'moved_by' => auth()->id(),
            ]);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Mentee updated successfully',
            'data' => new MenteeResource($mentee),
        ]);
    }

    public function destroy(Mentee $mentee)
    {
        $mentee->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Mentee deleted successfully',
        ]);
    }

    // Bulk operations
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'mentee_ids' => 'required|array',
            'mentee_ids.*' => 'exists:mentees,id',
            'updates' => 'required|array',
        ]);

        $menteeIds = $request->mentee_ids;
        $updates = $request->updates;

        $updatedCount = Mentee::whereIn('id', $menteeIds)->update($updates);

        return response()->json([
            'status' => 'success',
            'message' => "Successfully updated {$updatedCount} mentees",
            'updated_count' => $updatedCount,
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'mentee_ids' => 'required|array',
            'mentee_ids.*' => 'exists:mentees,id',
        ]);

        $menteeIds = $request->mentee_ids;
        $deletedCount = Mentee::whereIn('id', $menteeIds)->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Successfully deleted {$deletedCount} mentees",
            'deleted_count' => $deletedCount,
        ]);
    }

    // Move mentees to different group
    public function bulkMoveGroup(Request $request)
    {
        $request->validate([
            'mentee_ids' => 'required|array|min:1',
            'mentee_ids.*' => 'exists:mentees,id',
            'target_group_id' => 'required|exists:groups,id',
        ]);

        $menteeIds = $request->mentee_ids;
        $targetGroupId = $request->target_group_id;
        
        // Record history for each mentee
        $mentees = Mentee::whereIn('id', $menteeIds)->get();
        foreach ($mentees as $mentee) {
            MenteeGroupHistory::create([
                'mentee_id' => $mentee->id,
                'from_group_id' => $mentee->group_id,
                'to_group_id' => $targetGroupId,
                'moved_by' => auth()->id(),
            ]);
        }

        // Update group_id for all selected mentees
        $updatedCount = Mentee::whereIn('id', $menteeIds)
            ->update(['group_id' => $targetGroupId]);

        return response()->json([
            'status' => 'success',
            'message' => "Successfully moved {$updatedCount} mentees to new group",
            'moved_count' => $updatedCount,
        ]);
    }

    // Get mentee statistics
    public function stats()
    {
        $totalMentees = Mentee::count();
        $activeMentees = Mentee::where('status', 'Aktif')->count();
        $inactiveMentees = Mentee::where('status', 'Non-Aktif')->count();
        
        // Gender specific stats
        $totalIkhwan = Mentee::where('gender', 'Ikhwan')->count();
        $activeIkhwan = Mentee::where('gender', 'Ikhwan')->where('status', 'Aktif')->count();
        $totalAkhwat = Mentee::where('gender', 'Akhwat')->count();
        $activeAkhwat = Mentee::where('gender', 'Akhwat')->where('status', 'Aktif')->count();

        $menteesByGender = Mentee::selectRaw('gender, COUNT(*) as count')
            ->groupBy('gender')
            ->get();

        $menteesByGroup = Mentee::with('group')
            ->selectRaw('group_id, COUNT(*) as count')
            ->groupBy('group_id')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentee statistics fetched successfully',
            'data' => [
                'total_mentees' => $totalMentees,
                'active_mentees' => $activeMentees,
                'inactive_mentees' => $inactiveMentees,
                'total_ikhwan' => $totalIkhwan,
                'active_ikhwan' => $activeIkhwan,
                'total_akhwat' => $totalAkhwat,
                'active_akhwat' => $activeAkhwat,
                'mentees_by_gender' => $menteesByGender,
                'mentees_by_group' => $menteesByGroup,
            ],
        ]);
    }

    // Export mentees to Excel/CSV
    public function export(Request $request)
    {
        $query = Mentee::with(['group', 'group.mentor']);

        // Apply same filters as index method
        if ($request->has('group_id') && $request->group_id) {
            $query->where('group_id', $request->group_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('gender') && $request->gender) {
            $query->where('gender', $request->gender);
        }

        $mentees = $query->get();

        $exportData = $mentees->map(function ($mentee) {
            return [
                'ID' => $mentee->id,
                'Nama Lengkap' => $mentee->full_name,
                'Nama Panggilan' => $mentee->nickname,
                'Tanggal Lahir' => $mentee->birth_date,
                'Nomor Telepon' => $mentee->phone_number,
                'Kelas Aktivitas' => $mentee->activity_class,
                'Hobi' => $mentee->hobby,
                'Alamat' => $mentee->address,
                'Status' => $mentee->status,
                'Jenis Kelamin' => $mentee->gender,
                'Grup' => $mentee->group ? $mentee->group->group_name : 'Tidak ada grup',
                'Mentor' => $mentee->group && $mentee->group->mentor ? $mentee->group->mentor->profile->full_name ?? 'Tidak ada mentor' : 'Tidak ada mentor',
                'Tanggal Dibuat' => $mentee->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Mentees exported successfully',
            'data' => $exportData,
        ]);
    }

    // Get trashed mentees
    public function trashed()
    {
        $trashedMentees = Mentee::onlyTrashed()
            ->with(['group', 'group.mentor'])
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'message' => 'Trashed mentees fetched successfully',
            'data' => MenteeResource::collection($trashedMentees),
            'pagination' => [
                'current_page' => $trashedMentees->currentPage(),
                'last_page' => $trashedMentees->lastPage(),
                'per_page' => $trashedMentees->perPage(),
                'total' => $trashedMentees->total(),
            ],
        ]);
    }

    // Restore soft deleted mentee
    public function restore($id)
    {
        $mentee = Mentee::onlyTrashed()->findOrFail($id);
        $mentee->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentee restored successfully',
            'data' => new MenteeResource($mentee),
        ]);
    }

    // Force delete (permanent delete)
    public function forceDelete($id)
    {
        $mentee = Mentee::onlyTrashed()->findOrFail($id);
        $mentee->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentee permanently deleted',
        ]);
    }
}