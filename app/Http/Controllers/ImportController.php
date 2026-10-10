<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportGeoJsonRequest;
use App\Models\Campus;
use App\Models\LandUse;
use App\Models\LandUseCategory;
use App\Services\ActivityLogService;
use App\Services\GeoJsonService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImportController extends Controller
{
    public function __construct(
        protected GeoJsonService $geoJsonService,
    ) {}

    public function create(): Response
    {
        $campuses = Campus::select('id', 'name', 'code')->get();
        $categories = LandUseCategory::select('id', 'name', 'color')->get();

        return Inertia::render('LandUses/Import', [
            'campuses' => $campuses,
            'categories' => $categories,
        ]);
    }

    public function store(ImportGeoJsonRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        if (!$file || !$file->isValid()) {
            return back()->withErrors(['file' => 'Berkas GeoJSON gagal diunggah atau tidak valid.']);
        }

        // Safely retrieve file contents
        try {
            $content = $file->get();
        } catch (\Throwable $e) {
            $path = $file->getPathname() ?: $file->getRealPath();
            $content = !empty($path) && file_exists($path) ? file_get_contents($path) : false;
        }

        if ($content === false || trim($content) === '') {
            return back()->withErrors(['file' => 'Tidak dapat membaca isi berkas GeoJSON. Pastikan berkas tidak kosong.']);
        }

        // Strip UTF-8 BOM if present
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);

        $geoJson = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($geoJson)) {
            return back()->withErrors(['file' => 'Berkas bukan format GeoJSON/JSON yang valid: ' . json_last_error_msg()]);
        }

        $features = [];
        if (isset($geoJson['type']) && $geoJson['type'] === 'FeatureCollection' && isset($geoJson['features']) && is_array($geoJson['features'])) {
            $features = $geoJson['features'];
        } elseif (isset($geoJson['type']) && $geoJson['type'] === 'Feature') {
            $features = [$geoJson];
        } else {
            return back()->withErrors(['file' => 'Struktur GeoJSON harus berupa FeatureCollection atau Feature.']);
        }

        $campusId = (int) $request->validated('campus_id');
        $defaultCategoryId = (int) $request->validated('default_category_id');
        $defaultGreenStatus = $request->validated('default_green_status');

        $categoriesByName = LandUseCategory::all()->keyBy(fn ($c) => strtolower(trim($c->name)));

        $importedCount = 0;
        $errors = [];

        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            foreach ($features as $index => $feature) {
                $geom = $feature['geometry'] ?? null;
                $validation = $this->geoJsonService->validateGeometry($geom);

                if (!$validation['valid']) {
                    $errors[] = "Fitur #" . ($index + 1) . ": " . $validation['error'];
                    continue;
                }

                $props = $feature['properties'] ?? [];
                $name = $props['name'] ?? $props['Nama'] ?? $props['NAMA'] ?? ("Objek Spasial " . ($importedCount + 1));
                $code = $props['code'] ?? $props['Kode'] ?? $props['KODE'] ?? null;

                // Category match or fallback
                $categoryId = $defaultCategoryId;
                $categoryProp = strtolower(trim($props['category'] ?? $props['kategori'] ?? $props['KATEGORI'] ?? ''));
                if ($categoryProp && isset($categoriesByName[$categoryProp])) {
                    $categoryId = $categoriesByName[$categoryProp]->id;
                }

                // Green status match or fallback
                $greenStatus = $defaultGreenStatus;
                $greenProp = $props['green_status'] ?? $props['status'] ?? null;
                if ($greenProp && in_array($greenProp, ['Green Area', 'Vegetasi Non-RTH', 'Non-Green Area'])) {
                    $greenStatus = $greenProp;
                }

                // Condition
                $condition = $props['condition'] ?? $props['kondisi'] ?? 'Baik';
                if (!in_array($condition, ['Baik', 'Sedang', 'Kurang'])) {
                    $condition = 'Baik';
                }

                // Area size: use property if available, otherwise compute from geometry
                $areaSize = isset($props['area_size']) && is_numeric($props['area_size']) && $props['area_size'] > 0
                    ? (float) $props['area_size']
                    : $this->geoJsonService->calculateAreaM2($validation['geometry']);

                if ($areaSize <= 0) {
                    $areaSize = 1.0;
                }

                $description = $props['description'] ?? $props['deskripsi'] ?? null;

                LandUse::create([
                    'campus_id' => $campusId,
                    'category_id' => $categoryId,
                    'code' => $code,
                    'name' => $name,
                    'area_size' => $areaSize,
                    'green_status' => $greenStatus,
                    'condition' => $condition,
                    'geometry' => $validation['geometry'],
                    'description' => $description,
                ]);

                $importedCount++;
            }

            if ($importedCount === 0) {
                \Illuminate\Support\Facades\DB::rollBack();
                $errDetail = !empty($errors) ? ' Detail kendala: ' . implode('; ', array_slice($errors, 0, 3)) : '';
                return back()->withErrors(['file' => 'Tidak ada fitur polygon valid yang berhasil diimpor.' . $errDetail]);
            }

            \Illuminate\Support\Facades\DB::commit();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error('GeoJSON Import Exception: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            return back()->withErrors(['file' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()]);
        }

        ActivityLogService::log(
            'import',
            'land_use',
            "Mengimpor {$importedCount} fitur spasial dari berkas {$file->getClientOriginalName()}"
        );

        return redirect()->route('land-uses.index')
            ->with('success', "Berhasil mengimpor {$importedCount} objek spasial dari file GeoJSON.");
    }
}
