import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import GreenTargetBanner from "@/components/common/GreenTargetBanner";
import DashboardHeader from "@/Components/DashboardHeader";

import DashboardTabs from "@/Components/DashboardTabs";
import OverviewTab from "./Dashboard/components/OverviewTab";
import SpatialStudioTab from "./Dashboard/components/SpatialStudioTab";

export default function Dashboard({
    analysis = {},
    recommendations = {},
    spatialRecommendations = {},
    campuses = [],
    categories = [],
    campusBoundaries = { type: "FeatureCollection", features: [] },
    selectedCampusId,
    geoJsonData = { type: "FeatureCollection", features: [] },
    feedbackStats = {},
    recentFeedback = [],
    feedbackGeoJson = null,
}) {
    const [dashboardTab, setDashboardTab] = useState("overview");
    const [overviewMapMode, setOverviewMapMode] = useState("standard");
    const [selectedOverviewItem, setSelectedOverviewItem] = useState(null);
    const [simulatedLayerIds, setSimulatedLayerIds] = useState([]);
    const [spatialPillarFilter, setSpatialPillarFilter] = useState("all");
    const [spatialSearch, setSpatialSearch] = useState("");
    const [selectedSpatialItem, setSelectedSpatialItem] = useState(null);
    const [recSubTab, setRecSubTab] = useState("spatial");

    const conservationLayers =
        spatialRecommendations?.conservation_layers || [];
    const revitalizationLayers =
        spatialRecommendations?.revitalization_layers || [];
    const rthConversionLayers =
        spatialRecommendations?.rth_conversion_layers || [];
    const potentialLayers = spatialRecommendations?.potential_layers || [];

    const alternativeLayers = useMemo(
        () =>
            potentialLayers.filter(
                (layer) => layer.pillar_type !== "rth_conversion",
            ),
        [potentialLayers],
    );

    const allSpatialLayers = useMemo(
        () => [...conservationLayers, ...potentialLayers],
        [conservationLayers, potentialLayers],
    );

    const simulatedAddedArea = useMemo(
        () =>
            potentialLayers
                .filter((layer) => simulatedLayerIds.includes(layer.id))
                .reduce((total, layer) => total + layer.area_size, 0),
        [potentialLayers, simulatedLayerIds],
    );

    const totalArea = analysis.total_campus_area || 1;
    const currentGreenArea = analysis.green_area_size || 0;
    const currentTotalVegArea =
        analysis.total_vegetated_size ||
        (analysis.green_area_size || 0) + (analysis.vegetasi_non_rth_size || 0);

    const simulatedVegPercent = Number(
        (
            ((currentTotalVegArea + simulatedAddedArea) / totalArea) *
            100
        ).toFixed(2),
    );
    const simulatedGainPercent = Number(
        ((simulatedAddedArea / totalArea) * 100).toFixed(2),
    );
    const targetPercent = analysis.target_percentage ?? 30;
    const isTargetAchievedWithSim = simulatedVegPercent >= targetPercent;
    const remainingSimGapPercent = Math.max(
        0,
        Number((targetPercent - simulatedVegPercent).toFixed(2)),
    );

    const filteredSpatialItems = useMemo(() => {
        return allSpatialLayers.filter((item) => {
            if (spatialPillarFilter === "conservation") {
                if (
                    item.zone_type !== "conservation" ||
                    item.pillar_type === "revitalization"
                ) {
                    return false;
                }
            } else if (spatialPillarFilter === "conversion") {
                if (item.pillar_type !== "rth_conversion") return false;
            } else if (spatialPillarFilter === "revitalization") {
                if (item.pillar_type !== "revitalization") return false;
            } else if (spatialPillarFilter === "alternative") {
                if (
                    [
                        "rth_conversion",
                        "conservation",
                        "revitalization",
                    ].includes(item.pillar_type)
                ) {
                    return false;
                }
            } else if (spatialPillarFilter === "simulated") {
                if (!simulatedLayerIds.includes(item.id)) return false;
            }

            if (!spatialSearch) return true;

            const query = spatialSearch.toLowerCase();
            return [
                item.name,
                item.category_name,
                item.action_description,
                item.action_benefit,
            ].some((value) => (value || "").toLowerCase().includes(query));
        });
    }, [
        allSpatialLayers,
        simulatedLayerIds,
        spatialPillarFilter,
        spatialSearch,
    ]);

    const selectedCampus =
        campuses.find(
            (campus) => String(campus.id) === String(selectedCampusId),
        ) || null;

    const selectedCampusBoundary = useMemo(() => {
        if (!campusBoundaries?.features?.length) return null;
        if (!selectedCampusId) return campusBoundaries;

        const found = campusBoundaries.features.find(
            (feature) =>
                String(feature.id ?? feature.properties?.id) ===
                String(selectedCampusId),
        );

        return found
            ? { type: "FeatureCollection", features: [found] }
            : campusBoundaries;
    }, [campusBoundaries, selectedCampusId]);

    const toggleSimulateLayer = useCallback((layerId) => {
        setSimulatedLayerIds((previous) =>
            previous.includes(layerId)
                ? previous.filter((id) => id !== layerId)
                : [...previous, layerId],
        );
    }, []);

    const handleSelectAllSimulated = useCallback(() => {
        setSimulatedLayerIds(potentialLayers.map((layer) => layer.id));
    }, [potentialLayers]);

    const handleClearSimulated = useCallback(() => {
        setSimulatedLayerIds([]);
    }, []);

    const handleCampusFilter = useCallback((campusId) => {
        setSelectedOverviewItem(null);
        setSelectedSpatialItem(null);
        router.get("/dashboard", campusId ? { campus_id: campusId } : {}, {
            preserveState: true,
        });
    }, []);

    return (
        <>
            <Head title="Dashboard Kawasan Hijau UAD" />

            <div className="space-y-6">

                <DashboardHeader
                    campuses={campuses}
                    selectedCampusId={selectedCampusId}
                    onCampusChange={handleCampusFilter}
                />

                <GreenTargetBanner
                    analysis={analysis}
                    targetPercent={targetPercent}
                />

                <DashboardTabs
                    value={dashboardTab}
                    onChange={setDashboardTab}
                    spatialCount={allSpatialLayers.length}
                />

                {dashboardTab === "overview" && (
                    <OverviewTab
                        analysis={analysis}
                        selectedCampus={selectedCampus}
                        feedbackStats={feedbackStats}
                        geoJsonData={geoJsonData}
                        campusBoundaries={campusBoundaries}
                        selectedCampusBoundary={selectedCampusBoundary}
                        overviewMapMode={overviewMapMode}
                        setOverviewMapMode={setOverviewMapMode}
                        simulatedLayerIds={simulatedLayerIds}
                        feedbackGeoJson={feedbackGeoJson}
                        selectedOverviewItem={selectedOverviewItem}
                        setSelectedOverviewItem={setSelectedOverviewItem}
                        categories={categories}
                        setDashboardTab={setDashboardTab}
                        recentFeedback={recentFeedback}
                    />
                )}

                {dashboardTab === "spatial_studio" && (
                    <SpatialStudioTab
                        campuses={campuses}
                        selectedCampusId={selectedCampusId}
                        handleCampusFilter={handleCampusFilter}
                        handleSelectAllSimulated={handleSelectAllSimulated}
                        handleClearSimulated={handleClearSimulated}
                        simulatedLayerIds={simulatedLayerIds}
                        potentialLayers={potentialLayers}
                        greenPercent={analysis.green_percentage ?? 0}
                        analysis={analysis}
                        isTargetAchievedWithSim={isTargetAchievedWithSim}
                        isAchieved={analysis.is_achieved ?? false}
                        simulatedVegPercent={simulatedVegPercent}
                        simulatedAddedArea={simulatedAddedArea}
                        remainingSimGapPercent={remainingSimGapPercent}
                        simulatedGainPercent={simulatedGainPercent}
                        selectedCampus={selectedCampus}
                        selectedSpatialItem={selectedSpatialItem}
                        setSelectedSpatialItem={setSelectedSpatialItem}
                        campusBoundaries={campusBoundaries}
                        selectedCampusBoundary={selectedCampusBoundary}
                        geoJsonData={geoJsonData}
                        feedbackGeoJson={feedbackGeoJson}
                        categories={categories}
                        recSubTab={recSubTab}
                        setRecSubTab={setRecSubTab}
                        allSpatialLayers={allSpatialLayers}
                        spatialSearch={spatialSearch}
                        setSpatialSearch={setSpatialSearch}
                        spatialPillarFilter={spatialPillarFilter}
                        setSpatialPillarFilter={setSpatialPillarFilter}
                        conservationLayers={conservationLayers}
                        rthConversionLayers={rthConversionLayers}
                        revitalizationLayers={revitalizationLayers}
                        alternativeLayers={alternativeLayers}
                        filteredSpatialItems={filteredSpatialItems}
                        toggleSimulateLayer={toggleSimulateLayer}
                        recommendations={recommendations}
                    />
                )}
            </div>
        </>
    );
}

