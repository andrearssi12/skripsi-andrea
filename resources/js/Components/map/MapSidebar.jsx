import React from "react";
import { Link } from "@inertiajs/react";
import { Compass, ExternalLink, Sparkles } from "lucide-react";
import LayerCatalogTab from "@/Pages/Landing/sections/LayerCatalogTab";
import SpatialRecCard from "@/components/common/SpatialRecCard";
import FilterTabs from "@/components/common/FilterTabs";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import { formatArea } from "@/lib/utils";

const FILTERS = [
    { key: "all", label: "Semua", activeClass: "bg-emerald-600 text-white" },
    {
        key: "conservation",
        label: "🛡️ Proteksi",
        activeClass: "bg-emerald-600 text-white",
    },
    {
        key: "conversion",
        label: "🌱 Konversi",
        activeClass: "bg-teal-600 text-white",
    },
    {
        key: "revitalization",
        label: "🌳 Revitalisasi",
        activeClass: "bg-amber-600 text-white",
    },
    {
        key: "alternative",
        label: "🏢 Alternatif",
        activeClass: "bg-sky-600 text-white",
    },
    {
        key: "simulated",
        label: "⚡ Simulasi",
        activeClass: "bg-sky-700 text-white",
    },
];

export default function MapSidebar({
    sidebarTab,
    onSidebarTabChange,
    onOpenSpatialMode,
    landUses,
    filteredLayers,
    layerSearch,
    onLayerSearchChange,
    layerFilterTab,
    onLayerFilterChange,
    selectedFeature,
    onLayerClick,
    isAdmin,
    analysis,
    simulatedLayerIds,
    simulatedVegPercent,
    simulatedGainPercent,
    onClearSimulation,
    spatialSearch,
    onSpatialSearchChange,
    spatialFilterTab,
    onSpatialFilterChange,
    conservationLayers,
    potentialLayers,
    rthConversionLayers,
    revitalizationLayers,
    alternativeVegLayers,
    filteredSpatialItems,
    isAchieved,
    onToggleSimulate,
    onToggleApproval,
    approvedPlans,
    planSearch,
    onPlanSearchChange,
    onSelectPlan,
}) {
    const filterItems = FILTERS.map((filter) => ({
        ...filter,
        count:
            filter.key === "all"
                ? conservationLayers.length + potentialLayers.length
                : filter.key === "conservation"
                  ? conservationLayers.filter(
                        (item) => item.pillar_type === "conservation",
                    ).length
                  : filter.key === "conversion"
                    ? rthConversionLayers.length
                    : filter.key === "revitalization"
                      ? revitalizationLayers.length
                      : filter.key === "alternative"
                        ? alternativeVegLayers.length
                        : simulatedLayerIds.length,
    }));

    return (
        <aside className="w-80 xl:w-96 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col shadow-lg overflow-hidden transition-colors z-20">
            <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/80 text-xs">
                <button
                    type="button"
                    onClick={() => onSidebarTabChange("layers")}
                    className={`flex-1 py-2.5 px-3 font-bold text-center border-b-2 ${sidebarTab === "layers" ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900" : "border-transparent text-gray-500 dark:text-slate-400"}`}
                >
                    Katalog Layer{" "}
                    <span className="text-[10px] opacity-70">
                        ({landUses.length})
                    </span>
                </button>
                <button
                    type="button"
                    onClick={onOpenSpatialMode}
                    className={`flex-1 py-2.5 px-3 font-bold text-center border-b-2 flex items-center justify-center gap-1.5 ${sidebarTab === "spatial" ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900" : "border-transparent text-gray-500 dark:text-slate-400"}`}
                >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />{" "}
                    Rekomendasi Spasial
                    {simulatedLayerIds.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    )}
                </button>
            </div>

            {sidebarTab === "layers" && (
                <LayerCatalogTab
                    landUses={landUses}
                    filteredLayers={filteredLayers}
                    layerSearch={layerSearch}
                    setLayerSearch={onLayerSearchChange}
                    layerFilterTab={layerFilterTab}
                    setLayerFilterTab={onLayerFilterChange}
                    selectedFeature={selectedFeature}
                    onLayerClick={onLayerClick}
                />
            )}

            {sidebarTab === "spatial" && (
                <>
                    {isAdmin && (
                        <>
                            <div className="flex-shrink-0 p-3.5 bg-gradient-to-br from-emerald-900/10 via-sky-900/10 to-transparent border-b border-gray-100 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-gray-800 dark:text-slate-200">
                                        <Sparkles className="w-3.5 h-3.5 inline text-amber-500 mr-1" />
                                        Simulator Zonasi What-If
                                    </span>
                                    {simulatedLayerIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={onClearSimulation}
                                            className="text-[10px] text-rose-600 hover:underline"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 dark:text-slate-400">
                                    <span>
                                        RTH Saat Ini:{" "}
                                        <strong>
                                            {analysis.green_percentage ?? 0}%
                                        </strong>
                                    </span>
                                    <strong className="text-sky-600">
                                        {simulatedLayerIds.length > 0
                                            ? `Simulasi: ${simulatedVegPercent}%`
                                            : "Target: 30%"}
                                    </strong>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{
                                            width: `${Math.min(100, analysis.green_percentage ?? 0)}%`,
                                        }}
                                    />
                                    <div
                                        className="h-full bg-sky-400 animate-pulse absolute"
                                        style={{
                                            width: `${Math.min(100 - (analysis.green_percentage ?? 0), simulatedGainPercent)}%`,
                                            marginTop: "-8px",
                                            marginLeft: `${Math.min(100, analysis.green_percentage ?? 0)}%`,
                                        }}
                                    />
                                </div>
                                <FilterTabs
                                    items={filterItems}
                                    value={spatialFilterTab}
                                    onChange={onSpatialFilterChange}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {filteredSpatialItems.length === 0 ? (
                                    <EmptyState
                                        compact
                                        icon={Sparkles}
                                        title="Tidak ada layer pada filter ini."
                                    />
                                ) : (
                                    filteredSpatialItems.map((item) => (
                                        <SpatialRecCard
                                            key={item.id}
                                            item={item}
                                            isSelected={
                                                selectedFeature?.id === item.id
                                            }
                                            isSimulated={simulatedLayerIds.includes(
                                                item.id,
                                            )}
                                            isAchieved={isAchieved}
                                            onLayerClick={onLayerClick}
                                            onToggleSimulate={onToggleSimulate}
                                            onToggleApproval={onToggleApproval}
                                            showAdminActions
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                    <ApprovedPlansPanel
                        plans={approvedPlans}
                        search={planSearch}
                        onSearchChange={onPlanSearchChange}
                        onSelectPlan={onSelectPlan}
                        isAdmin={isAdmin}
                    />
                </>
            )}
        </aside>
    );
}

function ApprovedPlansPanel({
    plans,
    search,
    onSearchChange,
    onSelectPlan,
    isAdmin,
}) {
    return (
        <div
            className={`flex flex-col border-t border-gray-100 dark:border-slate-800 ${!isAdmin ? "flex-1" : "flex-shrink-0"}`}
        >
            <div className="p-3 bg-sky-50/60 dark:bg-sky-950/20 border-b border-sky-100 flex items-center justify-between">
                <span className="font-bold text-xs text-sky-700 dark:text-sky-300">
                    <Compass className="w-3.5 h-3.5 inline mr-1" />
                    Rencana Disetujui ({plans.length})
                </span>
                <Link
                    href="/spatial-plans"
                    className="text-[10px] text-sky-600 hover:underline"
                >
                    Lihat Semua <ExternalLink className="w-2.5 h-2.5 inline" />
                </Link>
            </div>
            <div className="px-3 pt-2 pb-1">
                <SearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Cari rencana..."
                />
            </div>
            <div
                className={`overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/60 ${!isAdmin ? "flex-1" : "max-h-52"}`}
            >
                {plans.length === 0 ? (
                    <EmptyState
                        compact
                        icon={Compass}
                        title="Belum ada rencana yang disetujui."
                    />
                ) : (
                    plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="p-3 hover:bg-sky-50/60 cursor-pointer"
                            onClick={() => onSelectPlan(plan)}
                        >
                            <div className="flex items-start justify-between gap-1.5">
                                <span className="font-semibold text-xs truncate">
                                    {plan.title}
                                </span>
                                <span className="badge badge-sky text-[9px]">
                                    {plan.target_year ?? "—"}
                                </span>
                            </div>
                            <p className="text-[10px] text-sky-600 mt-0.5 capitalize">
                                {plan.pillar_type?.replace(/_/g, " ")}
                            </p>
                            <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                                <span>
                                    {plan.area_size
                                        ? formatArea(plan.area_size)
                                        : "Luas: —"}
                                </span>
                                <span className="text-sky-600">
                                    Lihat di Peta →
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
