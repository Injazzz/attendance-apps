<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AttendanceReportController;
use App\Http\Controllers\Api\AttendanceRuleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\JobFamilyController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OvertimeController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\QrDisplayController;
use App\Http\Controllers\Api\QrSessionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /*
    |------------------------------------------------------------------
    | PUBLIC
    |------------------------------------------------------------------
    */
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:login')
        ->name('auth.login');

    // Media files - public access
    Route::get('/media/{id}', [MediaController::class, 'show'])
        ->name('media.direct');
    Route::get('/media/download/{modelType}/{modelId}/{collection}', [MediaController::class, 'download'])
        ->name('media.download');

    /*
    |------------------------------------------------------------------
    | AUTHENTICATED + DEVICE VALID
    |------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'validate.device'])->group(function () {

        // ── AUTH ──────────────────────────────────────────────────
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('/me',      [AuthController::class, 'me'])->name('me');
        });

        // ── PROFILE ───────────────────────────────────────────────
        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/',   [ProfileController::class, 'show'])->name('show');
            Route::post('/',  [ProfileController::class, 'update'])->name('update');
            // POST bukan PATCH karena ada file upload foto
        });

        // ── NOTIFICATIONS ─────────────────────────────────────────
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/',                        [NotificationController::class, 'index'])->name('index');
            Route::patch('/read-all',              [NotificationController::class, 'readAll'])->name('read-all');
            Route::patch('/{notification}/read',   [NotificationController::class, 'markRead'])->name('read');
            Route::delete('/{notification}',       [NotificationController::class, 'destroy'])->name('destroy');
        });

        // ── ATTENDANCE ────────────────────────────────────────────
        Route::prefix('attendance')->name('attendance.')->group(function () {
            // Unified endpoint - all employees use QR only
            Route::post('/unified-qr-scan', [AttendanceController::class, 'unifiedQrScan'])->name('unified-qr-scan');

            // Legacy endpoint - DEPRECATED (kept for backward compatibility)
            Route::post('/qr-scan',  [AttendanceController::class, 'qrScan'])->name('qr-scan');
            Route::get('/today',     [AttendanceController::class, 'today'])->name('today');
            Route::get('/history',   [AttendanceController::class, 'history'])->name('history');
            Route::patch('/{attendanceRecord}/manual', [AttendanceController::class, 'manualEdit'])
                ->middleware('permission:attendance.manual_entry')
                ->name('manual-edit');
        });

        // ── ATTENDANCE REPORT ─────────────────────────────────────
        Route::prefix('attendance-report')->name('attendance-report.')->group(function () {
            Route::get('/my-report', [AttendanceReportController::class, 'myReport'])->name('my-report');
            Route::get('/my-report/export', [AttendanceReportController::class, 'exportMyReport'])->name('export');
        });

        // ── OVERTIME ──────────────────────────────────────────────
        Route::prefix('overtime')->name('overtime.')->group(function () {
            Route::get('/',                                   [OvertimeController::class, 'index'])->name('index');
            Route::get('/{id}',                  [OvertimeController::class, 'show'])->name('show');
            Route::post('/', [OvertimeController::class, 'store'])
                ->middleware('permission:overtime.request')->name('store');
            Route::patch('/{id}/approve', [OvertimeController::class, 'approve'])
                ->middleware('permission:overtime.approve_team')->name('approve');
            Route::patch('/{id}/reject',  [OvertimeController::class, 'reject'])
                ->middleware('permission:overtime.approve_team')->name('reject');
        });

        // ── QR DISPLAY ────────────────────────────────────────────
        Route::prefix('qr-displays')->name('qr-displays.')->group(function () {
            Route::get('/',             [QrDisplayController::class, 'index'])
                ->middleware('permission:qr.view')->name('index');
            Route::get('/{id}',  [QrDisplayController::class, 'show'])
                ->middleware('permission:qr.view')->name('show');
            Route::post('/', [QrDisplayController::class, 'store'])
                ->middleware('permission:qr.manage')->name('store');
            Route::patch('/{id}', [QrDisplayController::class, 'update'])
                ->middleware('permission:qr.manage')->name('update');
            Route::delete('/{id}', [QrDisplayController::class, 'destroy'])
                ->middleware('permission:qr.manage')->name('destroy');
        });

        // ── QR SESSION ────────────────────────────────────────────
        Route::prefix('qr-sessions')->name('qr-sessions.')->group(function () {
            Route::get('/{id}/current',   [QrSessionController::class, 'current'])
                ->middleware('permission:qr.view')->name('current');
            Route::post('/{id}/generate', [QrSessionController::class, 'generate'])
                ->middleware('permission:qr.manage')->name('generate');
        });

        // ── EMPLOYEES ─────────────────────────────────────────────
        Route::prefix('employees')->name('employees.')->group(function () {
            Route::get('/', [EmployeeController::class, 'index'])
                ->middleware('permission:employees.view')->name('index');
            Route::get('/{id}', [EmployeeController::class, 'show'])
                ->middleware('permission:employees.view')->name('show');
            Route::get('/{id}/qr', [EmployeeController::class, 'generateQr'])
                ->name('generate-qr');
            Route::post('/', [EmployeeController::class, 'store'])
                ->middleware('permission:employees.create')->name('store');
            // PATCH untuk update (support file upload via multipart/form-data)
            Route::patch('/{id}', [EmployeeController::class, 'update'])
                ->middleware('permission:employees.edit')->name('update');
            // POST juga untuk backward compatibility method spoofing
            Route::post('/{id}', [EmployeeController::class, 'update'])
                ->middleware('permission:employees.edit')->name('update');
            Route::delete('/{id}', [EmployeeController::class, 'destroy'])
                ->middleware('permission:employees.delete')->name('destroy');
        });

        // ── REPORTS ───────────────────────────────────────────────
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/dashboard-stats', [ReportController::class, 'dashboardStats'])
                ->middleware('permission:dashboard.view')->name('dashboard-stats');
            Route::get('/attendance', [ReportController::class, 'attendance'])
                ->middleware('permission:reports.daily')->name('attendance');
            Route::get('/summary',    [ReportController::class, 'summary'])
                ->middleware('permission:reports.monthly')->name('summary');
            Route::get('/attendance/export', [ReportController::class, 'export'])
                ->middleware('permission:reports.export')->name('export');
        });

        // ── MASTER DATA ───────────────────────────────────────────

        // Companies
        Route::prefix('companies')->name('companies.')
            ->middleware('permission:companies.manage')->group(function () {
                Route::get('/',              [CompanyController::class, 'index'])->name('index');
                Route::get('/{id}',     [CompanyController::class, 'show'])->name('show');
                Route::post('/',             [CompanyController::class, 'store'])->name('store');
                Route::patch('/{id}',   [CompanyController::class, 'update'])->name('update');
                Route::delete('/{id}',  [CompanyController::class, 'destroy'])->name('destroy');
            });

        // Sites
        Route::prefix('sites')->name('sites.')->group(function () {
            Route::get('/',       [SiteController::class, 'index'])
                ->middleware('permission:sites.view')->name('index');
            Route::get('/{id}', [SiteController::class, 'show'])
                ->middleware('permission:sites.view')->name('show');
            Route::post('/', [SiteController::class, 'store'])
                ->middleware('permission:sites.create')->name('store');
            Route::patch('/{id}', [SiteController::class, 'update'])
                ->middleware('permission:sites.edit')->name('update');
            Route::delete('/{id}', [SiteController::class, 'destroy'])
                ->middleware('permission:sites.delete')->name('destroy');
        });

        // Job Families
        Route::prefix('job-families')->name('job-families.')
            ->middleware('permission:positions.manage')->group(function () {
                Route::get('/',              [JobFamilyController::class, 'index'])->name('index');
                Route::get('/{id}',    [JobFamilyController::class, 'show'])->name('show');
                Route::post('/',             [JobFamilyController::class, 'store'])->name('store');
                Route::patch('/{id}',  [JobFamilyController::class, 'update'])->name('update');
                Route::delete('/{id}', [JobFamilyController::class, 'destroy'])->name('destroy');
            });

        // Departments
        Route::prefix('departments')->name('departments.')
            ->middleware('permission:departments.manage')->group(function () {
                Route::get('/',                [DepartmentController::class, 'index'])->name('index');
                Route::get('/{id}',    [DepartmentController::class, 'show'])->name('show');
                Route::post('/',               [DepartmentController::class, 'store'])->name('store');
                Route::patch('/{id}',  [DepartmentController::class, 'update'])->name('update');
                Route::delete('/{id}', [DepartmentController::class, 'destroy'])->name('destroy');
            });

        // Positions
        Route::prefix('positions')->name('positions.')
            ->middleware('permission:positions.manage')->group(function () {
                Route::get('/',              [PositionController::class, 'index'])->name('index');
                Route::get('/{id}',    [PositionController::class, 'show'])->name('show');
                Route::post('/',             [PositionController::class, 'store'])->name('store');
                Route::patch('/{id}',  [PositionController::class, 'update'])->name('update');
                Route::delete('/{id}', [PositionController::class, 'destroy'])->name('destroy');
            });

        // ── ATTENDANCE RULES ──────────────────────────────────────
        Route::prefix('attendance-rules')->name('attendance-rules.')
            ->middleware('role:super_admin|admin')->group(function () {
                Route::get('/',              [AttendanceRuleController::class, 'index'])->name('index');
                Route::get('/default',       [AttendanceRuleController::class, 'getDefault'])->name('default');
                Route::get('/{id}',          [AttendanceRuleController::class, 'show'])->name('show');
                Route::post('/',             [AttendanceRuleController::class, 'store'])->name('store');
                Route::patch('/{id}',        [AttendanceRuleController::class, 'update'])->name('update');
                Route::delete('/{id}',       [AttendanceRuleController::class, 'destroy'])->name('destroy');
            });

        // ── SETTINGS ──────────────────────────────────────────────
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/',  [SettingController::class, 'index'])
                ->middleware('permission:settings.view')->name('index');
            Route::post('/', [SettingController::class, 'update'])
                ->middleware('permission:settings.edit')->name('update');
        });

        // ── DEVICE MANAGEMENT ─────────────────────────────────────
        Route::prefix('devices')->name('devices.')
            ->middleware('role:super_admin|admin')->group(function () {
                Route::get('/',                  [DeviceController::class, 'index'])->name('index');
                Route::patch('/{id}/block',  [DeviceController::class, 'block'])->name('block');
                Route::delete('/{id}/reset', [DeviceController::class, 'reset'])->name('reset');
            });

        // ── USER MANAGEMENT ───────────────────────────────────────
        Route::prefix('users')->name('users.')
            ->middleware('permission:users.manage')->group(function () {
                Route::get('/',    [App\Http\Controllers\Api\UserController::class, 'index'])->name('index');
                Route::get('/{id}', [App\Http\Controllers\Api\UserController::class, 'show'])->name('show');
                Route::patch('/{id}/toggle-active',  [App\Http\Controllers\Api\UserController::class, 'toggleActive'])->name('toggle-active');
                Route::patch('/{id}/reset-password', [App\Http\Controllers\Api\UserController::class, 'resetPassword'])->name('reset-password');
                Route::patch('/{id}/unlock',         [App\Http\Controllers\Api\UserController::class, 'unlock'])->name('unlock');
                Route::patch('/{id}/change-role',    [App\Http\Controllers\Api\UserController::class, 'changeRole'])->name('change-role');
            });

    }); // end middleware
}); // end prefix v1

/*
|------------------------------------------------------------------
| BROADCASTING AUTHENTICATION
|------------------------------------------------------------------
| WebSocket broadcasting requires authentication for private channels.
| This route must be accessible with Sanctum tokens and NOT require CSRF.
*/
Route::post('/broadcasting/auth', \App\Http\Controllers\Broadcasting\AuthController::class)
    ->middleware(['api', 'auth:sanctum'])
    ->name('broadcasting.auth');
