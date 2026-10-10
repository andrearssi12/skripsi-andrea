import React from 'react';
import LeafletMap from '@/components/map/LeafletMap';
import MapPopup from '@/components/map/MapPopup';
import MapSearch from '@/components/map/MapSearch';
import MapLegend from '@/components/map/MapLegend';
import { Layers, Sparkles, Zap, Minimize2, Maximize2, ChevronRight, ChevronDown, Building2 } from 'lucide-react';
import LayerCatalogTab from './LayerCatalogTab';
import SpatialSidebarTab from './SpatialSidebarTab';
import { formatArea } from '@/lib/utils';

export default function MapSection({
    mapWorkspaceRef,
    isFullscreen,
    toggleFullscreen,
    selectedCampus,
    mapMode,
    setMapMode,
    simulatedLayerIds,
    simulatedVegPercent,
    simulatedGainPercent,
    greenPercent,
    vegetatedPercent,
    sidebarOpen,
    setSidebarOpen,
    campusBoundaries,
    selectedCampusBoundary,
    currentCampusGeoJson,
    selectedFeature,
    setSelectedFeature,
    currentApprovedSpatialPlansGeoJson,
    handleSelectPlan,
    mapFilters,
    setMapFilters,
    feedbackGeoJson,
    categories,
    campuses,
    selectedCampusId,
    handleCampusSelect,
    sidebarTab,
    setSidebarTab,
    isAdmin,
    adminSpatialSubTab,
    setAdminSpatialSubTab,
    activeSpatialRecs,
    landUses,
    filteredLayers,
    layerSearch,
    setLayerSearch,
    layerFilterTab,
    setLayerFilterTab,
    handleLayerClick,
    isAchieved,
    analysis,
    gapPercent,
    simulatedAddedArea,
    isTargetAchievedWithSim,
    remainingSimGapPercent,
    handleClearSimulated,
    spatialSearch,
    setSpatialSearch,
    spatialFilterTab,
    setSpatialFilterTab,
    conservationLayers,
    potentialLayers,
    rthConversionLayers,
    revitalizationLayers,
    alternativeVegLayers,
    filteredSpatialItems,
    toggleSimulateLayer,
    handleSelectAllSimulated,
}) {
    return (
        <section
            id="peta"
            ref={mapWorkspaceRef}
            className={`relative flex flex-col transition-all duration-300 ${
                isFullscreen
                    ? 'fixed inset-0 z-[99999] w-screen h-screen bg-slate-900'
                    : ''
            }`}
            style={isFullscreen ? { height: '100vh' } : { height: '100svh', minHeight: '600px' }}
        >
            {/* Campus header bar */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm z-10 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="badge badge-green font-bold text-xs flex-shrink-0">{selectedCampus?.code}</span>
                    <h2 className="font-bold text-gray-900 dark:text-slate-100 text-sm truncate">{selectedCampus?.name}</h2>
                    <span className="hidden sm:block text-xs text-gray-400 dark:text-slate-500 truncate">— {selectedCampus?.address}</span>
                </div>

                {/* Mode Toggle & Status Badges */}
                <div className="flex items-center gap-2.5 flex-shrink-0 text-xs font-semibold">
                    <div className="flex items-center p-0.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-[11px] border border-gray-200/80 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => {
                                setMapMode('standard');
                                if (selectedFeature?.is_spatial_plan) setSelectedFeature(null);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                                mapMode === 'standard'
                                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-bold'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                            }`}
                            title="Tampilkan peta dengan warna kategori asli"
                        >
                            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden md:inline">Peta Standar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMapMode('spatial_analysis');
                                setSidebarOpen(true);
                                setSidebarTab('spatial');
                            }}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                                mapMode === 'spatial_analysis'
                                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                            title="Tampilkan zonasi rekomendasi & simulasi spasial"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Analisis Spasial</span>
                        </button>
                    </div>

                    {mapMode === 'spatial_analysis' && simulatedLayerIds.length > 0 ? (
                        <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[11px]">
                            <Zap className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                            <span>Simulasi: <strong>{simulatedVegPercent}%</strong> (+{simulatedGainPercent}%)</span>
                        </span>
                    ) : (
                        <span className="hidden sm:flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            Green Area: <strong>{greenPercent}%</strong>
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="btn btn-secondary btn-sm flex items-center gap-1.5 font-bold"
                        title={isFullscreen ? 'Keluar Layar Penuh (ESC)' : 'Tampilkan Peta Layar Penuh (Full Screen)'}
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Keluar Fullscreen</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Layar Penuh</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(v => !v)}
                        className="btn btn-secondary btn-sm"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Panel</span>
                        {sidebarOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-90" />}
                    </button>
                </div>
            </div>

            {/* Map workspace */}
            <div className="flex-1 flex min-h-0 relative">
                <div className="flex-1 relative min-w-0">
                    <LeafletMap
                        campusBoundaries={campusBoundaries}
                        selectedCampusBoundary={selectedCampusBoundary}
                        landUsesGeoJson={currentCampusGeoJson}
                        selectedFeature={selectedFeature}
                        approvedSpatialPlansGeoJson={currentApprovedSpatialPlansGeoJson}
                        showSpatialPlans={mapMode === 'spatial_analysis'}
                        onSpatialPlanClick={handleSelectPlan}
                        mapMode={mapMode}
                        simulatedLayerIds={simulatedLayerIds}
                        filters={mapFilters}
                        onPolygonClick={setSelectedFeature}
                        onFeedbackClick={(fb) => { if (fb) setSelectedFeature(null); }}
                        feedbackGeoJson={feedbackGeoJson}
                        height="100%"
                    />

                    <MapSearch
                        filters={mapFilters}
                        onFilterChange={setMapFilters}
                        categories={categories}
                        campuses={campuses}
                        selectedCampusId={selectedCampusId}
                        onCampusChange={handleCampusSelect}
                    />

                    <MapLegend
                        categories={categories}
                        mapMode={mapMode}
                    />

                    <MapPopup feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
                </div>

                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="w-80 xl:w-96 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 flex flex-col shadow-lg overflow-hidden transition-colors">
                        <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/80 text-xs">
                            <button
                                type="button"
                                onClick={() => setSidebarTab('layers')}
                                className={`flex-1 py-2.5 px-3 font-bold text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                                    sidebarTab === 'layers'
                                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Katalog Layer</span>
                                <span className="text-[10px] opacity-70">({landUses.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSidebarTab('spatial');
                                    setMapMode('spatial_analysis');
                                }}
                                className={`flex-1 py-2.5 px-3 font-bold text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                                    sidebarTab === 'spatial'
                                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                                }`}
                            >
                                {isAdmin ? (
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                ) : (
                                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <span>{isAdmin ? 'Perencanaan & Rekomendasi' : 'Perencanaan Kampus'}</span>
                                {isAdmin && simulatedLayerIds.length > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                                )}
                                {(activeSpatialRecs.approved_plans || []).length > 0 && (
                                    <span className="badge badge-green text-[9px] py-0 px-1">
                                        {(activeSpatialRecs.approved_plans || []).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {sidebarTab === 'layers' && (
                            <LayerCatalogTab
                                landUses={landUses}
                                filteredLayers={filteredLayers}
                                layerSearch={layerSearch}
                                setLayerSearch={setLayerSearch}
                                layerFilterTab={layerFilterTab}
                                setLayerFilterTab={setLayerFilterTab}
                                selectedFeature={selectedFeature}
                                onLayerClick={handleLayerClick}
                            />
                        )}

                        {sidebarTab === 'spatial' && (
                            <SpatialSidebarTab
                                isAdmin={isAdmin}
                                adminSpatialSubTab={adminSpatialSubTab}
                                setAdminSpatialSubTab={setAdminSpatialSubTab}
                                activeSpatialRecs={activeSpatialRecs}
                                simulatedLayerIds={simulatedLayerIds}
                                isAchieved={isAchieved}
                                analysis={analysis}
                                gapPercent={gapPercent}
                                greenPercent={greenPercent}
                                simulatedVegPercent={simulatedVegPercent}
                                simulatedGainPercent={simulatedGainPercent}
                                simulatedAddedArea={simulatedAddedArea}
                                isTargetAchievedWithSim={isTargetAchievedWithSim}
                                remainingSimGapPercent={remainingSimGapPercent}
                                onClearSimulated={handleClearSimulated}
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
                                selectedFeature={selectedFeature}
                                onLayerClick={handleLayerClick}
                                onToggleSimulate={toggleSimulateLayer}
                                onSelectAllSimulated={handleSelectAllSimulated}
                                onToggleApproval={(item) => {
                                    import('@inertiajs/react').then(({ router }) => {
                                        router.post(route('spatial-plans.toggle-approval'), {
                                            campus_id: selectedCampusId,
                                            land_use_id: item.id,
                                            title: item.action_title || item.intervention_title || item.name,
                                            pillar_type: item.pillar_type || item.zone_type,
                                            description: item.action_description,
                                            area_size: item.area_size,
                                            potential_gain_percent: item.contribution_percent || item.potential_gain_percent || 0,
                                        }, { preserveScroll: true });
                                    });
                                }}
                                onSelectPlan={handleSelectPlan}
                            />
                        )}

                        <div className="flex-shrink-0 border-t border-gray-100 dark:border-slate-800 px-4 py-3 bg-gray-50/60 dark:bg-slate-800/60 grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div>
                                <span className="text-gray-400 dark:text-slate-500 block">Luas Total</span>
                                <span className="font-bold text-gray-800 dark:text-slate-200 text-xs">{formatArea(selectedCampus?.total_area)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 dark:text-slate-500 block">Green Area</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{greenPercent}%</span>
                            </div>
                            <div>
                                <span className="text-gray-400 dark:text-slate-500 block">Vegetasi</span>
                                <span className="font-bold text-lime-600 dark:text-lime-400 text-xs">{vegetatedPercent}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
