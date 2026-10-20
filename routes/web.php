<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\CampusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FeedbackHistoryController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LandUseCategoryController;
use App\Http\Controllers\LandUseController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SpatialPlanController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public Landing Page
Route::get('/', [LandingController::class, 'index'])->name('landing');

// Authenticated Routes (Civitas, Pengurus, & Admin)
Route::middleware(['auth'])->group(function () {
    // Interactive WebGIS Map
    Route::get('/map', [MapController::class, 'index'])->name('map.index');

    // Feedback (Civitas, Pengurus, & Admin)
    Route::get('/feedback', [FeedbackController::class, 'index'])->name('feedback.index');
    Route::get('/feedback/create', [FeedbackController::class, 'create'])->name('feedback.create');
    Route::post('/feedback', [FeedbackController::class, 'store'])->name('feedback.store');
    Route::patch('/feedback/{feedback}/status', [FeedbackController::class, 'updateStatus'])->name('feedback.update-status');
    Route::get('/feedback/history', [FeedbackHistoryController::class, 'index'])->name('feedback.history');
    Route::get('/feedback/{feedback}', [FeedbackController::class, 'show'])->name('feedback.show');

    // Spatial Plans (Public index & detail for approved plans)
    Route::get('/spatial-plans', [SpatialPlanController::class, 'index'])->name('spatial-plans.index');
    Route::get('/spatial-plans/{spatialPlan}', [SpatialPlanController::class, 'show'])->whereNumber('spatialPlan')->name('spatial-plans.show');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin-Only Routes (Dashboard, User CRUD, & Spatial Management)
Route::middleware(['auth', 'admin'])->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // User Management (CRUD & Batch Creation)
    Route::get('/users/batch', [UserController::class, 'batchCreate'])->name('users.batch.create');
    Route::post('/users/batch', [UserController::class, 'batchStore'])->name('users.batch.store');
    Route::get('/users/template/csv', [UserController::class, 'downloadTemplate'])->name('users.template.csv');
    Route::resource('users', UserController::class);

    // Campus Management
    Route::resource('campuses', CampusController::class)->parameters(['campuses' => 'campus']);

    // Land Use Categories
    Route::resource('land-use-categories', LandUseCategoryController::class)
        ->parameters(['land-use-categories' => 'landUseCategory'])
        ->except(['show']);

    // Land Use Objects (Spasial) & Arsip
    Route::get('/land-uses/import', [ImportController::class, 'create'])->name('land-uses.import.create');
    Route::post('/land-uses/import', [ImportController::class, 'store'])->name('land-uses.import.store');
    Route::post('/land-uses/{id}/restore', [LandUseController::class, 'restore'])->name('land-uses.restore');
    Route::delete('/land-uses/{id}/force-delete', [LandUseController::class, 'forceDelete'])->name('land-uses.force-delete');
    Route::resource('land-uses', LandUseController::class)->parameters(['land-uses' => 'landUse']);

    // Feedback Management (Deletion only for Admin)
    Route::delete('/feedback/{feedback}', [FeedbackController::class, 'destroy'])->name('feedback.destroy');

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

    // Spatial & Tabular Data Export
    Route::get('/export/geojson', [ExportController::class, 'exportGeoJson'])->name('export.geojson');
    Route::get('/export/csv', [ExportController::class, 'exportCsv'])->name('export.csv');
    Route::get('/export/stats', [ExportController::class, 'exportStats'])->name('export.stats');

    // Spatial Planning & Official Recommendations Management (Admin Only)
    Route::get('/spatial-plans/create', [SpatialPlanController::class, 'create'])->name('spatial-plans.create');
    Route::post('/spatial-plans', [SpatialPlanController::class, 'store'])->name('spatial-plans.store');
    Route::get('/spatial-plans/{spatialPlan}/edit', [SpatialPlanController::class, 'edit'])->whereNumber('spatialPlan')->name('spatial-plans.edit');
    Route::patch('/spatial-plans/{spatialPlan}', [SpatialPlanController::class, 'update'])->whereNumber('spatialPlan')->name('spatial-plans.update');
    Route::post('/spatial-plans/{spatialPlan}/approve', [SpatialPlanController::class, 'approve'])->whereNumber('spatialPlan')->name('spatial-plans.approve');
    Route::delete('/spatial-plans/{spatialPlan}', [SpatialPlanController::class, 'destroy'])->whereNumber('spatialPlan')->name('spatial-plans.destroy');
    Route::post('/spatial-plans/toggle-approval', [\App\Http\Controllers\CampusSpatialPlanController::class, 'toggleApproval'])->name('spatial-plans.toggle-approval');
});

require __DIR__ . '/auth.php';
