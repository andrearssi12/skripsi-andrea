<?php

namespace App\Services;

class RecommendationService
{
    /**
     * Generate green campus planning recommendations based on analysis metrics.
     */
    public function getRecommendations(array $analysis): array
    {
        $recommendations = [];
        $isAchieved = $analysis['is_achieved'] ?? false;
        $gapPercentage = $analysis['gap_percentage'] ?? 0.0;
        $vegetasiNonRthSize = $analysis['vegetasi_non_rth_size'] ?? 0.0;

        if (!$isAchieved) {
            if ($vegetasiNonRthSize > 0) {
                $recommendations[] = [
                    'id' => 1,
                    'priority' => 'Tinggi',
                    'title' => 'Optimalisasi Vegetasi Non-RTH Menjadi Green Area Terpadu',
                    'description' => "Terdapat {$vegetasiNonRthSize} m² area vegetasi non-RTH (seperti pulau jalan/parkiran berpohon) yang dapat ditingkatkan kualitas dan perawatannya agar memenuhi standar RTH kampus.",
                    'category' => 'Optimalisasi',
                ];
            }

            $recommendations[] = [
                'id' => 2,
                'priority' => 'Tinggi',
                'title' => 'Pengembangan Jalur Hijau & Koridor Pejalan Kaki',
                'description' => 'Menambah peneduh dan vegetasi linear di sepanjang sirkulasi pejalan kaki kampus dan pembatas perimeter lahan kampus.',
                'category' => 'Ekspansi',
            ];

            $recommendations[] = [
                'id' => 3,
                'priority' => 'Sedang',
                'title' => 'Pemanfaatan Roof Garden dan Vertical Greenery',
                'description' => 'Mengimplementasikan taman atap (green roof) dan dinding hijau (green wall) pada gedung perkuliahan yang memenuhi standar struktural bangunan.',
                'category' => 'Inovasi',
            ];

            $recommendations[] = [
                'id' => 4,
                'priority' => 'Sedang',
                'title' => 'Program Pemeliharaan Rutin & Revitalisasi Taman',
                'description' => 'Meningkatkan jadwal penyiraman, pemupukan organik, dan peremajaan tanaman pada area taman dengan kondisi sedang atau kurang.',
                'category' => 'Pemeliharaan',
            ];
        } else {
            $recommendations[] = [
                'id' => 1,
                'priority' => 'Tinggi',
                'title' => 'Pertahankan dan Lindungi Green Area Eksisting',
                'description' => 'Target 30% Green Campus telah tercapai. Prioritas utama adalah proteksi zonasi hijau dari alih fungsi lahan pembangunan baru.',
                'category' => 'Konservasi',
            ];

            $recommendations[] = [
                'id' => 2,
                'priority' => 'Sedang',
                'title' => 'Peningkatan Keanekaragaman Hayati (Biodiversitas)',
                'description' => 'Menambah varietas pohon peneduh lokal dan tanaman penyerap polutan untuk meningkatkan kualitas ekologis kampus.',
                'category' => 'Ekologis',
            ];
        }

        return [
            'disclaimer' => 'Rekomendasi sistem ini bersifat informasi pendukung pengambilan keputusan (decision support) bagi pengelola kampus, bukan keputusan mutlak.',
            'items' => $recommendations,
        ];
    }

    /**
     * Generate structured spatial recommendations mapped to actual GIS land use polygons.
     * Implements 4 Spatial Pillars when RTH < 30%:
     * 1. 🛡️ Zona Konservasi & Proteksi Mutlak RTH Eksisting (Dilarang Alih Fungsi)
     * 2. 🌳 Revitalisasi & Intensifikasi Kualitas RTH (Kondisi Sedang / Kurang)
     * 3. 🌱 Ekstensifikasi / Konversi Lahan Terbuka Menjadi RTH Baru
     * 4. 🏢 Kompensasi Vegetasi Alternatif (Green Roof, Vertical Garden, Peneduh Parkir)
     *
     * @param array $analysis Analysis metrics from GreenAreaAnalysisService
     * @param int|null $campusId Specific campus ID or null
     */
    public function generateSpatialRecommendations(array $analysis, ?int $campusId = null): array
    {
        $targetPercentage = (float) config('green_campus.target_green_percentage', 30.0);
        $totalCampusArea = (float) ($analysis['total_campus_area'] ?? 0.0);
        $greenPercentage = (float) ($analysis['green_percentage'] ?? 0.0);
        $vegetatedPercentage = (float) ($analysis['vegetated_percentage'] ?? 0.0);
        $isAchieved = $analysis['is_achieved'] ?? false;
        $gapAreaSize = (float) ($analysis['gap_area_size'] ?? 0.0);
        $gapPercentage = (float) ($analysis['gap_percentage'] ?? 0.0);

        // Fetch land uses with relations
        $query = \App\Models\LandUse::with(['category', 'campus', 'parent']);
        if ($campusId) {
            $query->where('campus_id', $campusId);
        }
        $landUses = $query->orderBy('area_size', 'desc')->get();

        $conservationLayers = [];
        $revitalizationLayers = [];
        $rthConversionLayers = [];
        $potentialLayers = [];
        $hardSurfaceLayers = [];

        foreach ($landUses as $lu) {
            $area = (float) $lu->area_size;
            $gainPercent = $totalCampusArea > 0 ? round(($area / $totalCampusArea) * 100, 2) : 0.0;
            $gapCoverage = (!$isAchieved && $gapAreaSize > 0)
                ? round(($area / $gapAreaSize) * 100, 1)
                : 0.0;
            $catName = $lu->category?->name ?? 'Lainnya';
            $name = $lu->name;
            $status = $lu->green_status;
            $condition = $lu->condition ?? 'Baik';
            $lowerName = strtolower($name . ' ' . $catName);

            if ($status === 'Green Area' || $status === 'Vegetasi Non-RTH') {
                $isRth = ($status === 'Green Area');
                $needsRevitalization = in_array($condition, ['Sedang', 'Kurang']);

                $item = [
                    'id' => $lu->id,
                    'name' => $name,
                    'campus_id' => $lu->campus_id,
                    'campus_name' => $lu->campus?->name,
                    'category_name' => $catName,
                    'category_color' => $lu->category?->color ?? '#10b981',
                    'area_size' => $area,
                    'green_status' => $status,
                    'condition' => $condition,
                    'pillar_type' => $needsRevitalization ? 'revitalization' : 'conservation',
                    'zone_type' => 'conservation',
                    'zone_label' => $needsRevitalization ? 'Zona Revitalisasi & Intensifikasi RTH' : 'Zona Konservasi Prioritas Mutlak',
                    'priority' => 'Tinggi',
                    'badge' => $needsRevitalization ? "Revitalisasi ({$condition})" : ($isRth ? 'RTH Wajib Dijaga' : 'Vegetasi Pendukung'),
                    'badge_color' => $needsRevitalization ? 'badge-amber' : ($isRth ? 'badge-green' : 'badge-lime'),
                    'action_title' => $needsRevitalization
                        ? 'Peremajaan & Peningkatan Kualitas Vegetasi'
                        : 'Wajib Dipertahankan & Dilarang Alih Fungsi',
                    'action_description' => $needsRevitalization
                        ? "Kondisi saat ini '{$condition}'. Diperlukan penyulaman pohon, penambahan strata tanaman penutup tanah, dan pembuatan biopori/sumur resapan."
                        : ($isAchieved
                            ? 'Pertahankan kualitas tutupan hijau dan laksanakan pemeliharaan berkala untuk menjaga stabilitas ekologis kampus.'
                            : 'ZONA KRITIS: Dilarang keras dialihfungsikan menjadi gedung/parkir karena RTH kampus masih di bawah target 30%!'),
                    'spatial_directive' => 'Proteksi spasial penuh dari perataan tanah atau pendirian konstruksi permanen.',
                    'contribution_percent' => $gainPercent,
                    'gap_coverage_percent' => 0.0,
                ];

                $conservationLayers[] = $item;
                if ($needsRevitalization) {
                    $revitalizationLayers[] = $item;
                }
            } else {
                // Non-Green Area: Evaluate whether it can be converted directly into RTH or needs alternative vegetation
                $isOpenGround = (bool) preg_match('/lapangan|tanah|halaman|taman|terbuka|kosong|rumput/i', $lowerName);
                $isBuilding = (bool) preg_match('/gedung|bangunan|aula|lab|hall|kantor|perpustakaan|masjid/i', $lowerName);
                $isParkingOrPlaza = (bool) preg_match('/parkir|plaza|paving|aspal/i', $lowerName);
                $isCorridor = (bool) preg_match('/jalan|selasar|pedestrian|koridor|jalur|trotoar/i', $lowerName);

                if ($isOpenGround && !$isBuilding) {
                    // PILAR 2: Ekstensifikasi / Konversi Lahan Terbuka Menjadi RTH Baru
                    $convItem = [
                        'id' => $lu->id,
                        'name' => $name,
                        'campus_id' => $lu->campus_id,
                        'campus_name' => $lu->campus?->name,
                        'category_name' => $catName,
                        'category_color' => $lu->category?->color ?? '#64748b',
                        'area_size' => $area,
                        'green_status' => $status,
                        'pillar_type' => 'rth_conversion',
                        'zone_type' => 'potential_vegetation',
                        'zone_label' => 'Kandidat Konversi RTH Baru',
                        'intervention_type' => 'rth_new',
                        'intervention_title' => 'Konversi Menjadi Ruang Terbuka Hijau Murni',
                        'priority' => 'Sangat Tinggi',
                        'badge' => 'Kandidat RTH Baru',
                        'badge_color' => 'badge-green',
                        'action_description' => "Lahan terbuka non-terbangun yang sangat potensial dikonversi menjadi taman kampus terpadu/rain garden untuk menutup defisit RTH.",
                        'action_benefit' => (!$isAchieved && $gapAreaSize > 0)
                            ? ($gapCoverage >= 100
                                ? "Konversi lahan ini berpotensi menyumbang +{$gainPercent}% ({$area} m²), menutup 100% defisit RTH kampus (target 30% langsung terpenuhi)."
                                : "Konversi lahan ini berpotensi menyumbang +{$gainPercent}% ({$area} m²), menutup {$gapCoverage}% dari total defisit RTH kampus.")
                            : "Konversi lahan ini berpotensi menambah tutupan RTH kampus sebesar +{$gainPercent}% ({$area} m²).",
                        'potential_gain_percent' => $gainPercent,
                        'gap_coverage_percent' => $gapCoverage,
                        'color' => '#10b981',
                    ];
                    $rthConversionLayers[] = $convItem;
                    $potentialLayers[] = $convItem;
                } elseif ($isBuilding) {
                    // PILAR 4A: Kompensasi Green Roof & Wall
                    $potentialLayers[] = [
                        'id' => $lu->id,
                        'name' => $name,
                        'campus_id' => $lu->campus_id,
                        'campus_name' => $lu->campus?->name,
                        'category_name' => $catName,
                        'category_color' => $lu->category?->color ?? '#64748b',
                        'area_size' => $area,
                        'green_status' => $status,
                        'pillar_type' => 'green_roof',
                        'zone_type' => 'potential_vegetation',
                        'zone_label' => 'Potensi Roof Garden & Dinding Hijau',
                        'intervention_type' => 'green_roof',
                        'intervention_title' => 'Taman Atap (Green Roof) & Vertical Garden',
                        'priority' => $area >= 300 ? 'Tinggi' : 'Sedang',
                        'badge' => 'Potensi Roof Garden',
                        'badge_color' => 'badge-sky',
                        'action_description' => 'Menerapkan instalasi taman atap (green roof) dan vertical greenery pada dinding fasad gedung tanpa mengganggu struktur bangunan.',
                        'action_benefit' => "Potensi menambah tutupan hijau hingga +{$gainPercent}% ({$area} m²) tanpa memerlukan tanah terbuka baru.",
                        'potential_gain_percent' => $gainPercent,
                        'gap_coverage_percent' => $gapCoverage,
                        'color' => '#0ea5e9',
                    ];
                } elseif ($isParkingOrPlaza) {
                    // PILAR 4B: Kompensasi Peneduh Parkir & Plaza
                    $potentialLayers[] = [
                        'id' => $lu->id,
                        'name' => $name,
                        'campus_id' => $lu->campus_id,
                        'campus_name' => $lu->campus?->name,
                        'category_name' => $catName,
                        'category_color' => $lu->category?->color ?? '#64748b',
                        'area_size' => $area,
                        'green_status' => $status,
                        'pillar_type' => 'canopy_tree',
                        'zone_type' => 'potential_vegetation',
                        'zone_label' => 'Potensi Pohon Peneduh & Planter Box',
                        'intervention_type' => 'canopy_tree',
                        'intervention_title' => 'Pohon Peneduh Kanopi & Grass Block',
                        'priority' => 'Tinggi',
                        'badge' => 'Potensi Pohon & Planter',
                        'badge_color' => 'badge-amber',
                        'action_description' => 'Menanam pohon peneduh berakar tunggang aman, grass block berpori pada parkiran, serta pot tanaman besar (planter box) di perimeter area.',
                        'action_benefit' => "Mengurangi panas radiasi permukaan (heat island) dan berpotensi menambah tutupan vegetasi +{$gainPercent}% ({$area} m²).",
                        'potential_gain_percent' => $gainPercent,
                        'gap_coverage_percent' => $gapCoverage,
                        'color' => '#f59e0b',
                    ];
                } elseif ($isCorridor) {
                    // PILAR 4C: Koridor Hijau
                    $potentialLayers[] = [
                        'id' => $lu->id,
                        'name' => $name,
                        'campus_id' => $lu->campus_id,
                        'campus_name' => $lu->campus?->name,
                        'category_name' => $catName,
                        'category_color' => $lu->category?->color ?? '#64748b',
                        'area_size' => $area,
                        'green_status' => $status,
                        'pillar_type' => 'green_corridor',
                        'zone_type' => 'potential_vegetation',
                        'zone_label' => 'Potensi Koridor Hijau Linear',
                        'intervention_type' => 'green_corridor',
                        'intervention_title' => 'Koridor Hijau & Pergola Rambat',
                        'priority' => 'Sedang',
                        'badge' => 'Potensi Koridor Hijau',
                        'badge_color' => 'badge-lime',
                        'action_description' => 'Membuat pergola tanaman rambat peneduh dan sempadan jalur hijau linear di sepanjang jalur pejalan kaki.',
                        'action_benefit' => "Menciptakan kenyamanan sirkulasi mikroklimat dengan tambahan tutupan +{$gainPercent}%.",
                        'potential_gain_percent' => $gainPercent,
                        'gap_coverage_percent' => $gapCoverage,
                        'color' => '#84cc16',
                    ];
                } else {
                    $hardSurfaceLayers[] = [
                        'id' => $lu->id,
                        'name' => $name,
                        'campus_id' => $lu->campus_id,
                        'category_name' => $catName,
                        'area_size' => $area,
                        'zone_type' => 'hard_surface',
                        'zone_label' => 'Zona Terbangun Permanen',
                    ];
                }
            }
        }

        // Load existing spatial plans from database for approval checking & official campus planning
        $plansQuery = \App\Models\CampusSpatialPlan::with(['approvedByUser', 'campus', 'landUse.category'])
            ->whereIn('status', ['approved', 'implemented']);
        if ($campusId) {
            $plansQuery->where('campus_id', $campusId);
        }
        $existingPlansList = $plansQuery->latest('approved_at')->get();
        $plansByLandUse = $existingPlansList->whereNotNull('land_use_id')->keyBy('land_use_id');

        $attachPlanInfo = function ($layer) use ($plansByLandUse) {
            $plan = $plansByLandUse->get($layer['id'] ?? null);
            $layer['is_approved'] = $plan && in_array($plan->status, ['approved', 'implemented']);
            $layer['plan_id'] = $plan?->id;
            $layer['plan_status'] = $plan?->status ?? 'draft';
            $layer['target_year'] = $plan?->target_year ?? '2026/2027';
            $layer['approved_by_name'] = $plan?->approvedByUser?->name;
            $layer['approved_at'] = $plan?->approved_at?->format('d M Y, H:i');
            $layer['notes'] = $plan?->notes;
            return $layer;
        };

        $conservationLayers = array_map($attachPlanInfo, $conservationLayers);
        $revitalizationLayers = array_map($attachPlanInfo, $revitalizationLayers);
        $rthConversionLayers = array_map($attachPlanInfo, $rthConversionLayers);
        $potentialLayers = array_map($attachPlanInfo, $potentialLayers);

        $pillarBadgeMap = [
            'conservation'   => ['badge' => 'Konservasi Prioritas', 'color' => 'badge-green', 'title' => 'Wajib Dipertahankan'],
            'revitalization' => ['badge' => 'Revitalisasi Vegetasi', 'color' => 'badge-amber', 'title' => 'Revitalisasi Mutu Vegetasi'],
            'rth_conversion' => ['badge' => 'Konversi RTH Baru', 'color' => 'badge-emerald', 'title' => 'Konversi Lahan Menjadi RTH'],
            'green_roof'     => ['badge' => 'Green Roof / Vertical', 'color' => 'badge-info', 'title' => 'Taman Atap / Dinding Hijau'],
            'canopy_tree'    => ['badge' => 'Pohon Peneduh / Koridor', 'color' => 'badge-lime', 'title' => 'Pohon Peneduh & Kanopi'],
            'green_corridor' => ['badge' => 'Koridor Hijau Kampus', 'color' => 'badge-teal', 'title' => 'Koridor Sirkulasi Hijau'],
        ];

        // Format ALL approved & implemented plans directly from CampusSpatialPlan table
        // (Includes both plans created manually by admin and plans ACC'ed from system recommendations)
        $approvedPlans = $existingPlansList->map(function ($plan) use ($pillarBadgeMap, $gapAreaSize, $totalCampusArea, $isAchieved) {
            $pillar = $plan->pillar_type ?? 'conservation';
            $badgeInfo = $pillarBadgeMap[$pillar] ?? ['badge' => 'Perencanaan Kampus', 'color' => 'badge-green', 'title' => 'Rencana Penataan RTH'];
            $isImplemented = $plan->status === 'implemented';
            $area = (float) $plan->area_size;
            $gain = (float) $plan->potential_gain_percent;
            if ($gain <= 0 && $totalCampusArea > 0 && $area > 0) {
                $gain = round(($area / $totalCampusArea) * 100, 2);
            }
            $gapCoverage = (!$isAchieved && $gapAreaSize > 0)
                ? round(($area / $gapAreaSize) * 100, 1)
                : 0.0;

            return [
                'id' => $plan->id,
                'plan_id' => $plan->id,
                'name' => $plan->title,
                'title' => $plan->title,
                'action_title' => $plan->title,
                'intervention_title' => $badgeInfo['title'] ?? $plan->title,
                'description' => $plan->description,
                'action_description' => $plan->description ?: ($plan->notes ?: 'Rencana pengembangan ruang terbuka hijau kampus disetujui.'),
                'pillar_type' => $pillar,
                'zone_type' => in_array($pillar, ['conservation', 'revitalization']) ? 'conservation' : 'potential_vegetation',
                'area_size' => $area,
                'contribution_percent' => $gain,
                'potential_gain_percent' => $gain,
                'gap_coverage_percent' => $gapCoverage,
                'target_year' => $plan->target_year,
                'status' => $plan->status,
                'is_approved' => true,
                'is_implemented' => $isImplemented,
                'badge' => $isImplemented ? 'Terimplementasi' : $badgeInfo['badge'],
                'badge_color' => $isImplemented ? 'badge-teal' : $badgeInfo['color'],
                'approved_by_name' => $plan->approvedByUser?->name,
                'approved_at' => $plan->approved_at?->format('d M Y, H:i'),
                'notes' => $plan->notes,
                'campus_id' => $plan->campus_id,
                'campus_name' => $plan->campus?->name,
                'land_use_id' => $plan->land_use_id,
                'geometry' => $plan->effective_geometry,
                'is_spatial_plan' => true,
            ];
        })->values()->all();

        $totalConservationArea = (float) collect($conservationLayers)->sum('area_size');
        $totalPotentialArea = (float) collect($potentialLayers)->sum('area_size');
        $totalRthConversionArea = (float) collect($rthConversionLayers)->sum('area_size');
        $maxPossibleVegetatedArea = $totalConservationArea + $totalPotentialArea;
        $maxPossiblePercentage = $totalCampusArea > 0
            ? round(($maxPossibleVegetatedArea / $totalCampusArea) * 100, 2)
            : 0.0;

        return [
            'campus_id' => $campusId,
            'target_percentage' => $targetPercentage,
            'current_green_percentage' => $greenPercentage,
            'current_vegetated_percentage' => $vegetatedPercentage,
            'gap_percentage' => $gapPercentage,
            'gap_area_size' => $gapAreaSize,
            'is_achieved' => $isAchieved,
            'total_campus_area' => $totalCampusArea,
            'approved_plans_count' => count($approvedPlans),
            'approved_plans' => $approvedPlans,
            'pillars' => [
                'p1_conservation_count' => count($conservationLayers),
                'p1_conservation_area' => $totalConservationArea,
                'p2_revitalization_count' => count($revitalizationLayers),
                'p3_rth_conversion_count' => count($rthConversionLayers),
                'p3_rth_conversion_area' => $totalRthConversionArea,
                'p4_alternative_veg_count' => count($potentialLayers) - count($rthConversionLayers),
                'p4_alternative_veg_area' => $totalPotentialArea - $totalRthConversionArea,
            ],
            'summary' => [
                'must_preserve_count' => count($conservationLayers),
                'must_preserve_area' => $totalConservationArea,
                'potential_count' => count($potentialLayers),
                'potential_area' => $totalPotentialArea,
                'rth_conversion_count' => count($rthConversionLayers),
                'rth_conversion_area' => $totalRthConversionArea,
                'max_possible_percentage' => $maxPossiblePercentage,
            ],
            'conservation_layers' => $conservationLayers,
            'revitalization_layers' => $revitalizationLayers,
            'rth_conversion_layers' => $rthConversionLayers,
            'potential_layers' => $potentialLayers,
            'hard_surface_layers' => $hardSurfaceLayers,
        ];
    }
}
