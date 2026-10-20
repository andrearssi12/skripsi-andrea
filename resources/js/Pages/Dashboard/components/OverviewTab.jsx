import React from 'react';
import { Link } from '@inertiajs/react';
import { Building2, Trees, Sprout, MessageSquare, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { formatArea, formatDate, getFeedbackStatusBadge } from '@/lib/utils';
import StatCard from '@/components/common/StatCard';
import LeafletMap from '@/components/map/LeafletMap';
import MapLegend from '@/components/map/MapLegend';
import MapPopup from '@/components/map/MapPopup';

export default function OverviewTab({
    analysis = {},
    selectedCampus,
    feedbackStats = {},
    geoJsonData,
    campusBoundaries,
    selectedCampusBoundary,
    overviewMapMode,
    setOverviewMapMode,
    simulatedLayerIds = [],
    feedbackGeoJson,
    selectedOverviewItem,
    setSelectedOverviewItem,
    categories = [],
    setDashboardTab,
    recentFeedback = [],
}) {
    const greenPercent = analysis.green_percentage ?? 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Luas Kampus"
                    value={formatArea(analysis.total_campus_area)}
                    subtitle={selectedCampus ? selectedCampus.name : `${analysis.campus_count} Kampus terdaftar`}
                    icon={Building2}
                    iconBg="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                />

                <div className="stat-card">
                    <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-medium">
                        <span>Green Area (RTH Murni)</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Trees className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-display">
                        {formatArea(analysis.green_area_size)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        <span className="badge badge-green font-bold">{greenPercent}%</span>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">dari luas kampus</span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                        Kawasan hijau permanen / RTH terbuka
                    </p>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-medium">
                        <span>Area Bervegetasi Total</span>
                        <div className="w-8 h-8 rounded-xl bg-lime-50 dark:bg-lime-950/60 text-lime-700 dark:text-lime-400 flex items-center justify-center">
                            <Sprout className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-lime-800 dark:text-lime-400 font-display">
                        {formatArea(analysis.total_vegetated_size)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-lime-800 dark:text-lime-400 font-medium">
                        <span className="badge badge-lime font-bold">{analysis.vegetated_percentage}%</span>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">RTH + Non-RTH</span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 truncate" title={`RTH (${formatArea(analysis.green_area_size)}) + Non-RTH (${formatArea(analysis.vegetasi_non_rth_size)})`}>
                        RTH ({formatArea(analysis.green_area_size)}) + Non-RTH ({formatArea(analysis.vegetasi_non_rth_size)})
                    </p>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-medium">
                        <span>Laporan & Masukan Civitas</span>
                        <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-display">
                        {feedbackStats.total || 0}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {feedbackStats.pending || 0} Menunggu tindak lanjut
                    </p>
                </div>
            </div>

            {/* Peta Monitoring */}
            <div className="card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 font-display">
                                Peta Interaktif Monitoring Lahan & Laporan Civitas
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            {selectedCampus ? `${selectedCampus.name} • ` : ''}
                            {geoJsonData?.features?.length || 0} objek spasial terpetakan • Klik objek untuk inspeksi
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center p-0.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs border border-gray-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setOverviewMapMode('standard')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                    overviewMapMode === 'standard'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                                }`}
                            >
                                Kategori Lahan
                            </button>
                            <button
                                type="button"
                                onClick={() => setOverviewMapMode('spatial_analysis')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                                    overviewMapMode === 'spatial_analysis'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Pratinjau Zonasi</span>
                            </button>
                        </div>

                        <Link href="/map" className="btn btn-secondary btn-sm flex items-center gap-1.5 font-bold">
                            <span>Buka Full WebGIS</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-inner">
                    <LeafletMap
                        campusBoundaries={campusBoundaries}
                        selectedCampusBoundary={selectedCampusBoundary}
                        landUsesGeoJson={geoJsonData}
                        mapMode={overviewMapMode}
                        simulatedLayerIds={simulatedLayerIds}
                        feedbackGeoJson={feedbackGeoJson}
                        selectedFeature={selectedOverviewItem}
                        onPolygonClick={(feat) => setSelectedOverviewItem(feat)}
                        height="100%"
                    />
                    <MapLegend categories={categories} mapMode={overviewMapMode} />
                    <MapPopup
                        feature={selectedOverviewItem}
                        onClose={() => setSelectedOverviewItem(null)}
                    />
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-gray-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <strong>{analysis.green_percentage}%</strong> Green Area
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
                            <strong>{analysis.vegetated_percentage}%</strong> Total Vegetasi
                        </span>
                        {feedbackStats.total > 0 && (
                            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                                <span>💬</span>
                                <strong>{feedbackStats.total}</strong> Laporan Civitas
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setDashboardTab('spatial_studio')}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                        <span>Buka Studio Analisis & Perencanaan Spasial Lengkap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Distribusi Lahan & Feedback Civitas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-5 space-y-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 font-display">
                            Distribusi Penggunaan Lahan
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            Proporsi luas tutupan dan kategori fisik kampus
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        {(analysis.status_breakdown || []).map((item, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        {item.status}
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-slate-100">
                                        {formatArea(item.area_size)} ({item.percentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="p-2.5 rounded-xl bg-lime-50/70 dark:bg-lime-950/30 border border-lime-200 dark:border-lime-800/60 text-xs flex items-center justify-between">
                            <span className="font-semibold text-lime-900 dark:text-lime-200">
                                Total Bervegetasi (RTH + Non-RTH):
                            </span>
                            <span className="font-bold text-lime-900 dark:text-lime-100">
                                {formatArea(analysis.total_vegetated_size)} ({analysis.vegetated_percentage}%)
                            </span>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Kategori Terbesar
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {(analysis.category_breakdown || []).slice(0, 6).map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 truncate text-gray-700 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                        <span className="truncate">{cat.name} ({cat.count} objek)</span>
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-slate-100 flex-shrink-0">
                                        {formatArea(cat.total_area)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 font-display">
                                    Feedback Civitas Terkini
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                    Laporan dan aspirasi civitas terkait kondisi kawasan
                                </p>
                            </div>
                        </div>
                        <Link href="/feedback" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-0.5">
                            <span>Lihat Semua</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentFeedback.length === 0 ? (
                        <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-500">
                            Belum ada feedback yang dikirimkan oleh civitas.
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {recentFeedback.map((fb) => (
                                <Link
                                    key={fb.id}
                                    href={`/feedback/${fb.id}`}
                                    className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-gray-100 dark:border-slate-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{fb.title}</p>
                                        <span className={`badge ${getFeedbackStatusBadge(fb.status)} text-[10px]`}>
                                            {fb.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 mt-0.5">{fb.message}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                                        Oleh {fb.user?.name || 'Anonim'} • {formatDate(fb.created_at)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="pt-2">
                        <Link href="/feedback/create" className="btn btn-secondary btn-sm w-full font-bold">
                            <MessageSquare className="w-4 h-4" />
                            <span>Buka Menu Kelola Feedback</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
