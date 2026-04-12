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
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->foreignId('site_id')->constrained('company_sites');
            $table->date('attendance_date');
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->decimal('total_hours', 5, 2)->default(0);
            $table->decimal('regular_hours', 5, 2)->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->integer('late_minutes')->default(0);
            $table->integer('early_minutes')->default(0);
            $table->enum('status', [
                'present','late','absent','half_day',
                'leave','sick','business_trip'
            ])->default('present');
            $table->enum('shift_type', ['normal','morning','afternoon','night'])->default('normal');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Unique: satu record per karyawan per hari
            $table->unique(['employee_id', 'attendance_date']);
            // Composite indexes untuk query laporan
            $table->index(['attendance_date', 'site_id']);
            $table->index(['employee_id', 'attendance_date']);
            $table->index(['site_id', 'attendance_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
