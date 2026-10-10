import React from "react";
import {
    ChevronDown,
    ChevronRight,
    Compass,
    Layers,
    Maximize2,
    Minimize2,
    Sparkles,
    Zap,
} from "lucide-react";
import { formatArea } from "@/lib/utils";

export default function MapToolbar({
    selectedCampus,
    mapMode,
    onStandardMode,
    onSpatialMode,
    isAdmin,
    simulatedLayerIds = [],
    simulatedVegPercent = 0,
    simulatedGainPercent = 0,
    greenPercent = 0,
    approvedPlansCount = 0,
    showSpatialPlans,
    onToggleSpatialPlans,
    isFullscreen,
    onToggleFullscreen,
    sidebarOpen,
    onToggleSidebar,
}) {
    return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 flex-shrink-0 z-10">
            <div className="flex items-center gap-2 min-w-0">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                    {selectedCampus
                        ? selectedCampus.name
                        : "Peta Interaktif WebGIS UAD"}
                </span>
                {selectedCampus?.total_area && (
                    <span className="hidden md:inline text-[11px] text-gray-500 dark:text-slate-400">
                        ({formatArea(selectedCampus.total_area)})
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs border border-gray-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onStandardMode}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            mapMode === "standard"
                                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-bold"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                        }`}
                    >
                        Kategori Lahan
                    </button>
                    <button
                        type="button"
                        onClick={onSpatialMode}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                            mapMode === "spatial_analysis"
                                ? "bg-emerald-600 text-white shadow-xs font-bold"
                                : "text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                            {isAdmin
                                ? "Zonasi Rekomendasi"
                                : "Rencana Kampus (ACC)"}
                        </span>
                    </button>
                </div>

                {mapMode === "spatial_analysis" &&
                simulatedLayerIds.length > 0 ? (
                    <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                        <span>
                            Simulasi: <strong>{simulatedVegPercent}%</strong> (+
                            {simulatedGainPercent}%)
                        </span>
                    </span>
                ) : (
                    <span className="hidden sm:flex items-center gap-1.5 text-gray-700 dark:text-slate-300 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Green Area: <strong>{greenPercent}%</strong>
                    </span>
                )}

                {approvedPlansCount > 0 && (
                    <button
                        type="button"
                        onClick={onToggleSpatialPlans}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            showSpatialPlans
                                ? "bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 shadow-xs"
                                : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500"
                        }`}
                        title="Tampilkan atau sembunyikan rencana spasial yang disetujui"
                    >
                        <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span className="hidden sm:inline">Rencana ACC</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-200/60 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200">
                            {approvedPlansCount}
                        </span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={onToggleFullscreen}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 font-bold"
                    title={
                        isFullscreen
                            ? "Keluar dari layar penuh"
                            : "Tampilkan layar penuh"
                    }
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">
                        {isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="btn btn-secondary btn-sm flex items-center gap-1 font-bold"
                    title="Buka atau tutup panel sidebar"
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Panel</span>
                    {sidebarOpen ? (
                        <ChevronRight className="w-3 h-3" />
                    ) : (
                        <ChevronDown className="w-3 h-3 rotate-90" />
                    )}
                </button>
            </div>
        </div>
    );
}
