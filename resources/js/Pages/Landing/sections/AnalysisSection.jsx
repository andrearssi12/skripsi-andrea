import React from 'react';
import { Link } from '@inertiajs/react';
import { Layers, Trees, Sprout, MessageSquare } from 'lucide-react';
import { formatArea, formatDate, getFeedbackStatusBadge } from '@/lib/utils';

export default function AnalysisSection({
    analysis = {},
    recommendations = {},
    recentFeedback = [],
    selectedCampus,
    greenPercent,
    vegetatedPercent,
    targetPercent = 30,
    gapPercent,
    isAchieved,
    user,
}) {
    const campusArea = selectedCampus?.total_area || analysis.total_campus_area || 0;
    const greenSize = analysis.green_area_size || 0;
    const nonRthSize = analysis.vegetasi_non_rth_size || 0;
    const totalVegSize = analysis.total_vegetated_size || (greenSize + nonRthSize);
    const vegPercent = Number(
        vegetatedPercent ??
            analysis.vegetated_percentage ??
            (campusArea > 0 ? ((totalVegSize / campusArea) * 100).toFixed(2) : 0),
    );
    const pureGreenPercent = Number(greenPercent ?? analysis.green_percentage ?? 0);
    const nonRthPercent = Number(Math.max(0, vegPercent - pureGreenPercent).toFixed(2));
    const targetArea = analysis.target_area || (campusArea * (targetPercent / 100));
    const totalVegDeficit = Math.max(0, targetArea - totalVegSize);
    const totalVegDeficitPercent = Math.max(0, Number((targetPercent - vegPercent).toFixed(2)));
    const isTotalAchieved = vegPercent >= targetPercent;

    return (
        <section id="analisis" className="bg-white dark:bg-slate-900 py-16 border-t border-gray-200/60 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Analisis Data Spasial</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-slate-100">
                        Distribusi Lahan & Rekomendasi Kampus
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Evaluasi rasio kawasan hijau dan panduan penataan lanskap ramah lingkungan</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 30% meter - Total Vegetasi */}
                    <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-5 ${
                        isTotalAchieved
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                    }`}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="badge badge-green font-bold text-xs">
                                    Standar 30% Vegetasi & RTH
                                </span>
                                <span className={`badge ${isTotalAchieved ? 'badge-green' : 'badge-amber'} text-xs font-semibold`}>
                                    {isTotalAchieved ? 'Target Terpenuhi' : 'Belum Memenuhi Target'}
                                </span>
                            </div>

                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-extrabold font-display text-gray-900 dark:text-slate-100">
                                        {vegPercent}%
                                    </span>
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                        Total Vegetasi
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-slate-300 mt-2 leading-relaxed">
                                    {isTotalAchieved
                                        ? `Total luasan bervegetasi (${formatArea(totalVegSize)}) telah melampaui target standar 30% luas kampus.`
                                        : `Total luasan bervegetasi saat ini ${formatArea(totalVegSize)} (${vegPercent}%). Perlu penambahan ±${formatArea(totalVegDeficit)} (${totalVegDeficitPercent}%) untuk mencapai target minimal 30%.`
                                    }
                                </p>
                            </div>

                            {/* Breakdown RTH vs Non-RTH */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60">
                                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                                        <Trees className="w-3.5 h-3.5" />
                                        <span>RTH (Green Area)</span>
                                    </div>
                                    <div className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                                        {pureGreenPercent}%
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-slate-400">
                                        {formatArea(greenSize)}
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60">
                                    <div className="flex items-center gap-1.5 text-lime-700 dark:text-lime-400 font-semibold mb-1">
                                        <Sprout className="w-3.5 h-3.5" />
                                        <span>Vegetasi Non-RTH</span>
                                    </div>
                                    <div className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                                        {nonRthPercent}%
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-slate-400">
                                        {formatArea(nonRthSize)}
                                    </div>
                                </div>
                            </div>

                            {/* Stacked Progress Bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden relative flex">
                                    {/* 30% Marker line */}
                                    <div
                                        className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-amber-600 dark:bg-amber-400 z-10"
                                        title="Target 30%"
                                    />
                                    {/* Segment 1: Green Area (RTH) */}
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                        style={{ width: `${Math.min(100, pureGreenPercent)}%` }}
                                        title={`RTH: ${pureGreenPercent}%`}
                                    />
                                    {/* Segment 2: Vegetasi Non-RTH */}
                                    <div
                                        className="h-full bg-lime-400 transition-all duration-1000"
                                        style={{ width: `${Math.min(100 - pureGreenPercent, nonRthPercent)}%` }}
                                        title={`Vegetasi Non-RTH: ${nonRthPercent}%`}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> RTH ({pureGreenPercent}%)
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-lime-400 inline-block" /> Non-RTH ({nonRthPercent}%)
                                    </span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-400">Target 30%</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs border-t border-current/10 pt-3 text-gray-700 dark:text-slate-300 flex justify-between items-center">
                            <span><strong>Total Kampus:</strong> {formatArea(campusArea)}</span>
                            <span><strong>Target 30%:</strong> {formatArea(targetArea)}</span>
                        </div>
                    </div>

                    {/* Category breakdown */}
                    <div className="card p-6 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-slate-100 font-display flex items-center gap-2 text-sm">
                            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Distribusi Kategori Lahan
                        </h3>
                        <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                            {(analysis.category_breakdown || []).map((cat, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="flex items-center gap-2 text-gray-800 dark:text-slate-200 truncate min-w-0">
                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                            <span className="truncate">{cat.name} <span className="text-gray-400 dark:text-slate-500">({cat.count})</span></span>
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-slate-100 flex-shrink-0 pl-2">{cat.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="card p-6 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-slate-100 font-display flex items-center gap-2 text-sm">
                            <Trees className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Rekomendasi Penataan Hijau
                        </h3>
                        <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
                            {(recommendations.items || []).map(rec => (
                                <div key={rec.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-xs text-gray-900 dark:text-slate-100">{rec.title}</span>
                                        <span className={`badge text-[10px] ${rec.priority === 'Tinggi' ? 'badge-amber' : 'badge-green'}`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed">{rec.description}</p>
                                </div>
                            ))}
                        </div>
                        {recommendations.disclaimer && (
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 italic border-t border-gray-100 dark:border-slate-800 pt-2">{recommendations.disclaimer}</p>
                        )}
                    </div>
                </div>

                {/* Feedback section */}
                <div id="feedback" className="space-y-6 border-t border-gray-100 dark:border-slate-800 pt-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Aspirasi Civitas</span>
                            <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 dark:text-slate-100">Laporan & Feedback Kawasan Hijau</h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Sampaikan masukan, kondisi tanaman, kebersihan, atau usulan penataan taman kampus</p>
                        </div>
                        <Link
                            href={user ? '/feedback/create' : '/login'}
                            className="btn btn-primary self-start sm:self-auto"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Kirim Laporan Baru
                        </Link>
                    </div>

                    {recentFeedback.length === 0 ? (
                        <div className="card p-10 text-center text-xs text-gray-400 dark:text-slate-500">
                            Belum ada feedback yang ditampilkan.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentFeedback.map(fb => (
                                <div key={fb.id} className="card p-5 space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`badge ${getFeedbackStatusBadge(fb.status)} text-[10px]`}>{fb.status}</span>
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatDate(fb.created_at)}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{fb.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{fb.message}</p>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between text-[10px] text-gray-400 dark:text-slate-500">
                                        <span>{fb.land_use?.name || 'Laporan Umum'}</span>
                                        <span className="font-medium text-gray-600 dark:text-slate-300">{fb.user?.name || 'Civitas'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
