import { useMemo } from "react";

const EMPTY_GEOJSON = { type: "FeatureCollection", features: [] };

export default function useLandingData({
    campuses,
    selectedCampusId,
    initialAnalysis,
    initialRecommendations,
    analysisByCampus,
    initialSpatialRecommendations,
    spatialRecommendationsByCampus,
    targetPercent,
    allLandUses,
    landUsesGeoJson,
    approvedSpatialPlansGeoJson,
    layerSearch,
    layerFilterTab,
    spatialSearch,
    spatialFilterTab,
    simulatedLayerIds,
}) {
    const selectedCampus = useMemo(
        () =>
            campuses.find(
                (campus) => String(campus.id) === String(selectedCampusId),
            ) ||
            campuses[0] ||
            null,
        [campuses, selectedCampusId],
    );

    const selectedCampusBoundary = useMemo(() => {
        if (!selectedCampus?.boundary_geometry) return null;
        return {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {
                        name: selectedCampus.name,
                        code: selectedCampus.code,
                    },
                    geometry: selectedCampus.boundary_geometry,
                },
            ],
        };
    }, [selectedCampus]);

    const analysis = useMemo(() => {
        if (selectedCampusId && analysisByCampus[selectedCampusId]?.analysis)
            return analysisByCampus[selectedCampusId].analysis;
        return selectedCampus?.analysis || initialAnalysis;
    }, [analysisByCampus, initialAnalysis, selectedCampus, selectedCampusId]);

    const recommendations = useMemo(() => {
        if (
            selectedCampusId &&
            analysisByCampus[selectedCampusId]?.recommendations
        )
            return analysisByCampus[selectedCampusId].recommendations;
        return selectedCampus?.recommendations || initialRecommendations;
    }, [
        analysisByCampus,
        initialRecommendations,
        selectedCampus,
        selectedCampusId,
    ]);

    const activeSpatialRecommendations = useMemo(
        () =>
            spatialRecommendationsByCampus[selectedCampusId] ||
            initialSpatialRecommendations || {
                conservation_layers: [],
                revitalization_layers: [],
                rth_conversion_layers: [],
                potential_layers: [],
                summary: {},
            },
        [
            initialSpatialRecommendations,
            selectedCampusId,
            spatialRecommendationsByCampus,
        ],
    );

    const conservationLayers =
        activeSpatialRecommendations.conservation_layers || [];
    const revitalizationLayers =
        activeSpatialRecommendations.revitalization_layers || [];
    const rthConversionLayers =
        activeSpatialRecommendations.rth_conversion_layers || [];
    const potentialLayers = activeSpatialRecommendations.potential_layers || [];
    const alternativeVegLayers = useMemo(
        () =>
            potentialLayers.filter(
                (layer) => layer.pillar_type !== "rth_conversion",
            ),
        [potentialLayers],
    );

    const greenPercent =
        selectedCampus?.green_percentage ?? analysis.green_percentage ?? 0;
    const vegetatedPercent =
        selectedCampus?.vegetated_percentage ??
        analysis.vegetated_percentage ??
        0;
    const isAchieved =
        selectedCampus?.is_achieved ?? analysis.is_achieved ?? false;
    const gapPercent =
        analysis.gap_percentage ??
        (isAchieved
            ? 0
            : Math.max(0, Number((targetPercent - greenPercent).toFixed(2))));

    const landUses = useMemo(
        () =>
            selectedCampusId
                ? allLandUses.filter(
                      (item) =>
                          String(item.campus_id) === String(selectedCampusId),
                  )
                : allLandUses,
        [allLandUses, selectedCampusId],
    );
    const currentCampusGeoJson = useMemo(
        () =>
            selectedCampusId
                ? {
                      type: "FeatureCollection",
                      features: (landUsesGeoJson?.features || []).filter(
                          (feature) =>
                              String(feature.properties?.campus_id) ===
                              String(selectedCampusId),
                      ),
                  }
                : landUsesGeoJson || EMPTY_GEOJSON,
        [landUsesGeoJson, selectedCampusId],
    );
    const currentApprovedSpatialPlansGeoJson = useMemo(
        () =>
            selectedCampusId
                ? {
                      type: "FeatureCollection",
                      features: (
                          approvedSpatialPlansGeoJson?.features || []
                      ).filter(
                          (feature) =>
                              String(feature.properties?.campus_id) ===
                              String(selectedCampusId),
                      ),
                  }
                : approvedSpatialPlansGeoJson || EMPTY_GEOJSON,
        [approvedSpatialPlansGeoJson, selectedCampusId],
    );

    const simulatedAddedArea = useMemo(
        () =>
            potentialLayers
                .filter((layer) => simulatedLayerIds.includes(layer.id))
                .reduce((total, layer) => total + layer.area_size, 0),
        [potentialLayers, simulatedLayerIds],
    );
    const totalCampusArea = selectedCampus?.total_area || 1;
    const currentGreenArea = analysis.green_area_size || 0;
    const currentTotalVegArea =
        analysis.total_vegetated_size ||
        (analysis.green_area_size || 0) + (analysis.vegetasi_non_rth_size || 0);

    const simulatedVegPercent = Number(
        (
            ((currentTotalVegArea + simulatedAddedArea) / totalCampusArea) *
            100
        ).toFixed(2),
    );
    const simulatedGreenPercent = Number(
        (
            ((currentGreenArea + simulatedAddedArea) / totalCampusArea) *
            100
        ).toFixed(2),
    );
    const simulatedGainPercent = Number(
        ((simulatedAddedArea / totalCampusArea) * 100).toFixed(2),
    );
    const isTargetAchievedWithSim = simulatedVegPercent >= targetPercent;
    const remainingSimGapPercent = Math.max(
        0,
        Number((targetPercent - simulatedVegPercent).toFixed(2)),
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
                [item.name, item.zone_label, item.intervention_title].some(
                    (value) => (value || "").toLowerCase().includes(query),
                ),
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

    return {
        selectedCampus,
        selectedCampusBoundary,
        analysis,
        recommendations,
        activeSpatialRecommendations,
        conservationLayers,
        revitalizationLayers,
        rthConversionLayers,
        potentialLayers,
        alternativeVegLayers,
        greenPercent,
        vegetatedPercent,
        isAchieved,
        gapPercent,
        landUses,
        currentCampusGeoJson,
        currentApprovedSpatialPlansGeoJson,
        currentTotalVegArea,
        simulatedAddedArea,
        simulatedVegPercent,
        simulatedGreenPercent,
        simulatedGainPercent,
        isTargetAchievedWithSim,
        remainingSimGapPercent,
        filteredLayers,
        filteredSpatialItems,
    };
}
