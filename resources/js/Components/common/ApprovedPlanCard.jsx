import React from 'react';
import { formatArea } from '@/lib/utils';
import { Building2, ChevronRight } from 'lucide-react';

export default function ApprovedPlanCard({ plan, isSelected, onClick, onEdit, isAdmin }) {
    const planId = plan.plan_id || plan.id;
    const isImplemented = plan.status === 'implemented';

    return (
        <div
            onClick={() => onClick(plan)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                    ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 ring-2 ring-sky-400/30 shadow-sm'
                    : isImplemented
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 className={`w-3.5 h-3.5 flex-shrink-0 ${isImplemented ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}`} />
                    <span className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate">
                        {plan.title || plan.name}
                    </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {isImplemented ? (
                        <span className="badge badge-green text-[9px]">Terimplementasi</span>
                    ) : (
                        <span className="badge badge-blue text-[9px]">Disetujui</span>
                    )}
                </div>
            </div>

            <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-2">
                {plan.description || plan.notes || plan.action_description}
            </p>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <div className="space-x-1 text-gray-500 dark:text-slate-400">
                    <span>Luas: <strong>{formatArea(plan.area_size)}</strong></span>
                    {plan.target_year && (
                        <>
                            <span>•</span>
                            <span>Target: <strong>{plan.target_year}</strong></span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {isAdmin && planId && onEdit && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(planId);
                            }}
                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-1.5 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                        >
                            Edit Rencana
                        </button>
                    )}
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center">
                        Lihat Peta <ChevronRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </div>
    );
}
