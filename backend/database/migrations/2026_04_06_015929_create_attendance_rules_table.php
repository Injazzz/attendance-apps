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
        Schema::create('attendance_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_name', 100);
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('late_threshold')->default(30);
            $table->decimal('late_deduction_per_minute', 10, 2)->default(0);
            $table->integer('late_grace_period')->default(15);
            $table->integer('max_late_minutes_per_month')->default(120);
            $table->integer('overtime_start_after')->default(60);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_rules');
    }
};
