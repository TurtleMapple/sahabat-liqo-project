<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MenteeController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\MonthlyReportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\YearlyReportController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ImportController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsSuperAdmin;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout-all', [AuthController::class, 'logoutAll'])->middleware('auth:sanctum');

// Password Reset Routes
Route::post('/forgot-password', [App\Http\Controllers\ForgotPasswordController::class, 'sendResetLinkEmail'])->middleware('throttle:5,1');
Route::post('/reset-password', [App\Http\Controllers\ForgotPasswordController::class, 'reset']);

// Fortify will handle password reset routes automatically at:
// POST /api/forgot-password
// POST /api/reset-password

// Test PDF without auth
Route::get('/test-pdf', [MonthlyReportController::class, 'testPDF']);
Route::get('/test-excel', [MonthlyReportController::class, 'testExcel']);
Route::get('/debug-excel-data', [MonthlyReportController::class, 'debugExcelData']);
Route::get('/test-scenarios', [MonthlyReportController::class, 'testScenarios']);
Route::get('/test-yearly-data', [YearlyReportController::class, 'testYearlyData']);
Route::get('/test-yearly-pdf', [YearlyReportController::class, 'exportYearlyPDF']);
Route::get('/test-yearly-excel', [YearlyReportController::class, 'exportYearlyExcel']);

Route::middleware(['auth:sanctum', 'token.valid'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
    Route::get('/dashboard/stats-comparison', [DashboardController::class, 'statsComparison']);
    Route::get('/dashboard/total-reports', [DashboardController::class, 'totalReports']);
    Route::get('/dashboard/recent-admins', [DashboardController::class, 'recentAdmins']);
    Route::get('/dashboard/yearly-trend', [DashboardController::class, 'yearlyTrend']);
    Route::get('/dashboard/weekly-trend', [DashboardController::class, 'weeklyTrend']);
    Route::get('/dashboard/upcoming-events', [DashboardController::class, 'upcomingEvents']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    // User & Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
    Route::prefix('users')->middleware('is_admin')->group(function () {
        Route::get('/', [UserController::class, 'index']);
    });
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/profiles/{profile}', [ProfileController::class, 'update']);

    // Groups - Admin Only
    Route::middleware(IsAdmin::class)->group(function () {
        Route::get('groups/debug-data', [GroupController::class, 'debugData']);
        Route::get('groups/statistics', [GroupController::class, 'statistics']);
        Route::get('groups/available-mentors', [GroupController::class, 'getAvailableMentors']);
        Route::get('groups/available-mentees', [GroupController::class, 'getAvailableMentees']);
        Route::get('groups/mentees-for-form', [GroupController::class, 'getMenteesForForm']);
        Route::get('groups/mentor-gender/{mentorId}', [GroupController::class, 'getMentorGender']);
        
        Route::get('groups/{group}/edit-mentors', [GroupController::class, 'getMentorsForEdit']);
        Route::get('groups/{group}/edit-mentees', [GroupController::class, 'getMenteesForEdit']);
        
        Route::get('groups/trashed', [GroupController::class, 'trashed']);
        Route::post('groups/{id}/restore', [GroupController::class, 'restore']);
        Route::delete('groups/{id}/force', [GroupController::class, 'forceDelete']);
        
        Route::apiResource('groups', GroupController::class);
        
        Route::get('groups/{group}/mentees', [GroupController::class, 'getGroupMentees']);
        Route::post('groups/{group}/mentees', [GroupController::class, 'addMenteesToGroup']);
        Route::delete('groups/{group}/mentees', [GroupController::class, 'removeMenteesFromGroup']);
        Route::put('groups/{group}/mentees/move', [GroupController::class, 'moveMentees']);
        
        Route::post('groups/{group}/mentees-legacy', [GroupController::class, 'addMentees']);
        Route::delete('groups/{group}/mentees-legacy', [GroupController::class, 'removeMentees']);
    });

    // Mentees - Specific routes BEFORE apiResource
    Route::get('mentees/stats', [MenteeController::class, 'stats']);
    Route::get('mentees/export', [MenteeController::class, 'export']);
    Route::get('mentees/trashed', [MenteeController::class, 'trashed']);
    Route::post('mentees/bulk-store', [MenteeController::class, 'bulkStore']);
    Route::post('mentees/bulk-update', [MenteeController::class, 'bulkUpdate']);
    Route::post('mentees/bulk-delete', [MenteeController::class, 'bulkDelete']);
    Route::post('mentees/bulk-move-group', [MenteeController::class, 'bulkMoveGroup']);
    Route::post('mentees/{id}/restore', [MenteeController::class, 'restore']);
    Route::delete('mentees/{id}/force', [MenteeController::class, 'forceDelete']);
    Route::apiResource('mentees', MenteeController::class);

    // Mentors
    Route::get('mentors/stats', [MentorController::class, 'stats']);
    Route::get('mentors/trashed', [MentorController::class, 'trashed']);
    Route::put('mentors/{mentor}/block', [MentorController::class, 'block']);
    Route::put('mentors/{mentor}/unblock', [MentorController::class, 'unblock']);
    Route::post('mentors/{id}/restore', [MentorController::class, 'restore']);
    Route::get('mentors/{id}/force-info', [MentorController::class, 'forceDeleteInfo']);
    Route::delete('mentors/{id}/force', [MentorController::class, 'forceDelete']);
    Route::apiResource('mentors', MentorController::class);

    // Meetings
    Route::get('meetings/statistics', [MeetingController::class, 'statistics']);
    Route::get('meetings/groups', [MeetingController::class, 'getGroups']);
    Route::get('meetings/trashed', [MeetingController::class, 'trashed']);
    Route::post('meetings/bulk-restore', [MeetingController::class, 'bulkRestore']);
    Route::post('meetings/bulk-force-delete', [MeetingController::class, 'bulkForceDelete']);
    Route::post('meetings/{id}/restore', [MeetingController::class, 'restore']);
    Route::delete('meetings/{id}/force', [MeetingController::class, 'forceDelete']);
    Route::apiResource('meetings', MeetingController::class);

    // Attendance
    Route::post('attendances', [AttendanceController::class, 'store']);

    // Announcements
    Route::get('announcements/statistics', [AnnouncementController::class, 'statistics']);
    Route::get('announcements/archived', [AnnouncementController::class, 'archived']);
    Route::get('announcements/trashed', [AnnouncementController::class, 'trashed']);
    Route::post('announcements/{id}/restore', [AnnouncementController::class, 'restore']);
    Route::delete('announcements/{id}/force', [AnnouncementController::class, 'forceDelete']);
    Route::apiResource('announcements', AnnouncementController::class);

    // Monthly Reports
    Route::get('monthly-reports', [MonthlyReportController::class, 'getReport']);
    Route::get('monthly-reports/groups', [MonthlyReportController::class, 'getGroupsForSelection']);
    Route::get('monthly-reports/debug-genders', [MonthlyReportController::class, 'debugGenders']);
    Route::get('monthly-reports/export-data', [MonthlyReportController::class, 'testExportData']);
    Route::get('monthly-reports/export-pdf', [MonthlyReportController::class, 'exportPDF']);
    Route::get('monthly-reports/export-excel', [MonthlyReportController::class, 'exportExcel']);
    
    // Yearly Reports
    Route::get('yearly-reports', [YearlyReportController::class, 'getYearlyReport']);
    Route::get('yearly-reports/export-pdf', [YearlyReportController::class, 'exportYearlyPDF']);
    Route::get('yearly-reports/export-excel', [YearlyReportController::class, 'exportYearlyExcel']);

    // Reports Statistics
    Route::get('reports/top-groups', [ReportController::class, 'getTopGroups']);
    Route::get('reports/top-mentees', [ReportController::class, 'getTopMentees']);
    Route::get('reports/top-mentors', [ReportController::class, 'getTopMentors']);
    Route::get('reports/least-active-groups', [ReportController::class, 'getLeastActiveGroups']);
    Route::get('reports/least-active-mentees', [ReportController::class, 'getLeastActiveMentees']);
    Route::get('reports/least-active-mentors', [ReportController::class, 'getLeastActiveMentors']);
    Route::get('reports/mentee-stats/{menteeId}', [ReportController::class, 'getMenteeStats']);

    // Admins - Super Admin Only
    Route::get('admins/debug', [AdminController::class, 'debug'])->middleware(IsSuperAdmin::class);
    Route::get('admins/trashed', [AdminController::class, 'trashed'])->middleware(IsSuperAdmin::class);
    Route::post('admins/{id}/restore', [AdminController::class, 'restore'])->middleware(IsSuperAdmin::class);
    Route::delete('admins/{id}/force', [AdminController::class, 'forceDelete'])->middleware(IsSuperAdmin::class);
    Route::put('admins/{admin}/block', [AdminController::class, 'block'])->middleware(IsSuperAdmin::class);
    Route::put('admins/{admin}/unblock', [AdminController::class, 'unblock'])->middleware(IsSuperAdmin::class);
    Route::apiResource('admins', AdminController::class)->middleware(IsSuperAdmin::class);

    // Super Admins - Super Admin Only
    Route::put('super-admins/{superAdmin}/block', [SuperAdminController::class, 'block'])->middleware(IsSuperAdmin::class);
    Route::put('super-admins/{superAdmin}/unblock', [SuperAdminController::class, 'unblock'])->middleware(IsSuperAdmin::class);
    Route::apiResource('super-admins', SuperAdminController::class)->middleware(IsSuperAdmin::class);

    // Activities
    Route::get('activities', [ActivityController::class, 'getActivities']);

    // Import Excel - Admin Only
    Route::middleware(IsAdmin::class)->group(function () {
        Route::get('import/mentee-template', [ImportController::class, 'downloadMenteeTemplate']);
        Route::post('import/mentees', [ImportController::class, 'importMentees']);
        Route::get('import/mentor-template', [ImportController::class, 'downloadMentorTemplate']);
        Route::post('import/mentors', [ImportController::class, 'importMentors']);
        Route::get('import/group-template', [ImportController::class, 'downloadGroupTemplate']);
        Route::post('import/groups', [ImportController::class, 'importGroups']);
    });

    // ========================================================================
    // AWAL DARI BLOK KODE KEDUA YANG DIMASUKKAN
    // ========================================================================
    
    // Dashboard Mentor - DENGAN middleware mentor
    Route::prefix('mentor')->middleware('is_mentor')->group(function () {
        Route::get('/profile', [MentorController::class, 'getProfile']);
        Route::put('/profile', [MentorController::class, 'updateProfile']);
        Route::get('/groups', [MentorController::class, 'getGroups']);
        Route::get('/groups/trashed', [MentorController::class, 'getTrashedGroups']);
        Route::post('/groups', [MentorController::class, 'createGroup']);
        Route::get('/groups/{groupId}', [MentorController::class, 'getGroupDetail']);
        Route::get('/groups/{groupId}/mentees', [MentorController::class, 'getGroupMentees']);
        Route::get('/groups/{groupId}/all-mentees', [MentorController::class, 'getGroupAllMentees']);
        Route::put('/groups/{groupId}', [MentorController::class, 'updateGroup']);
        Route::delete('/groups/{groupId}', [MentorController::class, 'deleteGroup']);
        Route::post('/groups/{groupId}/restore', [MentorController::class, 'restoreGroup']);
        Route::post('/groups/{groupId}/mentees', [MentorController::class, 'addMentees']);
        Route::patch('/groups/{groupId}/add-mentees', [MentorController::class, 'addExistingMenteesToGroup']);
        Route::put('/groups/{groupId}/move-mentees', [MentorController::class, 'moveMentees']);
        Route::get('/meetings', [MentorController::class, 'getMeetings']);
        Route::get('/meetings/trashed', [MentorController::class, 'getTrashedMeetings']);
        Route::get('/meetings/{meetingId}', [MentorController::class, 'getMeetingDetail']);
        Route::post('/meetings', [MentorController::class, 'createMeeting']);
        Route::put('/meetings/{meetingId}', [MentorController::class, 'updateMeeting']);
        Route::post('/meetings/{meetingId}', [MentorController::class, 'updateMeeting']); // Catatan: Ada duplikasi PUT/POST di sini, mungkin salah satu bisa dihapus
        Route::delete('/meetings/{meetingId}', [MentorController::class, 'deleteMeeting']);
        Route::post('/meetings/{meetingId}/restore', [MentorController::class, 'restoreMeeting']);
        Route::get('/dashboard/stats', [MentorController::class, 'getDashboardStats']);
        Route::get('/announcements', [MentorController::class, 'getAnnouncements']);
    });
    
    // ========================================================================
    // AKHIR DARI BLOK KODE KEDUA
    // ========================================================================

});