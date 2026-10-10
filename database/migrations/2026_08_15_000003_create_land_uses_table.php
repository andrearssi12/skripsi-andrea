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
        Schema::create('land_uses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campus_id')->constrained('campuses')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('land_use_categories')->restrictOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('land_uses')->nullOnDelete();
            $table->string('code')->nullable()->index();
            $table->string('name');
            $table->decimal('area_size', 12, 2)->default(0); // in square meters (m2)
            $table->enum('green_status', ['Green Area', 'Vegetasi Non-RTH', 'Non-Green Area'])->default('Non-Green Area');
            $table->enum('condition', ['Baik', 'Sedang', 'Kurang'])->default('Baik');
            $table->json('geometry'); // GeoJSON Polygon or MultiPolygon
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['campus_id', 'green_status']);
            $table->index(['campus_id', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('land_uses');
    }
};
