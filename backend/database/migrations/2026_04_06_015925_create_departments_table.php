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
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('dept_code', 10);
            $table->string('dept_name', 50);
            $table->string('cost_center', 20)->nullable();
            $table->unsignedBigInteger('department_head_id')->nullable();
            $table->unsignedBigInteger('parent_department_id')->nullable();
            $table->timestamps();
            $table->unique(['company_id','dept_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
