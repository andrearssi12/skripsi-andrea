import React from "react";
import { Layers } from "lucide-react";
import SearchInput from "@/components/common/SearchInput";
import LayerListItem from "@/components/common/LayerListItem";
import FilterTabs from "@/components/common/FilterTabs";
import EmptyState from "@/components/ui/EmptyState";

export default function LayerCatalogTab({
    landUses = [],
    filteredLayers = [],
    layerSearch,
    setLayerSearch,
    layerFilterTab,
    setLayerFilterTab,
    selectedFeature,
    onLayerClick,
}) {
    const filterTabs = [
        { key: "all", label: "Semua", count: landUses.length },
        {
            key: "green",
            label: "RTH",
            count: landUses.filter((x) => x.green_status === "Green Area")
                .length,
            activeClass: "bg-emerald-600 text-white",
        },
        {
            key: "veg",
            label: "Veg",
            count: landUses.filter((x) => x.green_status === "Vegetasi Non-RTH")
                .length,
            activeClass: "bg-lime-600 text-white",
        },
        {
            key: "non_green",
            label: "Non",
            count: landUses.filter((x) => x.green_status === "Non-Green Area")
                .length,
            activeClass: "bg-slate-700 text-white",
        },
    ];

    return (
        <>
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 dark:text-slate-100 text-xs font-display uppercase tracking-wide">
                        Layer Objek Spasial
                    </span>
                    <span className="badge badge-slate text-[10px]">
                        {filteredLayers.length} objek
                    </span>
                </div>

                <SearchInput
                    value={layerSearch}
                    onChange={setLayerSearch}
                    placeholder="Cari nama layer..."
                    className="mb-2"
                />

                <FilterTabs
                    items={filterTabs}
                    value={layerFilterTab}
                    onChange={setLayerFilterTab}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredLayers.length === 0 ? (
                    <EmptyState
                        icon={Layers}
                        title="Tidak ada objek layer yang sesuai."
                        compact
                    />
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-slate-800/60">
                        {filteredLayers.map((item) => (
                            <LayerListItem
                                key={item.id}
                                item={item}
                                isSelected={selectedFeature?.id === item.id}
                                onClick={onLayerClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
