import React from 'react';
import { formatArea } from '@/lib/utils';
import { GREEN_STATUS_BADGE } from '@/lib/constants';

export default function LayerListItem({ item, isSelected, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(item)}
            className={`w-full px-4 py-3 text-left transition-colors group ${
                isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500'
                    : 'hover:bg-emerald-50/50 dark:hover:bg-slate-800/50'
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white dark:border-slate-700 shadow-xs mt-0.5"
                        style={{ backgroundColor: item.category?.color || item.category_color || '#64748b' }}
                    />
                    <span className="font-semibold text-xs text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 leading-tight">
                        {item.name}
                    </span>
                </div>
                <span className={`badge border text-[9px] flex-shrink-0 ${GREEN_STATUS_BADGE[item.green_status] || ''}`}>
                    {item.green_status === 'Green Area' ? 'RTH' : item.green_status === 'Vegetasi Non-RTH' ? 'Veg' : 'Non'}
                </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 pl-[18px]">
                <span>{item.category?.name || item.category_name}</span>
                <span className="font-bold text-gray-700 dark:text-slate-300">{formatArea(item.area_size)}</span>
            </div>

            {item.parent && (
                <div className="mt-1 pl-[18px] text-[9px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-medium inline-block">
                    ↳ {item.parent.name}
                </div>
            )}
        </button>
    );
}
