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
        Schema::create('campus_spatial_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campus_id')->constrained('campuses')->cascadeOnDelete();
            $table->foreignId('land_use_id')->nullable()->constrained('land_uses')->nullOnDelete();
            $table->string('title');
            $table->string('pillar_type')->default('conservation'); // conservation | rth_conversion | revitalization | green_roof | canopy_tree | green_corridor
            $table->text('description')->nullable();
            $table->string('target_year')->nullable(); // e.g. '2026', '2027', '2026-2028'
            $table->decimal('area_size', 12, 2)->default(0);
            $table->decimal('potential_gain_percent', 5, 2)->default(0);
            $table->enum('status', ['draft', 'approved', 'implemented'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['campus_id', 'status']);
            $table->index('pillar_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campus_spatial_plans');
    }
};
