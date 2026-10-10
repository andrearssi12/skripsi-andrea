<?php

namespace App\Http\Controllers;

use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Services\GeoJsonService;
use App\Services\GreenAreaAnalysisService;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function __construct(
        protected GeoJsonService $geoJsonService,
        protected GreenAreaAnalysisService $analysisService,
        protected RecommendationService $recommendationService,
    ) {}

    public function index(Request $request): Response
    {
        $campuses = Campus::select('id', 'code', 'name', 'address', 'total_area', 'boundary_geometry')->get();
        $categories = LandUseCategory::select('id', 'name', 'color', 'icon', 'description')->get();

        $targetLandUseId = $request->query('land_use_id') ? (int) $request->query('land_use_id') : null;
        $targetFeedbackId = $request->query('feedback_id') ? (int) $request->query('feedback_id') : null;

        $selectedCampusId = $request->query('campus_id') ? (int) $request->query('campus_id') : null;

        if ($targetLandUseId && !$selectedCampusId) {
            $targetLu = LandUse::find($targetLandUseId);
            if ($targetLu) {
                $selectedCampusId = $targetLu->campus_id;
            }
        }

        if (!$selectedCampusId) {
            $selectedCampusId = $campuses->first()?->id ?? null;
        }

        $landUsesQuery = LandUse::with(['category', 'campus', 'parent', 'feedback.user']);
        if ($selectedCampusId) {
            $landUsesQuery->where('campus_id', $selectedCampusId);
        }
        $landUses = $landUsesQuery->get();

        $landUsesGeoJson = $this->geoJsonService->toFeatureCollection($landUses);

        // Build campus boundary GeoJSON collection
        $campusBoundaries = [
            'type' => 'FeatureCollection',
            'features' => [],
        ];

        foreach ($campuses as $c) {
            if (!empty($c->boundary_geometry)) {
                $campusBoundaries['features'][] = [
                    'type' => 'Feature',
                    'id' => $c->id,
                    'properties' => [
                        'id' => $c->id,
                        'code' => $c->code,
                        'name' => $c->name,
                        'address' => $c->address,
                        'total_area' => (float) $c->total_area,
                    ],
                    'geometry' => $c->boundary_geometry,
                ];
            }
        }

        // Build feedback GeoJSON for map pins
        $feedbackQuery = \App\Models\Feedback::with(['landUse', 'user']);
        if ($selectedCampusId) {
            $feedbackQuery->whereHas('landUse', fn($q) => $q->where('campus_id', $selectedCampusId));
        }
        $feedbackGeoJson = $this->geoJsonService->buildFeedbackGeoJson($feedbackQuery->get());

        $analysis = $this->analysisService->analyze($selectedCampusId);
        $spatialRecommendations = $this->recommendationService->generateSpatialRecommendations($analysis, $selectedCampusId);

        // Fetch approved spatial plans for overlay
        $approvedPlansQuery = \App\Models\CampusSpatialPlan::with(['campus', 'landUse'])
            ->where('status', 'approved');
        if ($selectedCampusId) {
            $approvedPlansQuery->where('campus_id', $selectedCampusId);
        }
        $approvedPlans = $approvedPlansQuery->latest('approved_at')->get();
        $approvedSpatialPlansGeoJson = $this->geoJsonService->buildSpatialPlansGeoJson($approvedPlans);

        return Inertia::render('Map/Index', [
            'campuses' => $campuses,
            'categories' => $categories,
            'selectedCampusId' => $selectedCampusId,
            'landUsesGeoJson' => $landUsesGeoJson,
            'campusBoundaries' => $campusBoundaries,
            'feedbackGeoJson' => $feedbackGeoJson,
            'approvedSpatialPlansGeoJson' => $approvedSpatialPlansGeoJson,
            'approvedSpatialPlans' => $approvedPlans,
            'analysis' => $analysis,
            'spatialRecommendations' => $spatialRecommendations,
            'isAdmin' => $request->user()?->isAdmin() ?? false,
            'landUses' => $landUses,
            'targetLandUseId' => $targetLandUseId,
            'targetFeedbackId' => $targetFeedbackId,
            'filters' => [
                'campus_id' => $selectedCampusId,
                'search' => $request->query('search', ''),
                'category_id' => $request->query('category_id'),
                'green_status' => $request->query('green_status'),
            ],
        ]);
    }
}
