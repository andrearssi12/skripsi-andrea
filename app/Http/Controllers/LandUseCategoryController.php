<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLandUseCategoryRequest;
use App\Http\Requests\UpdateLandUseCategoryRequest;
use App\Models\LandUseCategory;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandUseCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $categories = LandUseCategory::withCount('landUses')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('LandUseCategories/Index', [
            'categories' => $categories,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('LandUseCategories/Create');
    }

    public function store(StoreLandUseCategoryRequest $request): RedirectResponse
    {
        $category = LandUseCategory::create($request->validated());

        ActivityLogService::log(
            'create',
            'land_use_category',
            "Menambahkan kategori penggunaan lahan {$category->name}",
            $category->id
        );

        return redirect()->route('land-use-categories.index')
            ->with('success', 'Kategori penggunaan lahan berhasil ditambahkan.');
    }

    public function edit($landUseCategory): Response
    {
        $resolvedCategory = $landUseCategory instanceof LandUseCategory ? $landUseCategory : LandUseCategory::findOrFail($landUseCategory);

        return Inertia::render('LandUseCategories/Edit', [
            'category' => $resolvedCategory,
        ]);
    }

    public function update(UpdateLandUseCategoryRequest $request, $landUseCategory): RedirectResponse
    {
        $resolvedCategory = $landUseCategory instanceof LandUseCategory ? $landUseCategory : LandUseCategory::findOrFail($landUseCategory);

        $resolvedCategory->update($request->validated());

        ActivityLogService::log(
            'update',
            'land_use_category',
            "Memperbarui kategori penggunaan lahan {$resolvedCategory->name}",
            $resolvedCategory->id
        );

        return redirect()->route('land-use-categories.index')
            ->with('success', 'Kategori penggunaan lahan berhasil diperbarui.');
    }

    public function destroy($landUseCategory): RedirectResponse
    {
        $resolvedCategory = $landUseCategory instanceof LandUseCategory ? $landUseCategory : LandUseCategory::findOrFail($landUseCategory);

        if ($resolvedCategory->landUses()->count() > 0) {
            return back()->with('error', "Kategori '{$resolvedCategory->name}' tidak dapat dihapus karena masih digunakan oleh {$resolvedCategory->landUses()->count()} objek penggunaan lahan.");
        }

        $name = $resolvedCategory->name;
        $id = $resolvedCategory->id;

        $resolvedCategory->delete();

        ActivityLogService::log(
            'delete',
            'land_use_category',
            "Menghapus kategori penggunaan lahan {$name}",
            $id
        );

        return redirect()->route('land-use-categories.index')
            ->with('success', "Kategori '{$name}' berhasil dihapus.");
    }
}
