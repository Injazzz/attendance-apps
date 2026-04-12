<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendance_scans', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('site_id')
                ->constrained('company_sites')
                ->cascadeOnDelete();

            // Nullable karena selfie tidak pakai QR session
            $table->foreignId('qr_session_id')
                ->nullable()
                ->constrained('qr_sessions')
                ->nullOnDelete();

            $table->enum('scan_type', ['check_in', 'check_out']);

            $table->timestamp('scan_time');
            $table->date('scan_date');

            // GPS data
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('location_accuracy', 5, 2)->nullable();

            // Info perangkat saat scan
            $table->json('device_info')->nullable();

            $table->enum('status', [
                'valid',
                'invalid',
                'late',
                'early',
                'manual',
            ])->default('valid');

            $table->text('notes')->nullable();

            $table->timestamps();

            // Index untuk query performa
            $table->index(['employee_id', 'scan_date']);
            $table->index(['employee_id', 'scan_type', 'scan_date']);
            $table->index(['site_id', 'scan_date']);
            $table->index('scan_date');

            // Satu karyawan hanya boleh satu check_in dan satu check_out per hari
            $table->unique(['employee_id', 'scan_type', 'scan_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_scans');
    }
};
