import React from 'react';
import { Shield, Leaf, Trees, CheckCircle2, Square, CheckSquare, Sparkles } from 'lucide-react';
import { formatArea } from '@/lib/utils';

export default function SpatialRecCard({
    item,
    isSelected,
    isSimulated,
    isAchieved,
    onLayerClick,
    onToggleSimulate,
    onToggleApproval,
    showAdminActions = false,
}) {
    const isConservation = item.zone_type === 'conservation';
    const isConversion = item.pillar_type === 'rth_conversion';
    const isRevitalization = item.pillar_type === 'revitalization';
    const isApproved = item.is_approved === true;

    return (
        <div
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isApproved
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/30'
                    : isSimulated
                        ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 ring-2 ring-sky-400/25 shadow-sm'
                        : isConversion
                            ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800/60 hover:border-teal-500'
                            : isRevitalization
                                ? 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/50 hover:border-amber-400'
                                : isConservation
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-400'
                                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
            } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
            onClick={() => onLayerClick(item)}
        >
            {isApproved && (
                <div className="mb-1.5 flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Telah di-ACC — Tampil di Perencanaan Kampus</span>
                </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isConservation ? (
                        <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : isConversion ? (
                        <Leaf className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    ) : (
                        <Trees className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate">{item.name}</span>
                </div>
                <span className={`badge text-[9px] flex-shrink-0 ${item.badge_color || 'badge-slate'}`}>{item.badge}</span>
            </div>

            <div className="text-[11px] font-semibold text-gray-800 dark:text-slate-200 mb-1">
                {isConservation ? item.action_title : item.intervention_title}
            </div>

            <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-2">
                {item.action_description}
            </p>

            {isConservation ? (
                <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
                    <span>🛡️ Menjaga {item.contribution_percent}% Luas Kampus</span>
                </div>
            ) : !isAchieved && item.gap_coverage_percent > 0 ? (
                <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100/70 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-[9px] font-bold border border-sky-200 dark:border-sky-800">
                    {item.gap_coverage_percent >= 100 ? (
                        <span>🎯 Menutup 100% Defisit (Target 30% Terpenuhi)</span>
                    ) : (
                        <span>🎯 Menutup {item.gap_coverage_percent}% Defisit RTH Kampus</span>
                    )}
                </div>
            ) : isAchieved ? (
                <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
                    <span>✨ Menambah +{item.potential_gain_percent || item.contribution_percent}% Tutupan Hijau</span>
                </div>
            ) : null}

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                    <div className="space-x-1.5 text-gray-500 dark:text-slate-400">
                        <span>Luas: <strong>{formatArea(item.area_size)}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {isConservation ? `${item.contribution_percent}% Kampus` : `+${item.potential_gain_percent || item.contribution_percent}%`}
                        </span>
                    </div>
                    {!isConservation && onToggleSimulate && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onToggleSimulate(item.id); }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                isSimulated
                                    ? 'bg-sky-600 text-white shadow-xs'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 hover:text-sky-700'
                            }`}
                        >
                            {isSimulated ? <><CheckSquare className="w-3 h-3" /> Tersimulasi</> : <><Square className="w-3 h-3" /> Simulasikan</>}
                        </button>
                    )}
                </div>

                {showAdminActions && onToggleApproval && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleApproval(item);
                        }}
                        className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 hover:border-red-300'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300'
                        }`}
                    >
                        {isApproved
                            ? <><CheckCircle2 className="w-3 h-3" /> Di-ACC (Publik) — Klik untuk Batalkan</>
                            : <><Sparkles className="w-3 h-3" /> ACC & Publikasikan ke Perencanaan Kampus</>
                        }
                    </button>
                )}
            </div>
        </div>
    );
}
