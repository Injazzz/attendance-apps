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
        Schema::create('pwa_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('device_fingerprint', 255);
            $table->string('browser_token', 255)->unique();
            $table->json('device_info')->nullable();
            $table->timestamp('last_active')->nullable();
            $table->enum('status', ['active','blocked','inactive'])->default('active');
            $table->timestamps();
            $table->index(['user_id','status']);
            $table->index('browser_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pwa_devices');
    }
};
