<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\EmployeeController;
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
            Route::post('/qr-scan',  [AttendanceController::class, 'qrScan'])->name('qr-scan');
            Route::post('/selfie',   [AttendanceController::class, 'selfie'])->name('selfie');
            Route::get('/today',     [AttendanceController::class, 'today'])->name('today');
            Route::get('/history',   [AttendanceController::class, 'history'])->name('history');
            Route::patch('/{attendanceRecord}/manual', [AttendanceController::class, 'manualEdit'])
                ->middleware('permission:attendance.manual_entry')
                ->name('manual-edit');
        });

        // ── OVERTIME ──────────────────────────────────────────────
        Route::prefix('overtime')->name('overtime.')->group(function () {
            Route::get('/',                                   [OvertimeController::class, 'index'])->name('index');
            Route::get('/{overtimeRequest}',                  [OvertimeController::class, 'show'])->name('show');
            Route::post('/', [OvertimeController::class, 'store'])
                ->middleware('permission:overtime.request')->name('store');
            Route::patch('/{overtimeRequest}/approve', [OvertimeController::class, 'approve'])
                ->middleware('permission:overtime.approve_team')->name('approve');
            Route::patch('/{overtimeRequest}/reject',  [OvertimeController::class, 'reject'])
                ->middleware('permission:overtime.approve_team')->name('reject');
        });

        // ── QR DISPLAY ────────────────────────────────────────────
        Route::prefix('qr-displays')->name('qr-displays.')->group(function () {
            Route::get('/',             [QrDisplayController::class, 'index'])
                ->middleware('permission:qr.view')->name('index');
            Route::get('/{qrDisplay}',  [QrDisplayController::class, 'show'])
                ->middleware('permission:qr.view')->name('show');
            Route::post('/', [QrDisplayController::class, 'store'])
                ->middleware('permission:qr.manage')->name('store');
            Route::patch('/{qrDisplay}', [QrDisplayController::class, 'update'])
                ->middleware('permission:qr.manage')->name('update');
            Route::delete('/{qrDisplay}', [QrDisplayController::class, 'destroy'])
                ->middleware('permission:qr.manage')->name('destroy');
        });

        // ── QR SESSION ────────────────────────────────────────────
        Route::prefix('qr-sessions')->name('qr-sessions.')->group(function () {
            Route::get('/{qrDisplay}/current',   [QrSessionController::class, 'current'])
                ->middleware('permission:qr.view')->name('current');
            Route::post('/{qrDisplay}/generate', [QrSessionController::class, 'generate'])
                ->middleware('permission:qr.manage')->name('generate');
        });

        // ── EMPLOYEES ─────────────────────────────────────────────
        Route::prefix('employees')->name('employees.')->group(function () {
            Route::get('/', [EmployeeController::class, 'index'])
                ->middleware('permission:employees.view')->name('index');
            Route::get('/{employee}', [EmployeeController::class, 'show'])
                ->middleware('permission:employees.view')->name('show');
            Route::post('/', [EmployeeController::class, 'store'])
                ->middleware('permission:employees.create')->name('store');
            // PATCH dengan POST untuk support file upload via multipart/form-data
            // Frontend kirim _method=PATCH di body form
            Route::post('/{employee}', [EmployeeController::class, 'update'])
                ->middleware('permission:employees.edit')->name('update');
            Route::delete('/{employee}', [EmployeeController::class, 'destroy'])
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
                Route::get('/{company}',     [CompanyController::class, 'show'])->name('show');
                Route::post('/',             [CompanyController::class, 'store'])->name('store');
                Route::patch('/{company}',   [CompanyController::class, 'update'])->name('update');
                Route::delete('/{company}',  [CompanyController::class, 'destroy'])->name('destroy');
            });

        // Sites
        Route::prefix('sites')->name('sites.')->group(function () {
            Route::get('/',       [SiteController::class, 'index'])
                ->middleware('permission:sites.view')->name('index');
            Route::get('/{site}', [SiteController::class, 'show'])
                ->middleware('permission:sites.view')->name('show');
            Route::post('/', [SiteController::class, 'store'])
                ->middleware('permission:sites.create')->name('store');
            Route::patch('/{site}', [SiteController::class, 'update'])
                ->middleware('permission:sites.edit')->name('update');
            Route::delete('/{site}', [SiteController::class, 'destroy'])
                ->middleware('permission:sites.delete')->name('destroy');
        });

        // Departments
        Route::prefix('departments')->name('departments.')
            ->middleware('permission:departments.manage')->group(function () {
                Route::get('/',                [DepartmentController::class, 'index'])->name('index');
                Route::get('/{department}',    [DepartmentController::class, 'show'])->name('show');
                Route::post('/',               [DepartmentController::class, 'store'])->name('store');
                Route::patch('/{department}',  [DepartmentController::class, 'update'])->name('update');
                Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('destroy');
            });

        // Positions
        Route::prefix('positions')->name('positions.')
            ->middleware('permission:positions.manage')->group(function () {
                Route::get('/',              [PositionController::class, 'index'])->name('index');
                Route::get('/{position}',    [PositionController::class, 'show'])->name('show');
                Route::post('/',             [PositionController::class, 'store'])->name('store');
                Route::patch('/{position}',  [PositionController::class, 'update'])->name('update');
                Route::delete('/{position}', [PositionController::class, 'destroy'])->name('destroy');
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
                Route::patch('/{device}/block',  [DeviceController::class, 'block'])->name('block');
                Route::delete('/{device}/reset', [DeviceController::class, 'reset'])->name('reset');
            });

        // ── USER MANAGEMENT ───────────────────────────────────────
        Route::prefix('users')->name('users.')
            ->middleware('permission:users.manage')->group(function () {
                Route::get('/',    [App\Http\Controllers\Api\UserController::class, 'index'])->name('index');
                Route::get('/{user}', [App\Http\Controllers\Api\UserController::class, 'show'])->name('show');
                Route::patch('/{user}/toggle-active',  [App\Http\Controllers\Api\UserController::class, 'toggleActive'])->name('toggle-active');
                Route::patch('/{user}/reset-password', [App\Http\Controllers\Api\UserController::class, 'resetPassword'])->name('reset-password');
                Route::patch('/{user}/unlock',         [App\Http\Controllers\Api\UserController::class, 'unlock'])->name('unlock');
                Route::patch('/{user}/change-role',    [App\Http\Controllers\Api\UserController::class, 'changeRole'])->name('change-role');
            });

    }); // end middleware
}); // end prefix v1
