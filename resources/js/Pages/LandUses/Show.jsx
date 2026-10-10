import { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import LeafletMap from '@/components/map/LeafletMap';
import { formatArea, formatDate, getGreenStatusBadge, getConditionBadge, getFeedbackStatusBadge } from '@/lib/utils';
import { downloadGeoJson } from '@/lib/geojsonParser';
import { ArrowLeft, Edit, TreePine, MapPin, Building2, MessageSquare, Layers, Download } from 'lucide-react';

export default function LandUseShow({ landUse, campusBoundary }) {
    const singleGeoJson = useMemo(() => ({
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                id: landUse?.id,
                properties: {
                    id: landUse?.id,
                    name: landUse?.name,
                    category_name: landUse?.category?.name,
                    category_color: landUse?.category?.color,
                    green_status: landUse?.green_status,
                    condition: landUse?.condition,
                    area_size: landUse?.area_size,
                },
                geometry: landUse?.geometry,
            },
        ],
    }), [landUse]);

    const campusBoundariesGeoJson = useMemo(() => {
        if (!campusBoundary) return { type: 'FeatureCollection', features: [] };
        return {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { name: landUse?.campus?.name },
                    geometry: campusBoundary,
                },
            ],
        };
    }, [campusBoundary, landUse]);

    if (!landUse || !landUse.id) {
        return (
            <div className="card p-8 text-center text-gray-500 dark:text-slate-400">
                Objek penggunaan lahan tidak ditemukan.
            </div>
        );
    }

    return (
        <>
            <Head title={`Detail Objek: ${landUse.name}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/land-uses" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="page-title text-xl">{landUse.name}</h1>
                                {landUse.code && (
                                    <span className="text-xs font-mono text-gray-500 dark:text-slate-400">({landUse.code})</span>
                                )}
                            </div>
                            <p className="page-subtitle flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3.5 h-3.5" />
                                {landUse.campus?.name} • Kategori: {landUse.category?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                const exportData = {
                                    type: 'Feature',
                                    properties: {
                                        id: landUse.id,
                                        name: landUse.name,
                                        code: landUse.code,
                                        category: landUse.category?.name,
                                        campus: landUse.campus?.name,
                                        area_size: landUse.area_size,
                                        green_status: landUse.green_status,
                                        condition: landUse.condition,
                                        description: landUse.description,
                                    },
                                    geometry: landUse.geometry,
                                };
                                const safeName = (landUse.name || 'land_use').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
                                downloadGeoJson(exportData, `${safeName}.geojson`);
                            }}
                            title="Unduh berkas GeoJSON untuk dibuka di QGIS"
                        >
                            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Ekspor GeoJSON
                        </Button>
                        <Link href={`/land-uses/${landUse.id}/edit`}>
                            <Button variant="secondary" size="sm">
                                <Edit className="w-4 h-4" />
                                Edit Objek
                            </Button>
                        </Link>
                        <Link href={`/map?campus_id=${landUse.campus_id}`}>
                            <Button variant="primary" size="sm">
                                Buka di WebGIS
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 cols: Map and Geometry */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Map Preview */}
                        <div className="card p-5 space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 font-display flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                Visualisasi Spasial Objek
                            </h3>
                            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800">
                                <LeafletMap
                                    campusBoundaries={campusBoundariesGeoJson}
                                    landUsesGeoJson={singleGeoJson}
                                    height="100%"
                                />
                            </div>
                        </div>

                        {/* Sub-Objects (Children) if any */}
                        {landUse.children?.length > 0 && (
                            <div className="card p-5 space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 font-display flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    Objek Bagian di Dalam Area Ini ({landUse.children.length})
                                </h3>
                                <div className="space-y-2">
                                    {landUse.children.map((child) => (
                                        <div key={child.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 text-xs">
                                            <div>
                                                <Link href={`/land-uses/${child.id}`} className="font-bold text-gray-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400">
                                                    {child.name}
                                                </Link>
                                                <p className="text-gray-500 dark:text-slate-400 mt-0.5">{child.category?.name} • {formatArea(child.area_size)}</p>
                                            </div>
                                            <span className={`badge ${getGreenStatusBadge(child.green_status)} text-[10px]`}>
                                                {child.green_status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Feedback */}
                        <div className="card p-5 space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 font-display flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Laporan / Feedback Terkait Objek Ini ({landUse.feedback?.length || 0})
                            </h3>
                            {(!landUse.feedback || landUse.feedback.length === 0) ? (
                                <p className="text-xs text-gray-400 dark:text-slate-500 py-3">Belum ada feedback untuk objek ini.</p>
                            ) : (
                                <div className="space-y-2">
                                    {landUse.feedback.map((fb) => (
                                        <div key={fb.id} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 text-xs space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-900 dark:text-slate-100">{fb.title}</span>
                                                <span className={`badge ${getFeedbackStatusBadge(fb.status)} text-[10px]`}>
                                                    {fb.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-slate-400">{fb.message}</p>
                                            <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 pt-1">
                                                <span>Oleh: {fb.user?.name || 'Civitas'}</span>
                                                <span>{formatDate(fb.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right 1 col: Attributes */}
                    <div className="space-y-6">
                        <div className="card p-5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 font-display">
                                Atribut Objek Lahan
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-gray-500 dark:text-slate-400">Kategori</span>
                                    <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: landUse.category?.color }}
                                        />
                                        {landUse.category?.name}
                                    </span>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-gray-500 dark:text-slate-400">Zonasi Hijau</span>
                                    <span className={`badge ${getGreenStatusBadge(landUse.green_status)} text-[10px]`}>
                                        {landUse.green_status}
                                    </span>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-gray-500 dark:text-slate-400">Luas Area</span>
                                    <span className="font-bold text-gray-900 dark:text-slate-100">{formatArea(landUse.area_size)}</span>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-gray-500 dark:text-slate-400">Kondisi Fisik</span>
                                    <span className={`badge ${getConditionBadge(landUse.condition)} text-[10px]`}>
                                        {landUse.condition}
                                    </span>
                                </div>

                                {landUse.parent && (
                                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                                        <span className="text-gray-500 dark:text-slate-400">Objek Induk</span>
                                        <Link href={`/land-uses/${landUse.parent.id}`} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                                            {landUse.parent.name}
                                        </Link>
                                    </div>
                                )}

                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-gray-500 dark:text-slate-400">Tanggal Dibuat</span>
                                    <span className="text-gray-700 dark:text-slate-300">{formatDate(landUse.created_at)}</span>
                                </div>

                                <div className="flex justify-between py-1.5">
                                    <span className="text-gray-500 dark:text-slate-400">Terakhir Diperbarui</span>
                                    <span className="text-gray-700 dark:text-slate-300">{formatDate(landUse.updated_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        {landUse.description && (
                            <div className="card p-5 space-y-2">
                                <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                    Deskripsi & Catatan
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                                    {landUse.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

