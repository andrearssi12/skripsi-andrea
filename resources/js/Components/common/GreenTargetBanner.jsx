import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatArea } from '@/lib/utils';

export default function GreenTargetBanner({ analysis = {}, targetPercent = 30 }) {
    const isAchieved = analysis.is_achieved ?? false;
    const greenPercent = analysis.green_percentage ?? 0;
    const gapPercent = analysis.gap_percentage ?? 0;

    return (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all ${
            isAchieved
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100'
                : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-100'
        }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                        isAchieved ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                        {isAchieved ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 dark:bg-white/10 border border-current">
                                Standar 30% Green Campus
                            </span>
                            <span className="text-xs font-semibold">
                                Status: {analysis.status_text}
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold mt-1 font-display">
                            {isAchieved
                                ? `Selamat! Luas Green Area mencapai ${greenPercent}% (Target ${targetPercent}% terpenuhi)`
                                : `Perhatian: Green Area saat ini ${greenPercent}% (Defisit ${gapPercent}% dari target ${targetPercent}%)`
                            }
                        </h3>
                        <p className="text-xs opacity-80 mt-0.5 leading-relaxed">
                            {isAchieved
                                ? 'Proporsi kawasan hijau telah memenuhi standar keberlanjutan kampus hijau.'
                                : `Dibutuhkan penambahan sekitar ${formatArea(analysis.gap_area_size)} (${gapPercent}%) kawasan hijau untuk mencapai target minimum 30%.`
                            }
                        </p>
                    </div>
                </div>

                {/* Progress Bar Display */}
                <div className="w-full md:w-64 flex flex-col gap-1.5 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-white/60 dark:border-slate-700/60 shadow-xs flex-shrink-0">
                    <div className="flex justify-between text-xs font-semibold">
                        <span>Capaian Green Area</span>
                        <span className={isAchieved ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-bold'}>
                            {greenPercent}% / {targetPercent}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-amber-600 dark:bg-amber-400 z-10" title="Target 30%" />
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${
                                isAchieved ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, (greenPercent / targetPercent) * 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-slate-400">
                        <span>0%</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">Target 30%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
