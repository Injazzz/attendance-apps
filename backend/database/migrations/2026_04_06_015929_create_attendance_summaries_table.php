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
        Schema::create('attendance_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('company_sites');
            $table->string('display_code', 50)->unique();
            $table->string('display_name', 100);
            $table->string('location', 200)->nullable();
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->enum('qr_type', ['check_in','check_out'])->default('check_in');
            $table->enum('refresh_mode', ['time_based','scan_based'])->default('time_based');
            $table->integer('time_interval')->default(30);
            $table->integer('max_scans')->nullable();
            $table->enum('status', ['active','inactive','maintenance'])->default('active');
            $table->timestamps();
            $table->index(['site_id','status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_summaries');
    }
};
