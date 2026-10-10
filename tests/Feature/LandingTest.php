<?php

namespace Tests\Feature;

use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_renders_with_all_required_props(): void
    {
        $campus = Campus::create([
            'code' => 'KAMPUS-TEST',
            'name' => 'Kampus UAD Test',
            'total_area' => 15000,
            'boundary_geometry' => [
                'type' => 'Polygon',
                'coordinates' => [
                    [[110.0, -8.0], [111.0, -8.0], [111.0, -7.0], [110.0, -7.0], [110.0, -8.0]],
                ],
            ],
        ]);

        $category = LandUseCategory::create([
            'name' => 'Taman Hijau',
            'color' => '#10b981',
        ]);

        LandUse::create([
            'campus_id' => $campus->id,
            'category_id' => $category->id,
            'name' => 'Taman Kampus Test',
            'area_size' => 1200.0,
            'green_status' => 'Green Area',
            'condition' => 'Baik',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [
                    [[110.38, -7.83], [110.39, -7.83], [110.39, -7.84], [110.38, -7.84], [110.38, -7.83]],
                ],
            ],
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Landing/Index')
            ->has('analysis')
            ->has('recommendations')
            ->has('analysisByCampus')
            ->has('spatialRecommendations')
            ->has('spatialRecsByCampus')
            ->has('campuses')
            ->has('categories')
            ->has('selectedCampusId')
            ->has('allLandUses')
            ->has('landUsesGeoJson')
            ->has('campusBoundaries')
            ->has('feedbackGeoJson')
            ->has('recentFeedback')
            ->has('approvedSpatialPlansGeoJson')
        );
    }

    public function test_landing_page_accepts_campus_id_filter(): void
    {
        $campus1 = Campus::create([
            'code' => 'KAMPUS-1',
            'name' => 'Kampus 1',
            'total_area' => 10000,
        ]);

        $campus2 = Campus::create([
            'code' => 'KAMPUS-2',
            'name' => 'Kampus 2',
            'total_area' => 20000,
        ]);

        $response = $this->get('/?campus_id=' . $campus2->id);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Landing/Index')
            ->where('selectedCampusId', $campus2->id)
        );
    }
}
