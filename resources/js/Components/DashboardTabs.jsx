import React from "react";

export default function DashboardTabs({ value, onChange, spatialCount }) {
    const tabs = [
        { key: "overview", label: "Ringkasan & Peta Monitoring" },
        {
            key: "spatial_studio",
            label: `Studio Analisis Spasial & Perencanaan (${spatialCount})`,
        },
    ];

    return (
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${value === tab.key ? "bg-emerald-600 text-white shadow-sm" : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800"}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
