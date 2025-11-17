<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::with('user.profile');
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }
        
        // Filter berdasarkan status
        if ($request->has('status')) {
            switch ($request->status) {
                case 'active':
                    $query->active();
                    break;
                case 'expired':
                    $query->expired();
                    break;
                case 'scheduled':
                    $query->scheduled();
                    break;
            }
        }
        
        $perPage = $request->get('per_page', 12);
        $announcements = $query->orderBy('event_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Announcements fetched successfully',
            'data' => [
                'data' => AnnouncementResource::collection($announcements->items()),
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'from' => $announcements->firstItem(),
                'to' => $announcements->lastItem(),
            ],
        ]);
    }
    
    public function statistics()
    {
        $stats = [
            'total' => Announcement::count(),
            'active' => Announcement::active()->count(),
            'expired' => Announcement::expired()->count(),
            'scheduled' => Announcement::scheduled()->count(),
            'this_month' => Announcement::whereMonth('created_at', now()->month)->count(),
        ];
        
        return response()->json([
            'status' => 'success',
            'message' => 'Statistics fetched successfully',
            'data' => $stats,
        ]);
    }
    
    public function archived(Request $request)
    {
        $query = Announcement::with('user.profile')->expired();
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }
        
        $perPage = $request->get('per_page', 12);
        $announcements = $query->orderBy('event_at', 'desc')->paginate($perPage);
            
        return response()->json([
            'status' => 'success',
            'message' => 'Archived announcements fetched successfully',
            'data' => [
                'data' => AnnouncementResource::collection($announcements->items()),
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'from' => $announcements->firstItem(),
                'to' => $announcements->lastItem(),
            ],
        ]);
    }
    
    public function store(AnnouncementRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();
        
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $timestamp = now()->format('Y-m-d_H-i-s');
            $fileName = $timestamp . '_' . $originalName;
            
            $data['file_path'] = $file->storeAs('announcements', $fileName, 'public');
            $data['file_type'] = $file->getClientMimeType();
        }

        $announcement = Announcement::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement created successfully',
            'data' => new AnnouncementResource($announcement),
        ], 201);
    }

    public function show(Announcement $announcement)
    {
        $announcement->load('user.profile');
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement fetched successfully',
            'data' => new AnnouncementResource($announcement),
        ]);
    }

    public function update(AnnouncementRequest $request, Announcement $announcement)
    {
        $data = $request->validated();
        
        // Handle file upload
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($announcement->file_path) {
                Storage::delete('public/' . $announcement->file_path);
            }
            
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $timestamp = now()->format('Y-m-d_H-i-s');
            $fileName = $timestamp . '_' . $originalName;
            
            $data['file_path'] = $file->storeAs('announcements', $fileName, 'public');
            $data['file_type'] = $file->getClientMimeType();
        }
        
        // Handle file removal
        if ($request->has('remove_file') && $request->remove_file) {
            if ($announcement->file_path) {
                Storage::delete('public/' . $announcement->file_path);
            }
            $data['file_path'] = null;
            $data['file_type'] = null;
        }

        $announcement->update($data);
        $announcement->load('user.profile');

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement updated successfully',
            'data' => new AnnouncementResource($announcement),
        ]);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete(); // Soft delete
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement moved to trash successfully',
        ]);
    }

    public function trashed(Request $request)
    {
        $query = Announcement::onlyTrashed()->with('user.profile');
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }
        
        $perPage = $request->get('per_page', 12);
        $announcements = $query->orderBy('deleted_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Trashed announcements fetched successfully',
            'data' => [
                'data' => AnnouncementResource::collection($announcements->items()),
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'from' => $announcements->firstItem(),
                'to' => $announcements->lastItem(),
            ],
        ]);
    }

    public function restore($id)
    {
        $announcement = Announcement::onlyTrashed()->findOrFail($id);
        $announcement->restore();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement restored successfully',
        ]);
    }

    public function forceDelete($id)
    {
        $announcement = Announcement::onlyTrashed()->findOrFail($id);
        
        // Delete file if exists
        if ($announcement->file_path) {
            Storage::delete('public/' . $announcement->file_path);
        }
        
        $announcement->forceDelete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement permanently deleted',
        ]);
    }
}