<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCampusRequest;
use App\Http\Requests\UpdateCampusRequest;
use App\Models\Campus;
use App\Models\LandUse;
use App\Services\ActivityLogService;
use App\Services\GreenAreaAnalysisService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampusController extends Controller
{
    public function __construct(
        protected GreenAreaAnalysisService $analysisService,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $campuses = Campus::withCount('landUses')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Campuses/Index', [
            'campuses' => $campuses,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        // Load other campuses as context reference boundaries
        $allCampuses = Campus::select('id', 'name', 'code', 'boundary_geometry', 'total_area')->get();
        $otherCampusesGeoJson = [
            'type' => 'FeatureCollection',
            'features' => $allCampuses->filter(fn($c) => !empty($c->boundary_geometry))->map(fn($c) => [
                'type' => 'Feature',
                'id' => $c->id,
                'properties' => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'code' => $c->code,
                    'total_area' => $c->total_area,
                ],
                'geometry' => $c->boundary_geometry,
            ])->values()->all(),
        ];

        return Inertia::render('Campuses/Create', [
            'otherCampusesGeoJson' => $otherCampusesGeoJson,
        ]);
    }

    public function store(StoreCampusRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Accept both raw string JSON and already-decoded array
        if (isset($data['boundary_geometry'])) {
            if (is_string($data['boundary_geometry'])) {
                $decoded = json_decode($data['boundary_geometry'], true);
                $data['boundary_geometry'] = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
            }
        }

        $campus = Campus::create($data);

        ActivityLogService::log(
            'create',
            'campus',
            "Menambahkan data kampus {$campus->name} ({$campus->code})",
            $campus->id
        );

        return redirect()->route('campuses.index')
            ->with('success', 'Data kampus berhasil ditambahkan.');
    }

    public function show($campus): Response
    {
        $resolvedCampus = $campus instanceof Campus ? $campus : Campus::findOrFail($campus);
        $resolvedCampus->loadCount('landUses');
        $analysis = $this->analysisService->analyze($resolvedCampus->id);

        return Inertia::render('Campuses/Show', [
            'campus' => $resolvedCampus,
            'analysis' => $analysis,
        ]);
    }

    public function edit($campus): Response
    {
        $resolvedCampus = $campus instanceof Campus ? $campus : Campus::findOrFail($campus);

        // Load all other campuses as spatial context
        $otherCampuses = Campus::where('id', '!=', $resolvedCampus->id)->get();
        $otherCampusesGeoJson = [
            'type' => 'FeatureCollection',
            'features' => $otherCampuses->filter(fn($c) => !empty($c->boundary_geometry))->map(fn($c) => [
                'type' => 'Feature',
                'id' => $c->id,
                'properties' => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'code' => $c->code,
                    'total_area' => $c->total_area,
                ],
                'geometry' => $c->boundary_geometry,
            ])->values()->all(),
        ];

        // Load all land uses on this campus as reference GeoJSON
        $landUses = $resolvedCampus->landUses()->with('category')->get();
        $existingLandUsesGeoJson = [
            'type' => 'FeatureCollection',
            'features' => $landUses->filter(fn($lu) => !empty($lu->geometry))->map(fn($lu) => [
                'type' => 'Feature',
                'properties' => [
                    'id' => $lu->id,
                    'name' => $lu->name,
                    'green_status' => $lu->green_status,
                    'category_name' => $lu->category?->name,
                    'category_color' => $lu->category?->color,
                    'area_size' => $lu->area_size,
                ],
                'geometry' => $lu->geometry,
            ])->values()->all(),
        ];

        return Inertia::render('Campuses/Edit', [
            'campus' => $resolvedCampus,
            'otherCampusesGeoJson' => $otherCampusesGeoJson,
            'existingLandUsesGeoJson' => $existingLandUsesGeoJson,
        ]);
    }

    public function update(UpdateCampusRequest $request, $campus): RedirectResponse
    {
        $resolvedCampus = $campus instanceof Campus ? $campus : Campus::findOrFail($campus);
        $data = $request->validated();

        // Accept both raw string JSON and already-decoded array
        if (isset($data['boundary_geometry'])) {
            if (is_string($data['boundary_geometry'])) {
                $decoded = json_decode($data['boundary_geometry'], true);
                $data['boundary_geometry'] = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
            }
        }

        $resolvedCampus->update($data);

        ActivityLogService::log(
            'update',
            'campus',
            "Memperbarui data kampus {$resolvedCampus->name} ({$resolvedCampus->code})",
            $resolvedCampus->id
        );

        return redirect()->route('campuses.index')
            ->with('success', 'Data kampus berhasil diperbarui.');
    }

    public function destroy($campus): RedirectResponse
    {
        $resolvedCampus = $campus instanceof Campus ? $campus : Campus::findOrFail($campus);
        $name = $resolvedCampus->name;
        $id = $resolvedCampus->id;

        $resolvedCampus->delete();

        ActivityLogService::log(
            'delete',
            'campus',
            "Menghapus data kampus {$name}",
            $id
        );

        return redirect()->route('campuses.index')
            ->with('success', "Kampus {$name} berhasil dihapus.");
    }
}
