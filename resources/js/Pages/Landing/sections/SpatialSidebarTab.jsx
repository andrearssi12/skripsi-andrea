import React from "react";
import { Link } from "@inertiajs/react";
import { Building2, Sparkles, CheckCircle2, Info } from "lucide-react";
import SimulationGauge from "@/components/common/SimulationGauge";
import SearchInput from "@/components/common/SearchInput";
import SpatialRecCard from "@/components/common/SpatialRecCard";
import FilterTabs from "@/components/common/FilterTabs";
import EmptyState from "@/components/ui/EmptyState";
import ApprovedPlanCard from "@/components/common/ApprovedPlanCard";

export default function SpatialSidebarTab({
    isAdmin,
    adminSpatialSubTab,
    setAdminSpatialSubTab,
    activeSpatialRecs = {},
    simulatedLayerIds = [],
    isAchieved,
    analysis = {},
    gapPercent,
    greenPercent,
    simulatedVegPercent,
    simulatedGainPercent,
    simulatedAddedArea,
    isTargetAchievedWithSim,
    remainingSimGapPercent,
    onClearSimulated,
    spatialSearch,
    setSpatialSearch,
    spatialFilterTab,
    setSpatialFilterTab,
    conservationLayers = [],
    potentialLayers = [],
    rthConversionLayers = [],
    revitalizationLayers = [],
    alternativeVegLayers = [],
    filteredSpatialItems = [],
    selectedFeature,
    onLayerClick,
    onToggleSimulate,
    onSelectAllSimulated,
    onToggleApproval,
    onSelectPlan,
}) {
    const spatialFilterTabs = [
        {
            key: "all",
            label: "Semua",
            count: conservationLayers.length + potentialLayers.length,
        },
        {
            key: "conservation",
            label: "🛡️ Proteksi RTH",
            count: conservationLayers.filter(
                (layer) => layer.pillar_type === "conservation",
            ).length,
            activeClass: "bg-emerald-600 text-white",
        },
        {
            key: "conversion",
            label: "🌱 Konversi Baru",
            count: rthConversionLayers.length,
            activeClass: "bg-teal-600 text-white",
        },
        {
            key: "revitalization",
            label: "🌳 Revitalisasi",
            count: revitalizationLayers.length,
            activeClass: "bg-lime-600 text-white",
        },
        {
            key: "alternative",
            label: "🏢 Kompensasi",
            count: alternativeVegLayers.length,
            activeClass: "bg-sky-600 text-white",
        },
        {
            key: "simulated",
            label: "⚡ Simulasi",
            count: simulatedLayerIds.length,
            activeClass: "bg-sky-700 text-white",
        },
    ];

    return (
        <>
            {isAdmin && (
                <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-100/80 dark:bg-slate-800/80 p-1.5 gap-1 text-[11px] flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setAdminSpatialSubTab("plans")}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                            adminSpatialSubTab === "plans"
                                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Perencanaan Kampus</span>
                        {(activeSpatialRecs.approved_plans || []).length >
                            0 && (
                            <span className="badge badge-green text-[9px] py-0 px-1">
                                {
                                    (activeSpatialRecs.approved_plans || [])
                                        .length
                                }
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setAdminSpatialSubTab("recommendations")}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                            adminSpatialSubTab === "recommendations"
                                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simulasi & Rekomendasi</span>
                        {simulatedLayerIds.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                        )}
                    </button>
                </div>
            )}

            {isAdmin && adminSpatialSubTab === "recommendations" ? (
                <>
                    <SimulationGauge
                        isAchieved={isAchieved}
                        analysis={analysis}
                        gapPercent={gapPercent}
                        greenPercent={greenPercent}
                        simulatedLayerIds={simulatedLayerIds}
                        simulatedVegPercent={simulatedVegPercent}
                        simulatedGainPercent={simulatedGainPercent}
                        simulatedAddedArea={simulatedAddedArea}
                        isTargetAchievedWithSim={isTargetAchievedWithSim}
                        remainingSimGapPercent={remainingSimGapPercent}
                        onClearSimulated={onClearSimulated}
                    />

                    <div className="px-3.5 pb-2 space-y-2 border-b border-gray-100 dark:border-slate-800">
                        <SearchInput
                            value={spatialSearch}
                            onChange={setSpatialSearch}
                            placeholder="Cari layer rekomendasi spasial..."
                        />

                        <FilterTabs
                            items={spatialFilterTabs}
                            value={spatialFilterTab}
                            onChange={setSpatialFilterTab}
                        />

                        {potentialLayers.length > 0 && (
                            <button
                                type="button"
                                onClick={onSelectAllSimulated}
                                className="w-full py-1 px-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[10px] font-semibold hover:bg-sky-100 transition-colors flex items-center justify-center gap-1"
                            >
                                ⚡ Simulasikan Semua Potensi
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/70 p-2 space-y-2">
                        {filteredSpatialItems.length === 0 ? (
                            <EmptyState
                                icon={Sparkles}
                                title="Tidak ada layer rekomendasi pada filter ini."
                                compact
                            />
                        ) : (
                            filteredSpatialItems.map((item) => (
                                <SpatialRecCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedFeature?.id === item.id}
                                    isSimulated={simulatedLayerIds.includes(
                                        item.id,
                                    )}
                                    isAchieved={isAchieved}
                                    onLayerClick={onLayerClick}
                                    onToggleSimulate={onToggleSimulate}
                                    onToggleApproval={onToggleApproval}
                                    showAdminActions={true}
                                />
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-shrink-0 p-3.5 border-b border-gray-200 dark:border-slate-800 bg-emerald-950/5 dark:bg-emerald-950/30 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <span className="font-bold text-xs text-gray-900 dark:text-slate-100 font-display block">
                                        🏛️ Perencanaan Kampus Kedepannya
                                    </span>
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                        {isAdmin
                                            ? "Daftar rencana resmi yang disetujui / dibuat admin"
                                            : "Rencana yang disetujui oleh administrator"}
                                    </span>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="flex items-center gap-1.5">
                                    <Link
                                        href="/spatial-plans"
                                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                                    >
                                        Kelola
                                    </Link>
                                    <Link
                                        href="/spatial-plans/create"
                                        className="btn btn-primary btn-xs text-[10px] py-1 px-2"
                                    >
                                        + Buat
                                    </Link>
                                </div>
                            )}
                        </div>
                        {(activeSpatialRecs.approved_plans || []).length >
                            0 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                    {
                                        (activeSpatialRecs.approved_plans || [])
                                            .length
                                    }{" "}
                                    rencana telah terdaftar & disetujui
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {(activeSpatialRecs.approved_plans || []).length ===
                        0 ? (
                            <div className="py-12 text-center space-y-3 px-4">
                                <Building2 className="w-10 h-10 mx-auto text-gray-200 dark:text-slate-700" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                                        Belum ada perencanaan kampus
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 leading-relaxed">
                                        Belum ada rencana pengembangan spasial
                                        yang disetujui & dipublikasikan untuk
                                        kampus ini.
                                    </p>
                                </div>
                                {isAdmin ? (
                                    <div className="pt-2">
                                        <Link
                                            href="/spatial-plans/create"
                                            className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5"
                                        >
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span>
                                                Buat Rencana Spasial Baru
                                            </span>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-700 dark:text-blue-300 text-left">
                                        <Info className="w-3 h-3 inline mr-1" />
                                        Civitas dapat memberikan masukan melalui
                                        menu <strong>Feedback</strong> di
                                        halaman utama.
                                    </div>
                                )}
                            </div>
                        ) : (
                            (activeSpatialRecs.approved_plans || []).map(
                                (item) => (
                                    <ApprovedPlanCard
                                        key={item.id || item.plan_id}
                                        plan={item}
                                        isSelected={
                                            selectedFeature?.plan_id ===
                                                item.id ||
                                            selectedFeature?.id ===
                                                `plan_${item.id}` ||
                                            selectedFeature?.id === item.id
                                        }
                                        onClick={onSelectPlan}
                                        isAdmin={false}
                                    />
                                ),
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
