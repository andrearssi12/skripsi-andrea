<?php

namespace App\Http\Controllers;

use App\Models\Campus;
use App\Models\LandUse;
use App\Services\ActivityLogService;
use App\Services\GeoJsonService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(
        protected GeoJsonService $geoJsonService,
    ) {}

    /**
     * Export spatial data as GeoJSON.
     */
    public function exportGeoJson(Request $request): StreamedResponse
    {
        $campusId = $request->query('campus_id');

        $query = LandUse::with(['category', 'campus', 'parent']);
        if ($campusId) {
            $query->where('campus_id', $campusId);
        }
        $landUses = $query->get();

        $geoJson = $this->geoJsonService->toFeatureCollection($landUses);

        $campusCode = $campusId ? (Campus::find($campusId)?->code ?? 'all') : 'all';
        $filename = "land_uses_{$campusCode}_" . date('Ymd_His') . '.geojson';

        ActivityLogService::log(
            'export',
            'export',
            "Mengekspor data spasial GeoJSON ({$landUses->count()} fitur)"
        );

        return response()->streamDownload(function () use ($geoJson) {
            echo json_encode($geoJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }, $filename, [
            'Content-Type' => 'application/geo+json',
        ]);
    }

    /**
     * Export tabular data as CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $campusId = $request->query('campus_id');

        $query = LandUse::with(['category', 'campus', 'parent']);
        if ($campusId) {
            $query->where('campus_id', $campusId);
        }
        $landUses = $query->get();

        $campusCode = $campusId ? (Campus::find($campusId)?->code ?? 'all') : 'all';
        $filename = "land_uses_{$campusCode}_" . date('Ymd_His') . '.csv';

        ActivityLogService::log(
            'export',
            'export',
            "Mengekspor data atribut CSV ({$landUses->count()} baris)"
        );

        return response()->streamDownload(function () use ($landUses) {
            $handle = fopen('php://output', 'w');

            // Add UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header row
            fputcsv($handle, [
                'ID',
                'Kode Objek',
                'Nama Objek',
                'Kampus',
                'Kategori',
                'Parent Objek',
                'Luas (m2)',
                'Green Status',
                'Kondisi',
                'Deskripsi',
                'Tanggal Dibuat',
                'Tanggal Diperbarui',
            ]);

            foreach ($landUses as $item) {
                fputcsv($handle, [
                    $item->id,
                    $item->code ?? '-',
                    $item->name,
                    $item->campus?->name ?? '-',
                    $item->category?->name ?? '-',
                    $item->parent?->name ?? '-',
                    $item->area_size,
                    $item->green_status,
                    $item->condition,
                    $item->description ?? '-',
                    $item->created_at?->format('Y-m-d H:i:s') ?? '-',
                    $item->updated_at?->format('Y-m-d H:i:s') ?? '-',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
