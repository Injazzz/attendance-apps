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
        Schema::create('overtime_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('site_id')
                ->constrained('company_sites')
                ->cascadeOnDelete();

            $table->date('overtime_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('total_hours', 4, 2)->default(0);
            $table->text('reason');

            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending');

            // approved_by mengacu ke employees, bukan users
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->foreign('approved_by')
                ->references('id')
                ->on('employees')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            // Index untuk query performa
            $table->index(['employee_id', 'status']);
            $table->index(['employee_id', 'overtime_date']);
            $table->index(['site_id', 'status']);
            $table->index(['status', 'overtime_date']);

            // Satu karyawan hanya boleh punya satu pengajuan per tanggal
            $table->unique(['employee_id', 'overtime_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overtime_requests');
    }
};
