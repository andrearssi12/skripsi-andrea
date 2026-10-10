<?php

namespace App\Services;

use App\Models\Campus;
use App\Models\LandUse;
use Illuminate\Support\Collection;

class GeoJsonService
{
    /**
     * Build GeoJSON FeatureCollection for LandUse items.
     *
     * @param Collection|array $landUses
     */
    public function toFeatureCollection($landUses): array
    {
        $features = [];

        foreach ($landUses as $item) {
            $geometry = is_string($item->geometry)
                ? json_decode($item->geometry, true)
                : $item->geometry;

            if (empty($geometry) || !is_array($geometry)) {
                continue;
            }

            $feedbacks = [];
            if ($item->relationLoaded('feedback') && $item->feedback) {
                $feedbacks = $item->feedback->map(fn($fb) => [
                    'id' => $fb->id,
                    'title' => $fb->title,
                    'message' => $fb->message,
                    'status' => $fb->status,
                    'image_url' => $fb->image ? asset('storage/' . $fb->image) : null,
                    'user_name' => $fb->user?->name ?? 'Civitas UAD',
                    'created_at' => $fb->created_at?->format('d M Y, H:i'),
                ])->values()->all();
            }

            $features[] = [
                'type' => 'Feature',
                'id' => $item->id,
                'properties' => [
                    'id' => $item->id,
                    'code' => $item->code,
                    'name' => $item->name,
                    'category_id' => $item->category_id,
                    'category_name' => $item->category?->name ?? 'Lainnya',
                    'category_color' => $item->category?->color ?? '#64748b',
                    'category_icon' => $item->category?->icon,
                    'campus_id' => $item->campus_id,
                    'campus_name' => $item->campus?->name ?? '-',
                    'parent_id' => $item->parent_id,
                    'parent_name' => $item->parent?->name,
                    'area_size' => (float) $item->area_size,
                    'green_status' => $item->green_status,
                    'condition' => $item->condition,
                    'description' => $item->description,
                    'feedbacks' => $feedbacks,
                    'feedbacks_count' => count($feedbacks),
                    'created_at' => $item->created_at?->toIso8601String(),
                    'updated_at' => $item->updated_at?->toIso8601String(),
                ],
                'geometry' => $geometry,
            ];
        }

        return [
            'type' => 'FeatureCollection',
            'features' => $features,
        ];
    }

    /**
     * Build GeoJSON FeatureCollection for Campus boundary.
     */
    public function campusToFeatureCollection(Campus $campus): ?array
    {
        $geometry = is_string($campus->boundary_geometry)
            ? json_decode($campus->boundary_geometry, true)
            : $campus->boundary_geometry;

        if (empty($geometry) || !is_array($geometry)) {
            return null;
        }

        return [
            'type' => 'FeatureCollection',
            'features' => [
                [
                    'type' => 'Feature',
                    'id' => $campus->id,
                    'properties' => [
                        'id' => $campus->id,
                        'code' => $campus->code,
                        'name' => $campus->name,
                        'address' => $campus->address,
                        'total_area' => (float) $campus->total_area,
                        'description' => $campus->description,
                        'type' => 'campus_boundary',
                    ],
                    'geometry' => $geometry,
                ],
            ],
        ];
    }

    /**
     * Validate GeoJSON geometry array.
     */
    public function validateGeometry($geometry): array
    {
        if (is_string($geometry)) {
            $decoded = json_decode($geometry, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return ['valid' => false, 'error' => 'Format GeoJSON string tidak valid.'];
            }
            $geometry = $decoded;
        }

        if (!is_array($geometry)) {
            return ['valid' => false, 'error' => 'Data geometry harus berupa array / JSON object.'];
        }

        // If user uploaded a Feature or FeatureCollection, extract geometry
        if (isset($geometry['type']) && $geometry['type'] === 'Feature' && isset($geometry['geometry'])) {
            $geometry = $geometry['geometry'];
        }

        if (!isset($geometry['type']) || !in_array($geometry['type'], ['Polygon', 'MultiPolygon'])) {
            return ['valid' => false, 'error' => 'Tipe geometry harus berupa Polygon atau MultiPolygon.'];
        }

        if (!isset($geometry['coordinates']) || !is_array($geometry['coordinates']) || empty($geometry['coordinates'])) {
            return ['valid' => false, 'error' => 'Koordinat polygon tidak boleh kosong.'];
        }

        // Normalize single-part MultiPolygon (standard QGIS export output) to Polygon
        if ($geometry['type'] === 'MultiPolygon' && count($geometry['coordinates']) === 1) {
            $geometry = [
                'type' => 'Polygon',
                'coordinates' => $geometry['coordinates'][0],
            ];
        }

        return [
            'valid' => true,
            'geometry' => $geometry,
        ];
    }

    /**
     * Verify if a polygon geometry is strictly inside a campus boundary.
     * Uses Ray-Casting algorithm to test containment of all vertices.
     */
    public function isPolygonInsideBoundary(array $polygonGeometry, $campusBoundaryGeometry): bool
    {
        if (empty($campusBoundaryGeometry)) {
            return true; // No boundary configured, allow by default
        }

        if (is_string($campusBoundaryGeometry)) {
            $campusBoundaryGeometry = json_decode($campusBoundaryGeometry, true);
        }

        if (!isset($campusBoundaryGeometry['type']) || !isset($campusBoundaryGeometry['coordinates'])) {
            return true;
        }

        // Extract boundary rings
        $boundaryRings = [];
        if ($campusBoundaryGeometry['type'] === 'Polygon') {
            $boundaryRings[] = $campusBoundaryGeometry['coordinates'][0];
        } elseif ($campusBoundaryGeometry['type'] === 'MultiPolygon') {
            foreach ($campusBoundaryGeometry['coordinates'] as $poly) {
                $boundaryRings[] = $poly[0];
            }
        }

        if (empty($boundaryRings)) {
            return true;
        }

        // Extract all vertices of the polygon to test
        $vertices = [];
        if ($polygonGeometry['type'] === 'Polygon') {
            foreach ($polygonGeometry['coordinates'][0] ?? [] as $coord) {
                $vertices[] = $coord;
            }
        } elseif ($polygonGeometry['type'] === 'MultiPolygon') {
            foreach ($polygonGeometry['coordinates'] as $poly) {
                foreach ($poly[0] ?? [] as $coord) {
                    $vertices[] = $coord;
                }
            }
        }

        if (empty($vertices)) {
            return false;
        }

        // Every vertex must fall inside at least one boundary ring (or within slight epsilon 0.00005 deg tolerance)
        foreach ($vertices as $vertex) {
            $insideAny = false;
            foreach ($boundaryRings as $ring) {
                if ($this->isPointInPolygon($vertex, $ring)) {
                    $insideAny = true;
                    break;
                }
            }

            if (!$insideAny) {
                return false;
            }
        }

        return true;
    }

    /**
     * Ray-Casting algorithm for 2D Point-in-Polygon test.
     * $point = [lng, lat]
     * $ring = [[lng, lat], ...]
     */
    public function isPointInPolygon(array $point, array $ring): bool
    {
        $x = $point[0]; // lng
        $y = $point[1]; // lat
        $inside = false;
        $count = count($ring);

        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            $xi = $ring[$i][0];
            $yi = $ring[$i][1];
            $xj = $ring[$j][0];
            $yj = $ring[$j][1];

            $intersect = (($yi > $y) !== ($yj > $y))
                && ($x < ($xj - $xi) * ($y - $yi) / (($yj - $yi) ?: 0.000000001) + $xi);

            if ($intersect) {
                $inside = !$inside;
            }
        }

        return $inside;
    }

    /**
     * Approximate calculation of polygon area in square meters using spherical coordinates (Haversine/planar approx).
     */
    public function calculateAreaM2(array $geometry): float
    {
        if (!isset($geometry['type']) || !isset($geometry['coordinates'])) {
            return 0.0;
        }

        $type = $geometry['type'];
        $coordinates = $geometry['coordinates'];
        $totalArea = 0.0;

        if ($type === 'Polygon') {
            $totalArea = $this->ringArea($coordinates[0] ?? []);
        } elseif ($type === 'MultiPolygon') {
            foreach ($coordinates as $polyCoords) {
                $totalArea += $this->ringArea($polyCoords[0] ?? []);
            }
        }

        return round(abs($totalArea), 2);
    }

    /**
     * Calculate spherical polygon ring area in m2.
     */
    private function ringArea(array $coords): float
    {
        $count = count($coords);
        if ($count < 3) {
            return 0.0;
        }

        $area = 0.0;
        $radius = 6378137; // WGS84 Earth radius in meters

        for ($i = 0; $i < $count - 1; $i++) {
            $p1 = $coords[$i];
            $p2 = $coords[$i + 1];

            $lon1 = deg2rad($p1[0]);
            $lat1 = deg2rad($p1[1]);
            $lon2 = deg2rad($p2[0]);
            $lat2 = deg2rad($p2[1]);

            $area += ($lon2 - $lon1) * (2 + sin($lat1) + sin($lat2));
        }

        $area = ($area * $radius * $radius) / 2.0;
        return abs($area);
    }

    /**
     * Compute approximate centroid [lat, lng] of a Polygon or MultiPolygon geometry.
     */
    public function computeCentroid($geometry): ?array
    {
        if (is_string($geometry)) {
            $geometry = json_decode($geometry, true);
        }

        if (empty($geometry) || !isset($geometry['type']) || !isset($geometry['coordinates'])) {
            return null;
        }

        $coords = [];
        if ($geometry['type'] === 'Polygon') {
            $coords = $geometry['coordinates'][0] ?? [];
        } elseif ($geometry['type'] === 'MultiPolygon') {
            $coords = $geometry['coordinates'][0][0] ?? [];
        }

        if (empty($coords)) {
            return null;
        }

        $sumLng = 0.0;
        $sumLat = 0.0;
        $count = count($coords);

        foreach ($coords as $pt) {
            $sumLng += (float) $pt[0];
            $sumLat += (float) $pt[1];
        }

        return [
            'lat' => round($sumLat / $count, 6),
            'lng' => round($sumLng / $count, 6),
        ];
    }

    /**
     * Build GeoJSON FeatureCollection and density data for user feedbacks.
     *
     * @param Collection|array $feedbackList
     */
    public function buildFeedbackGeoJson($feedbackList): array
    {
        $features = [];
        $densityByLandUse = [];
        $groupedByLandUse = [];

        foreach ($feedbackList as $fb) {
            $key = $fb->land_use_id ? 'lu_' . $fb->land_use_id : 'camp_' . ($fb->campus_id ?? 0) . '_fb_' . $fb->id;
            $groupedByLandUse[$key][] = $fb;

            if ($fb->land_use_id) {
                $densityByLandUse[$fb->land_use_id] = ($densityByLandUse[$fb->land_use_id] ?? 0) + 1;
            }
        }

        foreach ($groupedByLandUse as $feedbacks) {
            $firstFb = $feedbacks[0];
            $lu = $firstFb->landUse;
            $centroid = null;

            if ($lu && !empty($lu->geometry)) {
                $centroid = $this->computeCentroid($lu->geometry);
            } elseif ($firstFb->campus && !empty($firstFb->campus->boundary_geometry)) {
                $centroid = $this->computeCentroid($firstFb->campus->boundary_geometry);
            }

            if (!$centroid) {
                continue;
            }

            $mappedFeedbacks = array_map(function ($fb) use ($lu) {
                return [
                    'id' => $fb->id,
                    'title' => $fb->title,
                    'message' => $fb->message,
                    'status' => $fb->status,
                    'image_url' => $fb->image ? asset('storage/' . $fb->image) : null,
                    'user_name' => $fb->user?->name ?? 'Civitas UAD',
                    'land_use_id' => $fb->land_use_id,
                    'land_use_name' => $lu?->name ?? 'Laporan Umum Kampus',
                    'campus_id' => $lu?->campus_id ?? $fb->campus_id,
                    'campus_name' => $lu?->campus?->name ?? $fb->campus?->name ?? 'Universitas Ahmad Dahlan',
                    'created_at' => $fb->created_at?->format('d M Y, H:i'),
                ];
            }, $feedbacks);

            // Determine priority status across the grouped feedbacks
            $hasPending = collect($feedbacks)->contains('status', 'Pending');
            $hasDiproses = collect($feedbacks)->contains(fn($f) => in_array($f->status, ['Diproses', 'Reviewed']));
            $primaryStatus = $hasPending ? 'Pending' : ($hasDiproses ? 'Diproses' : $firstFb->status);

            $features[] = [
                'type' => 'Feature',
                'id' => $firstFb->id,
                'properties' => [
                    'id' => $firstFb->id,
                    'title' => count($mappedFeedbacks) > 1 
                        ? count($mappedFeedbacks) . ' Laporan di ' . ($lu?->name ?? 'Lokasi Ini')
                        : $firstFb->title,
                    'message' => $firstFb->message,
                    'status' => $primaryStatus,
                    'image_url' => $firstFb->image ? asset('storage/' . $firstFb->image) : null,
                    'user_name' => $firstFb->user?->name ?? 'Civitas UAD',
                    'land_use_id' => $firstFb->land_use_id,
                    'land_use_name' => $lu?->name ?? 'Laporan Umum Kampus',
                    'campus_id' => $lu?->campus_id ?? $firstFb->campus_id,
                    'campus_name' => $lu?->campus?->name ?? $firstFb->campus?->name ?? 'Universitas Ahmad Dahlan',
                    'created_at' => $firstFb->created_at?->format('d M Y, H:i'),
                    'count' => count($mappedFeedbacks),
                    'feedbacks' => $mappedFeedbacks,
                ],
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [$centroid['lng'], $centroid['lat']],
                ],
            ];
        }

        return [
            'type' => 'FeatureCollection',
            'features' => $features,
            'density_by_land_use' => $densityByLandUse,
        ];
    }

    /**
     * Build GeoJSON FeatureCollection for Campus Spatial Plans.
     *
     * @param Collection|array $plans
     */
    public function buildSpatialPlansGeoJson($plans): array
    {
        $features = [];

        foreach ($plans as $plan) {
            $geometry = $plan->effective_geometry;

            if (empty($geometry) || !is_array($geometry)) {
                continue;
            }

            $features[] = [
                'type' => 'Feature',
                'id' => 'plan_' . $plan->id,
                'properties' => [
                    'id' => $plan->id,
                    'plan_id' => $plan->id,
                    'title' => $plan->title,
                    'pillar_type' => $plan->pillar_type,
                    'description' => $plan->description,
                    'target_year' => $plan->target_year,
                    'area_size' => (float) $plan->area_size,
                    'potential_gain_percent' => (float) $plan->potential_gain_percent,
                    'status' => $plan->status,
                    'notes' => $plan->notes,
                    'campus_id' => $plan->campus_id,
                    'campus_name' => $plan->campus?->name ?? '-',
                    'land_use_id' => $plan->land_use_id,
                    'land_use_name' => $plan->landUse?->name ?? 'Kawasan Rencana Khusus',
                    'approved_at' => $plan->approved_at?->format('d M Y, H:i'),
                    'type' => 'spatial_plan',
                ],
                'geometry' => $geometry,
            ];
        }

        return [
            'type' => 'FeatureCollection',
            'features' => $features,
        ];
    }
}

