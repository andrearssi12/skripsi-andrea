import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import LeafletMap from "@/components/map/LeafletMap";

import MapPopup from "@/components/map/MapPopup";
import MapLegend from "@/components/map/MapLegend";
import MapSearch from "@/components/map/MapSearch";
import MapToolbar from "@/components/map/MapToolbar";
import MapSidebar from "@/components/map/MapSidebar";
import useFullscreen from "@/hooks/useFullscreen";

const EMPTY_GEOJSON = { type: "FeatureCollection", features: [] };

export default function MapIndex({
    campuses = [],
    categories = [],
    selectedCampusId,
    landUsesGeoJson = EMPTY_GEOJSON,
    campusBoundaries = EMPTY_GEOJSON,
    feedbackGeoJson = null,
    approvedSpatialPlansGeoJson = EMPTY_GEOJSON,
    approvedSpatialPlans = [],
    isAdmin = false,
    analysis = {},
    spatialRecommendations = {},
    landUses = [],
    targetLandUseId = null,
    filters: initialFilters = {},
}) {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [mapMode, setMapMode] = useState("standard");
    const [simulatedLayerIds, setSimulatedLayerIds] = useState([]);
    const [showSpatialPlans, setShowSpatialPlans] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarTab, setSidebarTab] = useState("layers");
    const [layerSearch, setLayerSearch] = useState("");
    const [layerFilterTab, setLayerFilterTab] = useState("all");
    const [spatialSearch, setSpatialSearch] = useState("");
    const [spatialFilterTab, setSpatialFilterTab] = useState("all");
    const [planSearch, setPlanSearch] = useState("");
    const [mapFilters, setMapFilters] = useState({
        search: initialFilters.search || "",
        category_id: initialFilters.category_id || "",
        green_status: initialFilters.green_status || "",
    });
    const mapWorkspaceRef = useRef(null);
    const { isFullscreen, toggleFullscreen } = useFullscreen(mapWorkspaceRef);

    const selectedCampus =
        campuses.find(
            (campus) => String(campus.id) === String(selectedCampusId),
        ) ||
        campuses[0] ||
        null;
    const selectedCampusBoundary = useMemo(() => {
        if (!selectedCampusId || !campusBoundaries?.features?.length)
            return null;
        const feature = campusBoundaries.features.find(
            (item) =>
                String(item.id ?? item.properties?.id) ===
                String(selectedCampusId),
        );
        return feature
            ? { type: "FeatureCollection", features: [feature] }
            : null;
    }, [campusBoundaries, selectedCampusId]);

    const conservationLayers =
        spatialRecommendations?.conservation_layers || [];
    const revitalizationLayers =
        spatialRecommendations?.revitalization_layers || [];
    const rthConversionLayers =
        spatialRecommendations?.rth_conversion_layers || [];
    const potentialLayers = spatialRecommendations?.potential_layers || [];
    const alternativeVegLayers = useMemo(
        () =>
            potentialLayers.filter(
                (layer) => layer.pillar_type !== "rth_conversion",
            ),
        [potentialLayers],
    );

    const [simulatedAddedArea, totalCampusArea] = useMemo(() => {
        const addedArea = potentialLayers
            .filter((layer) => simulatedLayerIds.includes(layer.id))
            .reduce((total, layer) => total + layer.area_size, 0);
        return [
            addedArea,
            selectedCampus?.total_area || analysis.total_campus_area || 1,
        ];
    }, [
        analysis.total_campus_area,
        potentialLayers,
        selectedCampus,
        simulatedLayerIds,
    ]);

    const currentVegArea =
        (analysis.green_area_size || 0) + (analysis.vegetasi_non_rth_size || 0);
    const simulatedVegPercent = Number(
        (
            ((currentVegArea + simulatedAddedArea) / totalCampusArea) *
            100
        ).toFixed(2),
    );
    const simulatedGainPercent = Number(
        ((simulatedAddedArea / totalCampusArea) * 100).toFixed(2),
    );

    const filteredLayers = useMemo(
        () =>
            landUses.filter((item) => {
                const matchesStatus =
                    layerFilterTab === "all" ||
                    (layerFilterTab === "green" &&
                        item.green_status === "Green Area") ||
                    (layerFilterTab === "veg" &&
                        item.green_status === "Vegetasi Non-RTH") ||
                    (layerFilterTab === "non_green" &&
                        item.green_status === "Non-Green Area");
                if (!matchesStatus) return false;
                if (!layerSearch) return true;
                const query = layerSearch.toLowerCase();
                return (
                    (item.name || "").toLowerCase().includes(query) ||
                    (item.category?.name || "").toLowerCase().includes(query)
                );
            }),
        [landUses, layerFilterTab, layerSearch],
    );

    const filteredSpatialItems = useMemo(() => {
        const groups = {
            all: [...conservationLayers, ...potentialLayers],
            conservation: conservationLayers.filter(
                (item) => item.pillar_type === "conservation",
            ),
            conversion: rthConversionLayers,
            revitalization: revitalizationLayers,
            alternative: alternativeVegLayers,
            simulated: potentialLayers.filter((item) =>
                simulatedLayerIds.includes(item.id),
            ),
        };
        const query = spatialSearch.toLowerCase();
        return (groups[spatialFilterTab] || groups.all).filter(
            (item) =>
                !query ||
                [
                    item.name,
                    item.category_name,
                    item.action_description,
                    item.action_benefit,
                ].some((value) => (value || "").toLowerCase().includes(query)),
        );
    }, [
        alternativeVegLayers,
        conservationLayers,
        potentialLayers,
        revitalizationLayers,
        rthConversionLayers,
        simulatedLayerIds,
        spatialFilterTab,
        spatialSearch,
    ]);

    const filteredApprovedPlans = useMemo(() => {
        const query = planSearch.toLowerCase();
        return approvedSpatialPlans.filter(
            (plan) =>
                !query ||
                [plan.title, plan.description, plan.pillar_type].some((value) =>
                    (value || "").toLowerCase().includes(query),
                ),
        );
    }, [approvedSpatialPlans, planSearch]);

    const handleLayerClick = useCallback(
        (item) => {
            const feedbacks =
                item.feedback?.map((feedback) => ({
                    ...feedback,
                    image_url: feedback.image
                        ? `/storage/${feedback.image}`
                        : null,
                    user_name: feedback.user?.name || "Civitas UAD",
                })) ||
                item.feedbacks ||
                [];
            setSelectedFeature({
                ...item,
                id: item.id,
                campus_name: selectedCampus?.name,
                category_name: item.category?.name || item.category_name,
                category_color: item.category?.color || item.category_color,
                parent_name: item.parent?.name || item.parent_name,
                feedbacks,
                feedbacks_count: feedbacks.length,
            });
        },
        [selectedCampus],
    );

    const handleSelectPlan = useCallback(
        (plan) =>
            setSelectedFeature({
                id: `plan_${plan.id}`,
                plan_id: plan.id,
                name: plan.title,
                category_name: "Rencana Pengembangan (ACC)",
                category_color: "#0284c7",
                green_status: "Rencana Masa Depan",
                area_size: plan.area_size,
                description: plan.description || plan.notes,
                campus_name: plan.campus?.name || selectedCampus?.name,
                target_year: plan.target_year,
                pillar_type: plan.pillar_type,
                is_spatial_plan: true,
            }),
        [selectedCampus],
    );

    useEffect(() => {
        const focusId =
            targetLandUseId ||
            new URLSearchParams(window.location.search).get("land_use_id");
        const feature = landUsesGeoJson?.features?.find(
            (item) => String(item.properties?.id) === String(focusId),
        );
        if (feature?.properties) setSelectedFeature(feature.properties);
    }, [landUsesGeoJson, targetLandUseId]);

    const handleCampusChange = (campusId) => {
        setSelectedFeature(null);
        router.get("/map", campusId ? { campus_id: campusId } : {}, {
            preserveState: true,
        });
    };

    const toggleSimulateLayer = (layerId) =>
        setSimulatedLayerIds((current) =>
            current.includes(layerId)
                ? current.filter((id) => id !== layerId)
                : [...current, layerId],
        );
    const handleApproval = (item) =>
        router.post(
            route("spatial-plans.toggle-approval"),
            {
                campus_id: item.campus_id || selectedCampusId,
                land_use_id: item.id,
                title: item.intervention_title || item.name,
                pillar_type: item.pillar_type || item.zone_type,
                description: item.action_benefit || item.action_description,
                area_size: item.area_size,
                potential_gain_percent: item.potential_gain_percent || 0,
            },
            { preserveScroll: true },
        );

    return (
        <>
            <Head title="Peta WebGIS Kawasan Hijau UAD" />
            <div className="space-y-4">

                <div
                    ref={mapWorkspaceRef}
                    className={`transition-all duration-300 flex flex-col ${isFullscreen ? "fixed inset-0 z-[99999] w-screen h-screen bg-slate-900" : "relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm bg-gray-100 dark:bg-slate-900"}`}
                >
                    <MapToolbar
                        selectedCampus={selectedCampus}
                        mapMode={mapMode}
                        isAdmin={isAdmin}
                        simulatedLayerIds={simulatedLayerIds}
                        simulatedVegPercent={simulatedVegPercent}
                        simulatedGainPercent={simulatedGainPercent}
                        greenPercent={analysis.green_percentage ?? 0}
                        approvedPlansCount={
                            approvedSpatialPlansGeoJson?.features?.length || 0
                        }
                        showSpatialPlans={showSpatialPlans}
                        onStandardMode={() => {
                            setMapMode("standard");
                            setShowSpatialPlans(false);
                            setSelectedFeature((feature) =>
                                feature?.is_spatial_plan ? null : feature,
                            );
                        }}
                        onSpatialMode={() => {
                            setMapMode("spatial_analysis");
                            setSidebarTab("spatial");
                            setSidebarOpen(true);
                            setShowSpatialPlans(true);
                        }}
                        onToggleSpatialPlans={() =>
                            setShowSpatialPlans((value) => !value)
                        }
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={toggleFullscreen}
                        sidebarOpen={sidebarOpen}
                        onToggleSidebar={() =>
                            setSidebarOpen((value) => !value)
                        }
                    />
                    <div className="flex-1 flex min-h-0 relative">
                        <div className="flex-1 relative min-w-0">
                            <LeafletMap
                                campusBoundaries={campusBoundaries}
                                selectedCampusBoundary={selectedCampusBoundary}
                                landUsesGeoJson={landUsesGeoJson}
                                selectedFeature={selectedFeature}
                                mapMode={mapMode}
                                simulatedLayerIds={simulatedLayerIds}
                                filters={mapFilters}
                                onPolygonClick={setSelectedFeature}
                                feedbackGeoJson={feedbackGeoJson}
                                approvedSpatialPlansGeoJson={
                                    approvedSpatialPlansGeoJson
                                }
                                showSpatialPlans={
                                    showSpatialPlans &&
                                    mapMode === "spatial_analysis"
                                }
                                onSpatialPlanClick={handleSelectPlan}
                                height="100%"
                            />
                            <MapSearch
                                filters={mapFilters}
                                onFilterChange={setMapFilters}
                                categories={categories}
                                campuses={campuses}
                                selectedCampusId={selectedCampusId}
                                onCampusChange={handleCampusChange}
                            />
                            <MapLegend
                                categories={categories}
                                mapMode={mapMode}
                            />
                            <MapPopup
                                feature={selectedFeature}
                                onClose={() => setSelectedFeature(null)}
                            />
                        </div>
                        {sidebarOpen && (
                            <MapSidebar
                                sidebarTab={sidebarTab}
                                onSidebarTabChange={setSidebarTab}
                                onOpenSpatialMode={() => {
                                    setSidebarTab("spatial");
                                    setMapMode("spatial_analysis");
                                }}
                                landUses={landUses}
                                filteredLayers={filteredLayers}
                                layerSearch={layerSearch}
                                onLayerSearchChange={setLayerSearch}
                                layerFilterTab={layerFilterTab}
                                onLayerFilterChange={setLayerFilterTab}
                                selectedFeature={selectedFeature}
                                onLayerClick={handleLayerClick}
                                isAdmin={isAdmin}
                                analysis={analysis}
                                simulatedLayerIds={simulatedLayerIds}
                                simulatedVegPercent={simulatedVegPercent}
                                simulatedGainPercent={simulatedGainPercent}
                                onClearSimulation={() =>
                                    setSimulatedLayerIds([])
                                }
                                spatialSearch={spatialSearch}
                                onSpatialSearchChange={setSpatialSearch}
                                spatialFilterTab={spatialFilterTab}
                                onSpatialFilterChange={setSpatialFilterTab}
                                conservationLayers={conservationLayers}
                                potentialLayers={potentialLayers}
                                rthConversionLayers={rthConversionLayers}
                                revitalizationLayers={revitalizationLayers}
                                alternativeVegLayers={alternativeVegLayers}
                                filteredSpatialItems={filteredSpatialItems}
                                isAchieved={analysis.is_achieved ?? false}
                                onToggleSimulate={toggleSimulateLayer}
                                onToggleApproval={handleApproval}
                                approvedPlans={filteredApprovedPlans}
                                planSearch={planSearch}
                                onPlanSearchChange={setPlanSearch}
                                onSelectPlan={handleSelectPlan}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

