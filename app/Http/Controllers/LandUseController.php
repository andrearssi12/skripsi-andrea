<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLandUseRequest;
use App\Http\Requests\UpdateLandUseRequest;
use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Services\ActivityLogService;
use App\Services\GeoJsonService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandUseController extends Controller
{
    public function __construct(
        protected GeoJsonService $geoJsonService,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $campusId = $request->query('campus_id');
        $categoryId = $request->query('category_id');
        $greenStatus = $request->query('green_status');
        $condition = $request->query('condition');

        $landUses = LandUse::with(['campus', 'category', 'parent'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($campusId, fn ($q) => $q->where('campus_id', $campusId))
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->when($greenStatus, fn ($q) => $q->where('green_status', $greenStatus))
            ->when($condition, fn ($q) => $q->where('condition', $condition))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $campuses = Campus::select('id', 'name', 'code', 'boundary_geometry')->get();
        $categories = LandUseCategory::select('id', 'name', 'color')->get();

        return Inertia::render('LandUses/Index', [
            'landUses' => $landUses,
            'campuses' => $campuses,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'campus_id' => $campusId,
                'category_id' => $categoryId,
                'green_status' => $greenStatus,
                'condition' => $condition,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $campuses = Campus::select('id', 'name', 'code', 'boundary_geometry', 'total_area')->get();
        $categories = LandUseCategory::select('id', 'name', 'color')->get();
        $parentCandidates = LandUse::select('id', 'name', 'code', 'campus_id')->get();

        // Load all land uses as context reference GeoJSON for the creation map
        $allLandUses = LandUse::with('category')->get();
        $allLandUsesGeoJson = [
            'type' => 'FeatureCollection',
            'features' => $allLandUses->filter(fn($lu) => !empty($lu->geometry))->map(fn($lu) => [
                'type' => 'Feature',
                'properties' => [
                    'id' => $lu->id,
                    'campus_id' => $lu->campus_id,
                    'name' => $lu->name,
                    'green_status' => $lu->green_status,
                    'category_name' => $lu->category?->name,
                    'category_color' => $lu->category?->color,
                    'area_size' => $lu->area_size,
                ],
                'geometry' => $lu->geometry,
            ])->values()->all(),
        ];

        return Inertia::render('LandUses/Create', [
            'campuses' => $campuses,
            'categories' => $categories,
            'parentCandidates' => $parentCandidates,
            'defaultCampusId' => $request->query('campus_id'),
            'allLandUsesGeoJson' => $allLandUsesGeoJson,
        ]);
    }

    public function store(StoreLandUseRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Validate geometry structure
        $validation = $this->geoJsonService->validateGeometry($data['geometry']);
        if (!$validation['valid']) {
            return back()->withErrors(['geometry' => $validation['error']])->withInput();
        }

        // Validate containment in selected campus boundary
        $campus = Campus::findOrFail($data['campus_id']);
        if (!empty($campus->boundary_geometry)) {
            $isInside = $this->geoJsonService->isPolygonInsideBoundary($validation['geometry'], $campus->boundary_geometry);
            if (!$isInside) {
                return back()->withErrors([
                    'geometry' => 'Poligon objek lahan harus berada seluruhnya di dalam batas wilayah kampus ' . $campus->name . '.',
                ])->withInput();
            }
        }

        $data['geometry'] = $validation['geometry'];

        $landUse = LandUse::create($data);

        ActivityLogService::log(
            'create',
            'land_use',
            "Menambahkan objek penggunaan lahan '{$landUse->name}' ({$landUse->green_status}, {$landUse->area_size} m²)",
            $landUse->id
        );

        return redirect()->route('land-uses.index')
            ->with('success', "Objek lahan '{$landUse->name}' berhasil ditambahkan.");
    }

    public function show($landUse): Response
    {
        $resolvedLandUse = $landUse instanceof LandUse ? $landUse : LandUse::findOrFail($landUse);
        $resolvedLandUse->load(['campus', 'category', 'parent', 'children.category', 'feedback.user']);

        return Inertia::render('LandUses/Show', [
            'landUse' => $resolvedLandUse,
            'campusBoundary' => $resolvedLandUse->campus?->boundary_geometry,
        ]);
    }

    public function edit($landUse): Response
    {
        $resolvedLandUse = $landUse instanceof LandUse ? $landUse : LandUse::findOrFail($landUse);
        $campuses = Campus::select('id', 'name', 'code', 'boundary_geometry', 'total_area')->get();
        $categories = LandUseCategory::select('id', 'name', 'color')->get();
        $parentCandidates = LandUse::where('id', '!=', $resolvedLandUse->id)
            ->select('id', 'name', 'code', 'campus_id')
            ->get();

        // All other land uses across campuses as reference GeoJSON
        $otherLandUses = LandUse::with('category')
            ->where('id', '!=', $resolvedLandUse->id)
            ->get();

        $existingLandUsesGeoJson = [
            'type' => 'FeatureCollection',
            'features' => $otherLandUses->filter(fn($lu) => !empty($lu->geometry))->map(fn($lu) => [
                'type' => 'Feature',
                'properties' => [
                    'id' => $lu->id,
                    'campus_id' => $lu->campus_id,
                    'name' => $lu->name,
                    'green_status' => $lu->green_status,
                    'category_name' => $lu->category?->name,
                    'category_color' => $lu->category?->color,
                    'area_size' => $lu->area_size,
                ],
                'geometry' => $lu->geometry,
            ])->values()->all(),
        ];

        return Inertia::render('LandUses/Edit', [
            'landUse' => $resolvedLandUse,
            'campuses' => $campuses,
            'categories' => $categories,
            'parentCandidates' => $parentCandidates,
            'existingLandUsesGeoJson' => $existingLandUsesGeoJson,
        ]);
    }

    public function update(UpdateLandUseRequest $request, $landUse): RedirectResponse
    {
        $resolvedLandUse = $landUse instanceof LandUse ? $landUse : LandUse::findOrFail($landUse);
        $data = $request->validated();

        $validation = $this->geoJsonService->validateGeometry($data['geometry']);
        if (!$validation['valid']) {
            return back()->withErrors(['geometry' => $validation['error']])->withInput();
        }

        // Validate containment in selected campus boundary
        $campus = Campus::findOrFail($data['campus_id']);
        if (!empty($campus->boundary_geometry)) {
            $isInside = $this->geoJsonService->isPolygonInsideBoundary($validation['geometry'], $campus->boundary_geometry);
            if (!$isInside) {
                return back()->withErrors([
                    'geometry' => 'Poligon objek lahan harus berada seluruhnya di dalam batas wilayah kampus ' . $campus->name . '.',
                ])->withInput();
            }
        }

        $data['geometry'] = $validation['geometry'];

        $resolvedLandUse->update($data);

        ActivityLogService::log(
            'update',
            'land_use',
            "Memperbarui objek penggunaan lahan '{$resolvedLandUse->name}'",
            $resolvedLandUse->id
        );

        return redirect()->route('land-uses.index')
            ->with('success', "Objek lahan '{$resolvedLandUse->name}' berhasil diperbarui.");
    }

    public function destroy($landUse): RedirectResponse
    {
        $resolvedLandUse = $landUse instanceof LandUse ? $landUse : LandUse::findOrFail($landUse);
        $name = $resolvedLandUse->name;
        $id = $resolvedLandUse->id;

        $resolvedLandUse->delete();

        ActivityLogService::log(
            'delete',
            'land_use',
            "Menghapus objek penggunaan lahan '{$name}'",
            $id
        );

        return redirect()->route('land-uses.index')
            ->with('success', "Objek lahan '{$name}' berhasil dihapus.");
    }
}
