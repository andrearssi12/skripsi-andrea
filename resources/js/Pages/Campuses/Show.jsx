import { Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import { formatArea } from '@/lib/utils';
import { downloadGeoJson } from '@/lib/geojsonParser';
import { ArrowLeft, Edit, Building2, Trees, Sprout, Layers, MapPin, Download } from 'lucide-react';

export default function CampusShow({ campus, analysis }) {
    const isAchieved = analysis.is_achieved;

    return (
        <>
            <Head title={`Detail Kampus: ${campus.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/campuses" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="badge badge-green font-bold">{campus.code}</span>
                                <h1 className="page-title text-xl">{campus.name}</h1>
                            </div>
                            <p className="page-subtitle flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {campus.address || 'Alamat belum diatur'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {campus.boundary_geometry && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    const exportData = {
                                        type: 'Feature',
                                        properties: {
                                            id: campus.id,
                                            code: campus.code,
                                            name: campus.name,
                                            total_area: campus.total_area,
                                            address: campus.address,
                                            description: campus.description,
                                            type: 'campus_boundary',
                                        },
                                        geometry: campus.boundary_geometry,
                                    };
                                    const safeName = (campus.name || 'batas_kampus').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
                                    downloadGeoJson(exportData, `batas_${safeName}.geojson`);
                                }}
                                title="Unduh batas wilayah kampus sebagai GeoJSON untuk QGIS"
                            >
                                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Ekspor GeoJSON
                            </Button>
                        )}
                        <Link href={`/campuses/${campus.id}/edit`}>
                            <Button variant="secondary" size="sm">
                                <Edit className="w-4 h-4" />
                                Edit Kampus
                            </Button>
                        </Link>
                        <Link href={`/map?campus_id=${campus.id}`}>
                            <Button variant="primary" size="sm">
                                Lihat di Peta
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Analysis KPI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Total Luas Kampus</span>
                        <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{formatArea(campus.total_area)}</p>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{campus.land_uses_count || 0} Objek Lahan Terpetakan</span>
                    </div>

                    <div className="stat-card">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Green Area (RTH)</span>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatArea(analysis.green_area_size)}</p>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="badge badge-green font-bold">{analysis.green_percentage}%</span>
                            <span className="text-gray-500 dark:text-slate-400">Target 30%</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Total Area Bervegetasi</span>
                        <p className="text-xl font-bold text-lime-700 dark:text-lime-400">{formatArea(analysis.total_vegetated_size)}</p>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{analysis.vegetated_percentage}% dari luas kampus</span>
                    </div>
                </div>

                {/* Campus Details Card */}
                <div className="card p-6 space-y-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 font-display">Informasi Umum</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-xs text-gray-500 dark:text-slate-400 block">Kode Kampus</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{campus.code}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-slate-400 block">Nama Kampus</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{campus.name}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-slate-400 block">Total Luas</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{formatArea(campus.total_area)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-slate-400 block">Status Capaian Green Campus</span>
                            <span className={`badge ${isAchieved ? 'badge-green' : 'badge-amber'} font-bold mt-0.5`}>
                                {analysis.status_text} ({analysis.green_percentage}%)
                            </span>
                        </div>
                    </div>

                    {campus.description && (
                        <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                            <span className="text-xs text-gray-500 dark:text-slate-400 block mb-1">Deskripsi</span>
                            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{campus.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

