<?php

namespace App\Http\Controllers;

use App\Models\Campus;
use App\Models\CampusSpatialPlan;
use App\Models\LandUse;
use App\Services\ActivityLogService;
use App\Services\GeoJsonService;
use App\Services\GreenAreaAnalysisService;
use App\Services\RecommendationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SpatialPlanController extends Controller
{
    public function __construct(
        protected GeoJsonService $geoJsonService,
        protected GreenAreaAnalysisService $analysisService,
        protected RecommendationService $recommendationService,
    ) {}

    /**
     * Display a listing of spatial plans.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();

        $campusId = $request->query('campus_id');
        $status = $request->query('status');
        $search = $request->query('search');

        $query = CampusSpatialPlan::with(['campus', 'landUse.category', 'approvedByUser'])
            ->latest();

        // Non-admin can ONLY view approved plans
        if (!$isAdmin) {
            $query->where('status', 'approved');
        } elseif ($status && in_array($status, ['draft', 'approved', 'implemented'])) {
            $query->where('status', $status);
        }

        if ($campusId) {
            $query->where('campus_id', $campusId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('pillar_type', 'like', "%{$search}%")
                    ->orWhereHas('campus', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        $plans = $query->paginate(12)->withQueryString();

        // Count summaries for admin tabs
        $counts = [
            'all' => $isAdmin ? CampusSpatialPlan::count() : CampusSpatialPlan::where('status', 'approved')->count(),
            'approved' => CampusSpatialPlan::where('status', 'approved')->count(),
            'draft' => $isAdmin ? CampusSpatialPlan::where('status', 'draft')->count() : 0,
            'implemented' => $isAdmin ? CampusSpatialPlan::where('status', 'implemented')->count() : 0,
        ];

        $campuses = Campus::select('id', 'name', 'code')->get();

        return Inertia::render('SpatialPlans/Index', [
            'plans' => $plans,
            'counts' => $counts,
            'campuses' => $campuses,
            'filters' => [
                'campus_id' => $campusId ? (int) $campusId : null,
                'status' => $status,
                'search' => $search,
            ],
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Show the form for creating a new spatial plan (Admin only).
     */
    public function create(Request $request): Response
    {
        $campuses = Campus::with(['landUses' => function ($q) {
            $q->select('id', 'name', 'code', 'campus_id', 'area_size', 'category_id', 'green_status', 'geometry')
                ->with('category:id,name,color');
        }])->get();

        $selectedCampusId = $request->query('campus_id') ? (int) $request->query('campus_id') : ($campuses->first()?->id ?? null);

        // Fetch AI/system spatial recommendations for the selected campus
        $analysis = $this->analysisService->analyze($selectedCampusId);
        $recommendations = $this->recommendationService->generateSpatialRecommendations($analysis, $selectedCampusId);

        // Flatten recommendation items for easy selection
        $recItems = [];
        $categories = [
            'conservation_layers' => 'Konservasi Prioritas',
            'revitalization_layers' => 'Revitalisasi Vegetasi',
            'rth_conversion_layers' => 'Konversi RTH Baru',
            'potential_layers' => 'Potensi Roof Garden / Koridor',
        ];

        foreach ($categories as $key => $catTitle) {
            if (!empty($recommendations[$key])) {
                foreach ($recommendations[$key] as $item) {
                    $recItems[] = array_merge($item, [
                        'group_label' => $catTitle,
                    ]);
                }
            }
        }

        return Inertia::render('SpatialPlans/Create', [
            'campuses' => $campuses,
            'selectedCampusId' => $selectedCampusId,
            'recommendationItems' => $recItems,
        ]);
    }

    /**
     * Store a newly created spatial plan (Admin only).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'land_use_id' => 'nullable|exists:land_uses,id',
            'title' => 'required|string|max:255',
            'pillar_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'target_year' => 'nullable|string|max:50',
            'area_size' => 'nullable|numeric|min:0',
            'potential_gain_percent' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,approved,implemented',
            'notes' => 'nullable|string',
            'geometry' => 'nullable',
        ]);

        $geometry = $validated['geometry'] ?? null;
        if (is_string($geometry)) {
            $geometry = json_decode($geometry, true);
        }

        $areaSize = (float) ($validated['area_size'] ?? 0);
        if ($geometry && (!isset($validated['area_size']) || $areaSize <= 0)) {
            $areaSize = $this->geoJsonService->calculateAreaM2($geometry);
        }

        $campus = Campus::find($validated['campus_id']);
        $gainPercent = (float) ($validated['potential_gain_percent'] ?? 0);
        if ($campus && $campus->total_area > 0 && $areaSize > 0 && $gainPercent <= 0) {
            $gainPercent = round(($areaSize / (float) $campus->total_area) * 100, 2);
        }

        $isApproved = $validated['status'] === 'approved';

        $plan = CampusSpatialPlan::create([
            'campus_id' => $validated['campus_id'],
            'land_use_id' => $validated['land_use_id'] ?? null,
            'geometry' => $geometry,
            'title' => $validated['title'],
            'pillar_type' => $validated['pillar_type'],
            'description' => $validated['description'] ?? null,
            'target_year' => $validated['target_year'] ?? date('Y') . '-' . (date('Y') + 2),
            'area_size' => $areaSize,
            'potential_gain_percent' => $gainPercent,
            'status' => $validated['status'],
            'approved_by' => $isApproved ? Auth::id() : null,
            'approved_at' => $isApproved ? now() : null,
            'notes' => $validated['notes'] ?? null,
        ]);

        ActivityLogService::log(
            'create',
            'spatial_plan',
            "Membuat rencana spasial '{$plan->title}' (" . ($isApproved ? 'Approved' : 'Draft') . ")",
            $plan->id
        );

        return redirect()->route('spatial-plans.index')
            ->with('success', "Rencana spasial '{$plan->title}' berhasil disimpan.");
    }

    /**
     * Display the specified spatial plan.
     */
    public function show(CampusSpatialPlan $spatialPlan, Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();

        if ($spatialPlan->status !== 'approved' && !$isAdmin) {
            abort(403, 'Rencana spasial ini masih berstatus draft dan belum dipublikasikan.');
        }

        $spatialPlan->load(['campus', 'landUse.category', 'approvedByUser']);

        // Build feature GeoJSON for single plan preview map
        $planGeoJson = null;
        $geometry = $spatialPlan->effective_geometry;
        if ($geometry) {
            $planGeoJson = [
                'type' => 'FeatureCollection',
                'features' => [
                    [
                        'type' => 'Feature',
                        'id' => $spatialPlan->id,
                        'properties' => [
                            'id' => $spatialPlan->id,
                            'title' => $spatialPlan->title,
                            'pillar_type' => $spatialPlan->pillar_type,
                            'area_size' => $spatialPlan->area_size,
                            'status' => $spatialPlan->status,
                        ],
                        'geometry' => $geometry,
                    ],
                ],
            ];
        }

        $campusBoundary = null;
        if ($spatialPlan->campus && !empty($spatialPlan->campus->boundary_geometry)) {
            $campusBoundary = [
                'type' => 'FeatureCollection',
                'features' => [
                    [
                        'type' => 'Feature',
                        'id' => $spatialPlan->campus->id,
                        'properties' => ['name' => $spatialPlan->campus->name],
                        'geometry' => $spatialPlan->campus->boundary_geometry,
                    ],
                ],
            ];
        }

        return Inertia::render('SpatialPlans/Show', [
            'plan' => $spatialPlan,
            'planGeoJson' => $planGeoJson,
            'campusBoundary' => $campusBoundary,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Show the form for editing the specified spatial plan (Admin only).
     */
    public function edit(CampusSpatialPlan $spatialPlan, Request $request): Response
    {
        $spatialPlan->load(['campus', 'landUse']);

        $campuses = Campus::with(['landUses' => function ($q) {
            $q->select('id', 'name', 'code', 'campus_id', 'area_size', 'category_id', 'green_status', 'geometry')
                ->with('category:id,name,color');
        }])->get();

        $analysis = $this->analysisService->analyze($spatialPlan->campus_id);
        $recommendations = $this->recommendationService->generateSpatialRecommendations($analysis, $spatialPlan->campus_id);

        $recItems = [];
        $categories = [
            'conservation_layers' => 'Konservasi Prioritas',
            'revitalization_layers' => 'Revitalisasi Vegetasi',
            'rth_conversion_layers' => 'Konversi RTH Baru',
            'potential_layers' => 'Potensi Roof Garden / Koridor',
        ];

        foreach ($categories as $key => $catTitle) {
            if (!empty($recommendations[$key])) {
                foreach ($recommendations[$key] as $item) {
                    $recItems[] = array_merge($item, [
                        'group_label' => $catTitle,
                    ]);
                }
            }
        }

        return Inertia::render('SpatialPlans/Edit', [
            'plan' => $spatialPlan,
            'effectiveGeometry' => $spatialPlan->effective_geometry,
            'campuses' => $campuses,
            'recommendationItems' => $recItems,
        ]);
    }

    /**
     * Update the specified spatial plan (Admin only).
     */
    public function update(Request $request, CampusSpatialPlan $spatialPlan): RedirectResponse
    {
        $validated = $request->validate([
            'campus_id' => 'required|exists:campuses,id',
            'land_use_id' => 'nullable|exists:land_uses,id',
            'title' => 'required|string|max:255',
            'pillar_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'target_year' => 'nullable|string|max:50',
            'area_size' => 'nullable|numeric|min:0',
            'potential_gain_percent' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,approved,implemented',
            'notes' => 'nullable|string',
            'geometry' => 'nullable',
        ]);

        $geometry = $validated['geometry'] ?? null;
        if (is_string($geometry)) {
            $geometry = json_decode($geometry, true);
        }

        $areaSize = (float) ($validated['area_size'] ?? 0);
        if ($geometry && (!isset($validated['area_size']) || $areaSize <= 0)) {
            $areaSize = $this->geoJsonService->calculateAreaM2($geometry);
        }

        $campus = Campus::find($validated['campus_id']);
        $gainPercent = (float) ($validated['potential_gain_percent'] ?? 0);
        if ($campus && $campus->total_area > 0 && $areaSize > 0 && $gainPercent <= 0) {
            $gainPercent = round(($areaSize / (float) $campus->total_area) * 100, 2);
        }

        $updateData = [
            'campus_id' => $validated['campus_id'],
            'land_use_id' => $validated['land_use_id'] ?? null,
            'geometry' => $geometry,
            'title' => $validated['title'],
            'pillar_type' => $validated['pillar_type'],
            'description' => $validated['description'] ?? null,
            'target_year' => $validated['target_year'],
            'area_size' => $areaSize,
            'potential_gain_percent' => $gainPercent,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ];

        if ($validated['status'] === 'approved' && $spatialPlan->status !== 'approved') {
            $updateData['approved_by'] = Auth::id();
            $updateData['approved_at'] = now();
        } elseif ($validated['status'] === 'draft' && $spatialPlan->status === 'approved') {
            $updateData['approved_by'] = null;
            $updateData['approved_at'] = null;
        }

        $spatialPlan->update($updateData);

        ActivityLogService::log(
            'update',
            'spatial_plan',
            "Memperbarui rencana spasial '{$spatialPlan->title}' ({$validated['status']})",
            $spatialPlan->id
        );

        return redirect()->route('spatial-plans.index')
            ->with('success', "Rencana spasial '{$spatialPlan->title}' berhasil diperbarui.");
    }

    /**
     * Toggle or update status of a spatial plan (Admin only).
     */
    public function approve(Request $request, CampusSpatialPlan $spatialPlan): RedirectResponse
    {
        $targetStatus = $request->input('status');

        if ($targetStatus && in_array($targetStatus, ['draft', 'approved', 'implemented'])) {
            $isApprovedOrImplemented = in_array($targetStatus, ['approved', 'implemented']);
            $spatialPlan->update([
                'status' => $targetStatus,
                'approved_by' => $isApprovedOrImplemented ? ($spatialPlan->approved_by ?: Auth::id()) : null,
                'approved_at' => $isApprovedOrImplemented ? ($spatialPlan->approved_at ?: now()) : null,
            ]);

            $labels = [
                'draft' => 'Draft',
                'approved' => 'Disetujui (Approved)',
                'implemented' => 'Terimplementasi (Implemented)',
            ];

            ActivityLogService::log(
                'update',
                'spatial_plan',
                "Mengubah status rencana spasial '{$spatialPlan->title}' menjadi " . ($labels[$targetStatus] ?? $targetStatus),
                $spatialPlan->id
            );

            return back()->with('success', "Status rencana '{$spatialPlan->title}' diubah menjadi " . ($labels[$targetStatus] ?? $targetStatus) . ".");
        }

        // Default toggle: if approved/implemented -> back to draft, if draft -> approved
        if ($spatialPlan->status === 'approved' || $spatialPlan->status === 'implemented') {
            $spatialPlan->update([
                'status' => 'draft',
                'approved_by' => null,
                'approved_at' => null,
            ]);

            ActivityLogService::log(
                'update',
                'spatial_plan',
                "Membatalkan status rencana spasial '{$spatialPlan->title}' ke Draft",
                $spatialPlan->id
            );

            return back()->with('info', "Rencana '{$spatialPlan->title}' dikembalikan ke status Draft.");
        } else {
            $spatialPlan->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            ActivityLogService::log(
                'update',
                'spatial_plan',
                "Melakukan ACC & mempublikasikan rencana spasial '{$spatialPlan->title}'",
                $spatialPlan->id
            );

            return back()->with('success', "Rencana '{$spatialPlan->title}' berhasil di-ACC dan dipublikasikan.");
        }
    }

    /**
     * Delete the specified spatial plan (Admin only).
     */
    public function destroy(CampusSpatialPlan $spatialPlan): RedirectResponse
    {
        $title = $spatialPlan->title;
        $id = $spatialPlan->id;
        $spatialPlan->delete();

        ActivityLogService::log(
            'delete',
            'spatial_plan',
            "Menghapus rencana spasial #{$id} ({$title})",
            $id
        );

        return redirect()->route('spatial-plans.index')
            ->with('success', "Rencana spasial '{$title}' berhasil dihapus.");
    }
}
