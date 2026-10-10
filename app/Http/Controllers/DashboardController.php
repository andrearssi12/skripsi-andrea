<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Campus;
use App\Models\Feedback;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Services\GeoJsonService;
use App\Services\GreenAreaAnalysisService;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected GreenAreaAnalysisService $analysisService,
        protected RecommendationService $recommendationService,
        protected GeoJsonService $geoJsonService,
    ) {}

    public function index(Request $request): Response
    {
        $campusId = $this->getCampusId($request);
        $analysis = $this->getAnalysis($campusId);
        $feedbacks = $this->getFeedbacks();

        return Inertia::render('Dashboard', [
            'analysis' => $analysis,
            'recommendations' => $this->getRecommendations($analysis),
            'spatialRecommendations' => $this->getSpatialRecommendations($analysis, $campusId),
            'campuses' => $this->getCampuses(),
            'categories' => $this->getCategories(),
            'campusBoundaries' => $this->getCampusBoundaries(),
            'selectedCampusId' => $campusId,
            'geoJsonData' => $this->getLandUsesGeoJson($campusId),
            'feedbackGeoJson' => $this->geoJsonService->buildFeedbackGeoJson($feedbacks),
            'feedbackStats' => $this->getFeedbackStats(),
            'recentLogs' => $this->getRecentLogs($request),
            'recentFeedback' => $feedbacks->take(4),
        ]);
    }

    private function getCampusId(Request $request): ?int
    {
        return $request->query('campus_id')
            ? (int) $request->query('campus_id')
            : null;
    }

    private function getAnalysis(?int $campusId)
    {
        return $this->analysisService->analyze($campusId);
    }

    private function getRecommendations($analysis)
    {
        return $this->recommendationService->getRecommendations($analysis);
    }

    private function getSpatialRecommendations($analysis, ?int $campusId)
    {
        return $this->recommendationService
            ->generateSpatialRecommendations($analysis, $campusId);
    }

    private function getCampuses()
    {
        return Campus::select(
            'id',
            'code',
            'name',
            'total_area',
            'boundary_geometry'
        )->get();
    }

    private function getCategories()
    {
        return LandUseCategory::select(
            'id',
            'name',
            'color',
            'icon',
            'description'
        )->get();
    }

    private function getCampusBoundaries()
    {
        $campuses = $this->getCampuses();

        $features = [];

        foreach ($campuses as $campus) {
            if (!empty($campus->boundary_geometry)) {
                $features[] = [
                    'type' => 'Feature',
                    'id' => $campus->id,
                    'properties' => [
                        'id' => $campus->id,
                        'code' => $campus->code,
                        'name' => $campus->name,
                        'total_area' => (float) $campus->total_area,
                    ],
                    'geometry' => $campus->boundary_geometry,
                ];
            }
        }

        return [
            'type' => 'FeatureCollection',
            'features' => $features,
        ];
    }

    private function getLandUsesGeoJson(?int $campusId)
    {
        $query = LandUse::with(['category', 'campus']);

        if ($campusId) {
            $query->where('campus_id', $campusId);
        }

        $landUses = $query->get();

        return $this->geoJsonService->toFeatureCollection($landUses);
    }

    private function getFeedbacks()
    {
        return Feedback::with(['user', 'landUse'])
            ->latest()
            ->get();
    }

    private function getFeedbackStats()
    {
        return [
            'total' => Feedback::count(),
            'pending' => Feedback::where('status', 'Menunggu')->count(),
            'processed' => Feedback::where('status', 'Diproses')->count(),
            'completed' => Feedback::where('status', 'Selesai')->count(),
        ];
    }

    private function getRecentLogs(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return [];
        }

        return ActivityLog::with('user')
            ->latest('created_at')
            ->limit(5)
            ->get();
    }
}
