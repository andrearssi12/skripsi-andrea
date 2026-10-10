import React from "react";

export default function FilterTabs({ items, value, onChange, className = "" }) {
    return (
        <div
            className={`flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl text-[10px] ${className}`}
        >
            {items.map(({ key, label, count, activeClass }) => {
                const isActive = value === key;
                const activeStyles =
                    activeClass ||
                    "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs";

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key)}
                        className={`flex-1 px-2 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                            isActive
                                ? activeStyles
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        {label}
                        <span
                            className={`text-[9px] ${isActive && activeClass ? "opacity-80" : "text-gray-400 dark:text-slate-500"}`}
                        >
                            ({count})
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
