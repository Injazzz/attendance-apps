<?php

use App\Jobs\GenerateDailyAttendanceSummary;
use App\Models\Notification;
use App\Models\PwaDevice;
use App\Services\QrService;
use Illuminate\Support\Facades\Schedule;

// Expire QR session yang sudah habis waktu dan auto-generate baru
Schedule::call(function () {
        app(QrService::class)->expireOldSessions();
    })->name('qr.expire')->everyMinute()->withoutOverlapping();

// Rekap attendance harian — jalan tengah malam setiap hari
Schedule::job(new GenerateDailyAttendanceSummary())
    ->name('attendance.daily-summary')
    ->dailyAt('00:05')
    ->withoutOverlapping();

// Bersihkan device yang sudah tidak aktif lebih dari 90 hari
Schedule::call(function () {
    PwaDevice::where('last_active', '<', now()->subDays(90))
        ->where('status', 'active')
        ->update(['status' => 'inactive']);
})->weekly()->name('devices.cleanup');

// Bersihkan notifikasi yang sudah lebih dari 30 hari
Schedule::call(function () {
    Notification::where('created_at', '<', now()->subDays(30))
        ->where('is_read', true)
        ->delete();
})->daily()->name('notifications.cleanup');
