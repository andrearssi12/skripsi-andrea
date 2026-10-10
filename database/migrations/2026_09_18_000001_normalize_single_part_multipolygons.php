<?php

use App\Models\Campus;
use App\Models\LandUse;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Normalize single-part MultiPolygon in campuses
        Campus::all()->each(function (Campus $campus) {
            $geom = $campus->boundary_geometry;
            if (is_string($geom)) {
                $geom = json_decode($geom, true);
            }

            if (is_array($geom) && ($geom['type'] ?? '') === 'MultiPolygon' && count($geom['coordinates'] ?? []) === 1) {
                $campus->boundary_geometry = [
                    'type' => 'Polygon',
                    'coordinates' => $geom['coordinates'][0],
                ];
                $campus->saveQuietly();
            }
        });

        // Normalize single-part MultiPolygon in land_uses
        LandUse::all()->each(function (LandUse $landUse) {
            $geom = $landUse->geometry;
            if (is_string($geom)) {
                $geom = json_decode($geom, true);
            }

            if (is_array($geom) && ($geom['type'] ?? '') === 'MultiPolygon' && count($geom['coordinates'] ?? []) === 1) {
                $landUse->geometry = [
                    'type' => 'Polygon',
                    'coordinates' => $geom['coordinates'][0],
                ];
                $landUse->saveQuietly();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert is not strictly necessary as Polygon is compatible everywhere
    }
};
