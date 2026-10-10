<?php

namespace App\Services;

use App\Models\Campus;
use App\Models\LandUse;
use Illuminate\Support\Collection;

class GreenAreaAnalysisService
{
    /**
     * Calculate comprehensive green area metrics for a specific campus or all campuses.
     */
    public function analyze(?int $campusId = null): array
    {
        $targetPercentage = (float) config('green_campus.target_green_percentage', 30.0);

        // Get campus query
        $campusQuery = Campus::query();
        if ($campusId) {
            $campusQuery->where('id', $campusId);
        }
        $campuses = $campusQuery->get();

        $totalCampusArea = (float) $campuses->sum('total_area');

        // Land uses query
        $landUseQuery = LandUse::with(['category', 'campus']);
        if ($campusId) {
            $landUseQuery->where('campus_id', $campusId);
        }
        $landUses = $landUseQuery->get();

        // Calculate green area sums
        $greenAreaSize = (float) $landUses
            ->where('green_status', 'Green Area')
            ->sum('area_size');

        $vegetasiNonRthSize = (float) $landUses
            ->where('green_status', 'Vegetasi Non-RTH')
            ->sum('area_size');

        $nonGreenAreaSize = (float) $landUses
            ->where('green_status', 'Non-Green Area')
            ->sum('area_size');

        $totalVegetatedSize = $greenAreaSize + $vegetasiNonRthSize;

        // Percentages against total campus area
        $greenPercentage = $totalCampusArea > 0
            ? round(($greenAreaSize / $totalCampusArea) * 100, 2)
            : 0.0;

        $vegetatedPercentage = $totalCampusArea > 0
            ? round(($totalVegetatedSize / $totalCampusArea) * 100, 2)
            : 0.0;

        $isAchieved = $greenPercentage >= $targetPercentage;
        $gapPercentage = $isAchieved ? 0.0 : round($targetPercentage - $greenPercentage, 2);
        $gapAreaSize = $isAchieved
            ? 0.0
            : round(($totalCampusArea * ($targetPercentage / 100)) - $greenAreaSize, 2);

        $statusText = $isAchieved ? 'Target Tercapai' : 'Target Belum Tercapai';

        // Distribution by category
        $categoryBreakdown = $landUses
            ->groupBy(fn ($item) => $item->category?->name ?? 'Lainnya')
            ->map(function (Collection $group, string $categoryName) use ($totalCampusArea) {
                $categorySum = (float) $group->sum('area_size');
                $categoryColor = $group->first()?->category?->color ?? '#64748b';
                return [
                    'name' => $categoryName,
                    'color' => $categoryColor,
                    'count' => $group->count(),
                    'total_area' => $categorySum,
                    'percentage' => $totalCampusArea > 0
                        ? round(($categorySum / $totalCampusArea) * 100, 2)
                        : 0.0,
                ];
            })
            ->values();

        // Distribution by green status
        $statusBreakdown = [
            [
                'status' => 'Green Area',
                'area_size' => $greenAreaSize,
                'percentage' => $greenPercentage,
                'color' => '#10b981', // green
            ],
            [
                'status' => 'Vegetasi Non-RTH',
                'area_size' => $vegetasiNonRthSize,
                'percentage' => $totalCampusArea > 0 ? round(($vegetasiNonRthSize / $totalCampusArea) * 100, 2) : 0.0,
                'color' => '#84cc16', // lime
            ],
            [
                'status' => 'Non-Green Area',
                'area_size' => $nonGreenAreaSize,
                'percentage' => $totalCampusArea > 0 ? round(($nonGreenAreaSize / $totalCampusArea) * 100, 2) : 0.0,
                'color' => '#64748b', // slate
            ],
        ];

        return [
            'campus_id' => $campusId,
            'campus_count' => $campuses->count(),
            'total_campus_area' => $totalCampusArea,
            'green_area_size' => $greenAreaSize,
            'vegetasi_non_rth_size' => $vegetasiNonRthSize,
            'total_vegetated_size' => $totalVegetatedSize,
            'non_green_area_size' => $nonGreenAreaSize,
            'green_percentage' => $greenPercentage,
            'vegetated_percentage' => $vegetatedPercentage,
            'target_percentage' => $targetPercentage,
            'is_achieved' => $isAchieved,
            'gap_percentage' => $gapPercentage,
            'gap_area_size' => max(0, $gapAreaSize),
            'status_text' => $statusText,
            'category_breakdown' => $categoryBreakdown,
            'status_breakdown' => $statusBreakdown,
            'total_objects_count' => $landUses->count(),
        ];
    }
}
