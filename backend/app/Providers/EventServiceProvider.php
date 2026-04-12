<?php

namespace App\Providers;

use App\Events\NewOvertimeRequest;
use App\Events\OvertimeStatusChanged;
use App\Events\QrSessionRotated;
use App\Listeners\SendNewOvertimeNotification;
use App\Listeners\SendOvertimeStatusNotification;
use App\Listeners\SendQrRotatedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Saat QR session di-rotate → kirim ke layar display
        QrSessionRotated::class => [
            SendQrRotatedNotification::class,
        ],

        // Saat ada pengajuan lembur baru → notifikasi ke supervisor
        NewOvertimeRequest::class => [
            SendNewOvertimeNotification::class,
        ],

        // Saat status lembur berubah → notifikasi ke karyawan
        OvertimeStatusChanged::class => [
            SendOvertimeStatusNotification::class,
        ],
    ];

    public function boot(): void {}

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
