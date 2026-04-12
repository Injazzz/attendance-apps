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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code', 20)->unique();
            $table->string('full_name', 100);
            $table->string('email', 100)->unique();
            $table->string('phone', 15)->nullable();
            $table->string('id_card', 50)->nullable();
            $table->string('npwp', 25)->nullable();
            $table->string('birthplace', 50)->nullable();
            $table->date('birthdate')->nullable();
            $table->enum('gender', ['male','female']);
            $table->enum('marital_status', ['single','married','divorced','widowed'])->default('single');
            $table->enum('tax_status', ['TK0','TK1','TK2','TK3','K0','K1','K2','K3'])->default('TK0');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->foreignId('site_id')->nullable()->constrained('company_sites')->nullOnDelete();
            $table->date('hire_date');
            $table->date('permanent_date')->nullable();
            $table->enum('employment_type', ['permanent','contract','probation','outsource','daily_worker']);
            $table->enum('status', ['active','inactive','resigned','terminated'])->default('active');
            $table->date('resignation_date')->nullable();
            $table->text('resignation_reason')->nullable();
            $table->string('emergency_contact', 100)->nullable();
            $table->string('emergency_phone', 15)->nullable();
            $table->string('photo_path', 255)->nullable();
            $table->timestamps();

            // Indexes untuk query performance
            $table->index(['status', 'department_id']);
            $table->index(['site_id', 'status']);
            $table->index('employee_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
