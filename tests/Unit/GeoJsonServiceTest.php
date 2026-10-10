<?php

namespace Tests\Unit;

use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Services\GeoJsonService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeoJsonServiceTest extends TestCase
{
    use RefreshDatabase;

    protected GeoJsonService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GeoJsonService();
    }

    public function test_validates_correct_polygon_geometry(): void
    {
        $validPolygon = [
            'type' => 'Polygon',
            'coordinates' => [
                [[110.381, -7.831], [110.385, -7.831], [110.385, -7.835], [110.381, -7.835], [110.381, -7.831]],
            ],
        ];

        $res = $this->service->validateGeometry($validPolygon);
        $this->assertTrue($res['valid']);
    }

    public function test_rejects_point_or_empty_geometry(): void
    {
        $invalidPoint = [
            'type' => 'Point',
            'coordinates' => [110.381, -7.831],
        ];

        $res = $this->service->validateGeometry($invalidPoint);
        $this->assertFalse($res['valid']);
    }

    public function test_converts_land_use_collection_to_feature_collection(): void
    {
        $campus = Campus::create([
            'code' => 'CAMPUS-01',
            'name' => 'Campus One',
            'total_area' => 50000,
        ]);

        $category = LandUseCategory::create([
            'name' => 'Taman',
            'color' => '#10b981',
        ]);

        $landUse = LandUse::create([
            'campus_id' => $campus->id,
            'category_id' => $category->id,
            'name' => 'Taman Herbal',
            'area_size' => 1500,
            'green_status' => 'Green Area',
            'condition' => 'Baik',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [[[0,0], [1,0], [1,1], [0,1], [0,0]]],
            ],
        ]);

        $featureCollection = $this->service->toFeatureCollection(collect([$landUse]));

        $this->assertEquals('FeatureCollection', $featureCollection['type']);
        $this->assertCount(1, $featureCollection['features']);
        $this->assertEquals('Taman Herbal', $featureCollection['features'][0]['properties']['name']);
        $this->assertEquals('#10b981', $featureCollection['features'][0]['properties']['category_color']);
    }
}
