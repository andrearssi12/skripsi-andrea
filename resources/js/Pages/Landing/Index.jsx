import { useState, useRef, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import LandingNav from "./sections/LandingNav";
import HeroSection from "./sections/HeroSection";
import MapSection from "./sections/MapSection";
import AnalysisSection from "./sections/AnalysisSection";
import useFullscreen from "@/hooks/useFullscreen";
import useLandingData from "@/hooks/useLandingData";
import { Leaf } from "lucide-react";

export default function Landing({
    campuses = [],
    categories = [],
    initialCampus = null,
    campusBoundaries = { type: "FeatureCollection", features: [] },
    landUsesGeoJson = { type: "FeatureCollection", features: [] },
    allLandUses = [],
    analysis: initialAnalysis = {},
    recommendations: initialRecs = {},
    analysisByCampus = {},
    spatialRecommendations: initialSpatialRecs = null,
    spatialRecsByCampus = {},
    recentFeedback = [],
    targetPercent = 30,
    feedbackGeoJson = null,
    approvedSpatialPlansGeoJson = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === "admin";

    /* ── active campus state ── */
    const [selectedCampusId, setSelectedCampusId] = useState(
        initialCampus?.id ?? campuses[0]?.id ?? null,
    );

    /* ── map mode: 'standard' | 'spatial_analysis' ── */
    const [mapMode, setMapMode] = useState("standard");

    /* ── map filters & selection ── */
    const [mapFilters, setMapFilters] = useState({
        search: "",
        category_id: "",
        green_status: "",
    });
    const [selectedFeature, setSelectedFeature] = useState(null);

    /* ── sidebar tabs & filters ── */
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarTab, setSidebarTab] = useState("layers"); // 'layers' | 'spatial'
    const [adminSpatialSubTab, setAdminSpatialSubTab] = useState("plans"); // 'plans' | 'recommendations'
    const [layerSearch, setLayerSearch] = useState("");
    const [layerFilterTab, setLayerFilterTab] = useState("all"); // all | green | veg | non_green
    const [spatialFilterTab, setSpatialFilterTab] = useState("all");
    const [spatialSearch, setSpatialSearch] = useState("");

    /* ── interactive what-if simulation state ── */
    const [simulatedLayerIds, setSimulatedLayerIds] = useState([]);

    const mapSectionRef = useRef(null);
    const mapWorkspaceRef = useRef(null);
    const { isFullscreen, toggleFullscreen } = useFullscreen(mapWorkspaceRef);

    const {
        selectedCampus,
        selectedCampusBoundary,
        analysis,
        recommendations,
        activeSpatialRecommendations: activeSpatialRecs,
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
        simulatedAddedArea,
        simulatedVegPercent,
        simulatedGainPercent,
        isTargetAchievedWithSim,
        remainingSimGapPercent,
        filteredLayers,
        filteredSpatialItems,
    } = useLandingData({
        campuses,
        selectedCampusId,
        initialAnalysis,
        initialRecommendations: initialRecs,
        analysisByCampus,
        initialSpatialRecommendations: initialSpatialRecs,
        spatialRecommendationsByCampus: spatialRecsByCampus,
        targetPercent,
        allLandUses,
        landUsesGeoJson,
        approvedSpatialPlansGeoJson,
        layerSearch,
        layerFilterTab,
        spatialSearch,
        spatialFilterTab,
        simulatedLayerIds,
    });

    /* ── switch campus handler ── */
    const handleCampusSelect = useCallback((campusId) => {
        const id = campusId ? Number(campusId) : null;
        setSelectedCampusId(id);
        setSelectedFeature(null);
        setLayerSearch("");
        setSpatialSearch("");
        setLayerFilterTab("all");
        setSpatialFilterTab("all");
        setSimulatedLayerIds([]);
    }, []);

    const handleLayerClick = useCallback(
        (item) => {
            const itemFeedbacks =
                item.feedbacks ||
                (item.feedback
                    ? item.feedback.map((fb) => ({
                          id: fb.id,
                          title: fb.title,
                          message: fb.message,
                          status: fb.status,
                          image_url: fb.image ? `/storage/${fb.image}` : null,
                          user_name: fb.user?.name || "Civitas UAD",
                          created_at: fb.created_at,
                      }))
                    : []);

            setSelectedFeature({
                id: item.id,
                name: item.name,
                campus_name: selectedCampus?.name,
                category_name: item.category?.name || item.category_name,
                category_color: item.category?.color || item.category_color,
                area_size: item.area_size,
                green_status: item.green_status,
                condition: item.condition,
                parent_name: item.parent?.name || item.parent_name,
                description: item.description,
                zone_type: item.zone_type,
                intervention_title: item.intervention_title,
                action_description: item.action_description,
                gap_coverage_percent: item.gap_coverage_percent,
                feedbacks: itemFeedbacks,
                feedbacks_count: itemFeedbacks.length,
            });
        },
        [selectedCampus],
    );

    const toggleSimulateLayer = useCallback((layerId) => {
        setSimulatedLayerIds((prev) =>
            prev.includes(layerId)
                ? prev.filter((id) => id !== layerId)
                : [...prev, layerId],
        );
    }, []);

    const handleSelectAllSimulated = useCallback(() => {
        setSimulatedLayerIds(potentialLayers.map((l) => l.id));
    }, [potentialLayers]);

    const handleClearSimulated = useCallback(() => {
        setSimulatedLayerIds([]);
    }, []);

    const handleOpenSpatialMode = useCallback(() => {
        setMapMode("spatial_analysis");
        setSidebarOpen(true);
        setSidebarTab("spatial");
        if (mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    const handleSelectPlan = useCallback(
        (plan) => {
            const planId = plan.plan_id || plan.id;
            setSelectedFeature({
                id: planId ? `plan_${planId}` : plan.id,
                plan_id: planId,
                name: plan.title || plan.name,
                category_name:
                    plan.status === "implemented"
                        ? "Rencana Terimplementasi"
                        : "Perencanaan Kampus (ACC)",
                category_color: "#0284c7",
                green_status:
                    plan.status === "implemented"
                        ? "Terimplementasi"
                        : "Rencana Masa Depan",
                area_size: plan.area_size,
                description:
                    plan.description || plan.notes || plan.action_description,
                campus_name: plan.campus_name || selectedCampus?.name,
                target_year: plan.target_year,
                pillar_type: plan.pillar_type,
                is_spatial_plan: true,
            });
        },
        [selectedCampus],
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
            <Head title="Web GIS Pemetaan Kawasan Hijau UAD" />

            <LandingNav user={user} onOpenSpatialMode={handleOpenSpatialMode} />

            <HeroSection
                campuses={campuses}
                selectedCampusId={selectedCampusId}
                onCampusSelect={handleCampusSelect}
                onOpenSpatialMode={handleOpenSpatialMode}
            />

            <MapSection
                mapWorkspaceRef={mapWorkspaceRef}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                selectedCampus={selectedCampus}
                mapMode={mapMode}
                setMapMode={setMapMode}
                simulatedLayerIds={simulatedLayerIds}
                simulatedVegPercent={simulatedVegPercent}
                simulatedGainPercent={simulatedGainPercent}
                greenPercent={greenPercent}
                vegetatedPercent={vegetatedPercent}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                campusBoundaries={campusBoundaries}
                selectedCampusBoundary={selectedCampusBoundary}
                currentCampusGeoJson={currentCampusGeoJson}
                selectedFeature={selectedFeature}
                setSelectedFeature={setSelectedFeature}
                currentApprovedSpatialPlansGeoJson={
                    currentApprovedSpatialPlansGeoJson
                }
                handleSelectPlan={handleSelectPlan}
                mapFilters={mapFilters}
                setMapFilters={setMapFilters}
                feedbackGeoJson={feedbackGeoJson}
                categories={categories}
                campuses={campuses}
                selectedCampusId={selectedCampusId}
                handleCampusSelect={handleCampusSelect}
                sidebarTab={sidebarTab}
                setSidebarTab={setSidebarTab}
                isAdmin={isAdmin}
                adminSpatialSubTab={adminSpatialSubTab}
                setAdminSpatialSubTab={setAdminSpatialSubTab}
                activeSpatialRecs={activeSpatialRecs}
                landUses={landUses}
                filteredLayers={filteredLayers}
                layerSearch={layerSearch}
                setLayerSearch={setLayerSearch}
                layerFilterTab={layerFilterTab}
                setLayerFilterTab={setLayerFilterTab}
                handleLayerClick={handleLayerClick}
                isAchieved={isAchieved}
                analysis={analysis}
                gapPercent={gapPercent}
                simulatedAddedArea={simulatedAddedArea}
                isTargetAchievedWithSim={isTargetAchievedWithSim}
                remainingSimGapPercent={remainingSimGapPercent}
                handleClearSimulated={handleClearSimulated}
                spatialSearch={spatialSearch}
                setSpatialSearch={setSpatialSearch}
                spatialFilterTab={spatialFilterTab}
                setSpatialFilterTab={setSpatialFilterTab}
                conservationLayers={conservationLayers}
                potentialLayers={potentialLayers}
                rthConversionLayers={rthConversionLayers}
                revitalizationLayers={revitalizationLayers}
                alternativeVegLayers={alternativeVegLayers}
                filteredSpatialItems={filteredSpatialItems}
                toggleSimulateLayer={toggleSimulateLayer}
                handleSelectAllSimulated={handleSelectAllSimulated}
            />

            <AnalysisSection
                analysis={analysis}
                recommendations={recommendations}
                recentFeedback={recentFeedback}
                selectedCampus={selectedCampus}
                greenPercent={greenPercent}
                targetPercent={targetPercent}
                gapPercent={gapPercent}
                isAchieved={isAchieved}
                user={user}
            />

            <footer className="bg-slate-900 dark:bg-slate-950 text-gray-400 text-xs py-8 border-t border-slate-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <Leaf className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-white">
                            Universitas Ahmad Dahlan
                        </span>
                        <span className="hidden sm:inline text-gray-400">
                            • Sistem Informasi Geografis Kawasan Hijau
                        </span>
                    </div>
                    <span className="text-gray-400">
                        &copy; {new Date().getFullYear()} Universitas Ahmad
                        Dahlan — Green Campus Initiative
                    </span>
                </div>
            </footer>
        </div>
    );
}
