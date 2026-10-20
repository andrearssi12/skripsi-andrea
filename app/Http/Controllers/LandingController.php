<?php

namespace App\Http\Controllers;

use App\Models\Campus;
use App\Models\CampusSpatialPlan;
use App\Models\Feedback;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Services\GeoJsonService;
use App\Services\GreenAreaAnalysisService;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __construct(
        protected GreenAreaAnalysisService $analysisService,
        protected RecommendationService $recommendationService,
        protected GeoJsonService $geoJsonService,
    ) {}

    public function index(Request $request): Response
    {
        $allCampuses = $this->getCampuses();
        $selectedCampusId = $request->query('campus_id') ? (int) $request->query('campus_id') : ($allCampuses->first()?->id);

        $campusStats = $this->buildCampusStats($allCampuses, $selectedCampusId);
        $feedbacks = $this->getFeedbacks();

        return Inertia::render('Landing/Index', [
            'analysis'                    => $campusStats['selectedAnalysis'],
            'recommendations'             => $campusStats['selectedRecommendations'],
            'analysisByCampus'            => $campusStats['analysisByCampus'],
            'spatialRecommendations'      => $campusStats['spatialRecommendations'],
            'spatialRecsByCampus'         => $campusStats['spatialRecsByCampus'],
            'campuses'                    => $campusStats['campusesWithStats'],
            'categories'                  => $this->getCategories(),
            'selectedCampusId'            => $selectedCampusId,
            'allLandUses'                 => $this->getAllLandUses(),
            'landUsesGeoJson'             => $this->getLandUsesGeoJson(),
            'campusBoundaries'            => $this->buildCampusBoundaries($allCampuses),
            'feedbackGeoJson'             => $this->geoJsonService->buildFeedbackGeoJson($feedbacks),
            'recentFeedback'              => $feedbacks->take(6),
            'approvedSpatialPlansGeoJson' => $this->getApprovedSpatialPlansGeoJson(),
        ]);
    }

    /**
     * Ambil seluruh data master kampus beserta jumlah penggunaan lahan.
     */
    protected function getCampuses(): Collection
    {
        return Campus::select('id', 'code', 'name', 'address', 'total_area', 'boundary_geometry', 'description')
            ->withCount('landUses')
            ->get();
    }

    /**
     * Hitung analisis RTH, rekomendasi, dan rekomendasi spasial untuk seluruh kampus.
     */
    protected function buildCampusStats(Collection $allCampuses, ?int $selectedCampusId): array
    {
        $analysisByCampus = [];
        $spatialRecsByCampus = [];

        $campusesWithStats = $allCampuses->map(function ($c) use (&$analysisByCampus, &$spatialRecsByCampus) {
            $stats = $this->analysisService->analyze($c->id);
            $recs = $this->recommendationService->getRecommendations($stats);
            $spatialRecs = $this->recommendationService->generateSpatialRecommendations($stats, $c->id);

            $analysisByCampus[$c->id] = [
                'analysis' => $stats,
                'recommendations' => $recs,
            ];
            $spatialRecsByCampus[$c->id] = $spatialRecs;

            return [
                'id'                   => $c->id,
                'code'                 => $c->code,
                'name'                 => $c->name,
                'address'              => $c->address,
                'total_area'           => (float) $c->total_area,
                'description'          => $c->description,
                'boundary_geometry'    => $c->boundary_geometry,
                'land_uses_count'      => $c->land_uses_count,
                'green_area_size'      => $stats['green_area_size'],
                'vegetasi_non_rth_size'=> $stats['vegetasi_non_rth_size'],
                'total_vegetated_size' => $stats['total_vegetated_size'],
                'green_percentage'     => $stats['green_percentage'],
                'vegetated_percentage' => $stats['vegetated_percentage'],
                'is_achieved'          => $stats['is_achieved'],
                'is_vegetated_achieved'=> $stats['is_vegetated_achieved'],
                'status_text'          => $stats['status_text'],
                'analysis'             => $stats,
                'recommendations'      => $recs,
            ];
        });

        $selectedAnalysis = $analysisByCampus[$selectedCampusId]['analysis']
            ?? $this->analysisService->analyze($selectedCampusId);

        $selectedRecommendations = $analysisByCampus[$selectedCampusId]['recommendations']
            ?? $this->recommendationService->getRecommendations($selectedAnalysis);

        $spatialRecommendations = $spatialRecsByCampus[$selectedCampusId]
            ?? $this->recommendationService->generateSpatialRecommendations($selectedAnalysis, $selectedCampusId);

        return [
            'campusesWithStats'       => $campusesWithStats,
            'analysisByCampus'        => $analysisByCampus,
            'spatialRecsByCampus'     => $spatialRecsByCampus,
            'selectedAnalysis'        => $selectedAnalysis,
            'selectedRecommendations' => $selectedRecommendations,
            'spatialRecommendations'  => $spatialRecommendations,
        ];
    }

    /**
     * Buat GeoJSON FeatureCollection untuk batas-batas wilayah kampus.
     */
    protected function buildCampusBoundaries(Collection $allCampuses): array
    {
        $features = [];
        foreach ($allCampuses as $c) {
            if (!empty($c->boundary_geometry)) {
                $features[] = [
                    'type' => 'Feature',
                    'id'   => $c->id,
                    'properties' => [
                        'id'         => $c->id,
                        'code'       => $c->code,
                        'name'       => $c->name,
                        'address'    => $c->address,
                        'total_area' => (float) $c->total_area,
                    ],
                    'geometry' => $c->boundary_geometry,
                ];
            }
        }

        return [
            'type'     => 'FeatureCollection',
            'features' => $features,
        ];
    }

    /**
     * Ambil data kategori penggunaan lahan beserta jumlah objeknya.
     */
    protected function getCategories(): Collection
    {
        return LandUseCategory::select('id', 'name', 'color', 'icon', 'description')
            ->withCount('landUses')
            ->get();
    }

    /**
     * Ambil dan petakan data seluruh objek penggunaan lahan.
     */
    protected function getAllLandUses(): Collection
    {
        return LandUse::with(['category', 'parent', 'feedback.user'])
            ->select('id', 'name', 'campus_id', 'category_id', 'parent_id', 'area_size', 'green_status', 'condition', 'description')
            ->orderBy('campus_id')
            ->orderBy('green_status')
            ->get()
            ->map(fn($lu) => [
                'id'           => $lu->id,
                'name'         => $lu->name,
                'campus_id'    => $lu->campus_id,
                'area_size'    => (float) $lu->area_size,
                'green_status' => $lu->green_status,
                'condition'    => $lu->condition,
                'description'  => $lu->description,
                'category'     => $lu->category ? ['name' => $lu->category->name, 'color' => $lu->category->color] : null,
                'parent'       => $lu->parent   ? ['name' => $lu->parent->name]  : null,
                'feedbacks'    => $lu->feedback ? $lu->feedback->map(fn($fb) => [
                    'id'         => $fb->id,
                    'title'      => $fb->title,
                    'message'    => $fb->message,
                    'status'     => $fb->status,
                    'image_url'  => $fb->image ? asset('storage/' . $fb->image) : null,
                    'user_name'  => $fb->user?->name ?? 'Civitas UAD',
                    'created_at' => $fb->created_at?->format('d M Y, H:i'),
                ])->values()->all() : [],
                'feedbacks_count' => $lu->feedback ? $lu->feedback->count() : 0,
            ]);
    }

    /**
     * Ambil data GeoJSON seluruh penggunaan lahan untuk kebutuhan peta.
     */
    protected function getLandUsesGeoJson(): array
    {
        $allLandUsesForMap = LandUse::with(['category', 'campus', 'parent', 'children', 'feedback.user'])
            ->orderBy('green_status', 'asc')
            ->get();

        return $this->geoJsonService->toFeatureCollection($allLandUsesForMap);
    }

    /**
     * Ambil data seluruh aspirasi/feedback civitas.
     */
    protected function getFeedbacks(): Collection
    {
        return Feedback::with(['user', 'landUse'])->latest()->get();
    }

    /**
     * Ambil data GeoJSON rencana penataan ruang yang telah disetujui atau diimplementasikan.
     */
    protected function getApprovedSpatialPlansGeoJson(): array
    {
        $approvedPlans = CampusSpatialPlan::with(['campus', 'landUse'])
            ->whereIn('status', ['approved', 'implemented'])
            ->latest('approved_at')
            ->get();

        return $this->geoJsonService->buildSpatialPlansGeoJson($approvedPlans);
    }
}
