<?php

namespace Tests\Unit;

use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Models\User;
use App\Services\GreenAreaAnalysisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GreenAreaAnalysisServiceTest extends TestCase
{
    use RefreshDatabase;

    protected GreenAreaAnalysisService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GreenAreaAnalysisService();
    }

    public function test_it_calculates_green_area_percentage_correctly(): void
    {
        $campus = Campus::create([
            'code' => 'TEST-01',
            'name' => 'Test Campus',
            'total_area' => 10000.00, // 10,000 m2
        ]);

        $category = LandUseCategory::create([
            'name' => 'Taman',
            'color' => '#10b981',
        ]);

        // Create 2000 m2 Green Area (20%)
        LandUse::create([
            'campus_id' => $campus->id,
            'category_id' => $category->id,
            'name' => 'Taman Hijau',
            'area_size' => 2000.00,
            'green_status' => 'Green Area',
            'condition' => 'Baik',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [[[0,0], [1,0], [1,1], [0,1], [0,0]]],
            ],
        ]);

        // Create 1000 m2 Vegetasi Non-RTH (10%)
        LandUse::create([
            'campus_id' => $campus->id,
            'category_id' => $category->id,
            'name' => 'Pohon Parkiran',
            'area_size' => 1000.00,
            'green_status' => 'Vegetasi Non-RTH',
            'condition' => 'Baik',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [[[0,0], [1,0], [1,1], [0,1], [0,0]]],
            ],
        ]);

        $result = $this->service->analyze($campus->id);

        $this->assertEquals(10000.00, $result['total_campus_area']);
        $this->assertEquals(2000.00, $result['green_area_size']);
        $this->assertEquals(1000.00, $result['vegetasi_non_rth_size']);
        $this->assertEquals(3000.00, $result['total_vegetated_size']);
        $this->assertEquals(20.00, $result['green_percentage']);
        $this->assertEquals(30.00, $result['vegetated_percentage']);
        $this->assertFalse($result['is_achieved']);
        $this->assertEquals(10.00, $result['gap_percentage']);
        $this->assertEquals(1000.00, $result['gap_area_size']);
        $this->assertTrue($result['is_vegetated_achieved']);
        $this->assertEquals(0.00, $result['vegetated_gap_percentage']);
        $this->assertEquals(0.00, $result['vegetated_gap_area_size']);
        $this->assertEquals('Target Belum Tercapai', $result['status_text']);
    }

    public function test_it_marks_target_achieved_when_green_percentage_reaches_30_percent(): void
    {
        $campus = Campus::create([
            'code' => 'TEST-02',
            'name' => 'Green Campus UAD',
            'total_area' => 10000.00,
        ]);

        $category = LandUseCategory::create([
            'name' => 'Hutan Kampus',
            'color' => '#059669',
        ]);

        // Create 3500 m2 Green Area (35% >= 30%)
        LandUse::create([
            'campus_id' => $campus->id,
            'category_id' => $category->id,
            'name' => 'Hutan Konservasi',
            'area_size' => 3500.00,
            'green_status' => 'Green Area',
            'condition' => 'Baik',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [[[0,0], [1,0], [1,1], [0,1], [0,0]]],
            ],
        ]);

        $result = $this->service->analyze($campus->id);

        $this->assertEquals(35.00, $result['green_percentage']);
        $this->assertTrue($result['is_achieved']);
        $this->assertEquals(0.00, $result['gap_percentage']);
        $this->assertEquals(0.00, $result['gap_area_size']);
        $this->assertEquals('Target Tercapai', $result['status_text']);
    }
}
