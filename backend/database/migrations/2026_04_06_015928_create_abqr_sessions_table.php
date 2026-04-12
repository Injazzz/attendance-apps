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
        Schema::create('qr_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_token', 100)->unique();
            $table->foreignId('display_id')->constrained('qr_displays')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('company_sites');
            $table->text('qr_data');
            $table->enum('qr_type', ['check_in','check_out']);
            $table->timestamp('valid_from');
            $table->timestamp('valid_to');
            $table->integer('current_scans')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Critical index untuk validasi QR cepat
            $table->index(['session_token', 'is_active']);
            $table->index(['display_id', 'is_active']);
            $table->index('valid_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_sessions');
    }
};
