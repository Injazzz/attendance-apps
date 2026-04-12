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
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_family_id')->nullable()->constrained('job_families')->cascadeOnDelete();
            $table->string('position_code', 20)->unique();
            $table->string('position_name', 100);
            $table->string('position_level', 50)->nullable();
            $table->text('job_description')->nullable();
            $table->text('min_qualification')->nullable();
            $table->json('custom_permissions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
