import React from 'react';
import { Sparkles, RotateCcw, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { formatArea } from '@/lib/utils';

export default function SimulationGauge({
    isAchieved,
    analysis = {},
    gapPercent = 0,
    greenPercent = 0,
    simulatedLayerIds = [],
    simulatedVegPercent = 0,
    simulatedGainPercent = 0,
    simulatedAddedArea = 0,
    isTargetAchievedWithSim = false,
    remainingSimGapPercent = 0,
    onClearSimulated,
}) {
    return (
        <div className="flex-shrink-0 p-3.5 border-b border-gray-200 dark:border-slate-800 bg-emerald-950/5 dark:bg-emerald-950/30 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-xs text-gray-900 dark:text-slate-100 font-display">
                        Simulasi Zonasi Spasial
                    </span>
                </div>
                {simulatedLayerIds.length > 0 && onClearSimulated && (
                    <button
                        type="button"
                        onClick={onClearSimulated}
                        className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>

            <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-gray-200/80 dark:border-slate-700 shadow-xs space-y-2">
                {!isAchieved && (
                    <div className="p-2 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                            <span className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                Defisit RTH: {formatArea(analysis.gap_area_size)} ({gapPercent}%)
                            </span>
                            <span className="badge badge-amber text-[9px]">Target 30%</span>
                        </div>
                        <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-tight">
                            Pilih strategi di bawah untuk memetakan penutupan defisit RTH.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs">
                    <div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-400 block">Status RTH Asli</span>
                        <span className="font-bold text-sm text-gray-800 dark:text-slate-200">{greenPercent}%</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                    <div className="text-right">
                        <span className="text-[10px] text-gray-400 dark:text-slate-400 block">
                            {simulatedLayerIds.length > 0 ? 'Prediksi Simulasi' : 'Target Standar'}
                        </span>
                        <span className={`font-extrabold text-sm ${
                            simulatedLayerIds.length > 0
                                ? isTargetAchievedWithSim ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
                                : 'text-amber-600 dark:text-amber-400'
                        }`}>
                            {simulatedLayerIds.length > 0 ? `${simulatedVegPercent}%` : '30%'}
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-amber-500 z-10" title="Target 30%" />
                        <div className="h-full bg-emerald-500 transition-all duration-500 absolute left-0" style={{ width: `${Math.min(100, greenPercent)}%` }} />
                        {simulatedGainPercent > 0 && (
                            <div
                                className="h-full bg-sky-400 dark:bg-sky-500 transition-all duration-500 absolute animate-pulse"
                                style={{ left: `${Math.min(100, greenPercent)}%`, width: `${Math.min(100 - greenPercent, simulatedGainPercent)}%` }}
                            />
                        )}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-400 dark:text-slate-500 font-medium">
                        <span>0%</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">Target 30%</span>
                        <span>100%</span>
                    </div>
                </div>

                {simulatedLayerIds.length > 0 && (
                    <div className={`p-2 rounded-lg text-[10px] font-medium flex items-center gap-1.5 ${
                        isTargetAchievedWithSim
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800'
                    }`}>
                        <Zap className="w-3.5 h-3.5 flex-shrink-0 text-sky-600" />
                        <span>
                            {isTargetAchievedWithSim
                                ? `Target 30% Terpenuhi! (${simulatedLayerIds.length} layer, +${formatArea(simulatedAddedArea)})`
                                : `+${simulatedGainPercent}% tutupan. Gap tersisa ${remainingSimGapPercent}%.`}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
