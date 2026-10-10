<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandUseCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_land_use_inside_campus_boundary(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Campus boundary covering lat: [-8, -7], lng: [110, 111]
        $campus = Campus::create([
            'code' => 'KAMPUS-TEST',
            'name' => 'Kampus UAD Test',
            'total_area' => 20000,
            'boundary_geometry' => [
                'type' => 'Polygon',
                'coordinates' => [
                    [[110.0, -8.0], [111.0, -8.0], [111.0, -7.0], [110.0, -7.0], [110.0, -8.0]],
                ],
            ],
        ]);

        $category = LandUseCategory::create([
            'name' => 'Taman',
            'color' => '#10b981',
        ]);

        // Polygon inside boundary
        $response = $this->actingAs($admin)->post('/land-uses', [
            'campus_id' => $campus->id,
            'category_id' => $category->id,
            'name' => 'Taman Percobaan',
            'code' => 'TP-01',
            'area_size' => 500.00,
            'green_status' => 'Green Area',
            'condition' => 'Baik',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [
                    [[110.38, -7.83], [110.39, -7.83], [110.39, -7.84], [110.38, -7.84], [110.38, -7.83]],
                ],
            ],
            'description' => 'Taman uji coba pemetaan.',
        ]);

        $response->assertRedirect('/land-uses');

        $this->assertDatabaseHas('land_uses', [
            'name' => 'Taman Percobaan',
            'green_status' => 'Green Area',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'create',
            'module' => 'land_use',
        ]);
    }

    public function test_rejects_land_use_polygon_outside_campus_boundary(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Campus boundary in [110.0 - 110.1, -7.9 - -7.8]
        $campus = Campus::create([
            'code' => 'KAMPUS-T1',
            'name' => 'Kampus 1',
            'total_area' => 10000,
            'boundary_geometry' => [
                'type' => 'Polygon',
                'coordinates' => [
                    [[110.0, -7.9], [110.1, -7.9], [110.1, -7.8], [110.0, -7.8], [110.0, -7.9]],
                ],
            ],
        ]);

        $category = LandUseCategory::create([
            'name' => 'Taman',
            'color' => '#10b981',
        ]);

        // Polygon way outside boundary (lng: 115.0)
        $response = $this->actingAs($admin)->post('/land-uses', [
            'campus_id' => $campus->id,
            'category_id' => $category->id,
            'name' => 'Taman Luar Kampus',
            'area_size' => 200.00,
            'green_status' => 'Green Area',
            'condition' => 'Baik',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [
                    [[115.0, -7.83], [115.01, -7.83], [115.01, -7.84], [115.0, -7.84], [115.0, -7.83]],
                ],
            ],
        ]);

        $response->assertSessionHasErrors('geometry');

        $this->assertDatabaseMissing('land_uses', [
            'name' => 'Taman Luar Kampus',
        ]);
    }
}
