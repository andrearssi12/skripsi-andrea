import React from 'react';
import { Link, router } from '@inertiajs/react';
import { MapPin, Zap, RotateCcw, Compass, X, Search, CheckSquare, Square, CheckCircle2, Shield, Leaf, Trees, Sparkles } from 'lucide-react';
import { formatArea } from '@/lib/utils';
import LeafletMap from '@/components/map/LeafletMap';
import MapLegend from '@/components/map/MapLegend';
import MapPopup from '@/components/map/MapPopup';

export default function SpatialStudioTab({
    campuses = [],
    selectedCampusId,
    handleCampusFilter,
    handleSelectAllSimulated,
    handleClearSimulated,
    simulatedLayerIds = [],
    potentialLayers = [],
    greenPercent,
    analysis = {},
    isTargetAchievedWithSim,
    isAchieved,
    simulatedVegPercent,
    simulatedAddedArea,
    remainingSimGapPercent,
    simulatedGainPercent,
    selectedCampus,
    selectedSpatialItem,
    setSelectedSpatialItem,
    campusBoundaries,
    selectedCampusBoundary,
    geoJsonData,
    feedbackGeoJson,
    categories = [],
    recSubTab,
    setRecSubTab,
    allSpatialLayers = [],
    spatialSearch,
    setSpatialSearch,
    spatialPillarFilter,
    setSpatialPillarFilter,
    conservationLayers = [],
    rthConversionLayers = [],
    revitalizationLayers = [],
    alternativeLayers = [],
    filteredSpatialItems = [],
    toggleSimulateLayer,
    recommendations = {},
}) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Banner Simulator & Defisit */}
            <div className="card p-5 bg-gradient-to-br from-emerald-950/5 via-white to-sky-950/5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-sky-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 font-display">
                                    Studio Simulasi & Perencanaan Spasial Kampus
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                    Simulasikan penambahan tutupan hijau dan setujui (ACC) rencana pengembangan spasial resmi
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {campuses.length > 0 && (
                            <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 p-1 px-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                <span className="text-xs font-bold text-gray-700 dark:text-slate-300 whitespace-nowrap">
                                    Kampus:
                                </span>
                                <select
                                    value={selectedCampusId || ''}
                                    onChange={(e) => handleCampusFilter(e.target.value)}
                                    className="form-select text-xs py-1 px-2 rounded-lg font-semibold bg-transparent border-0 focus:ring-0 cursor-pointer"
                                >
                                    <option value="">Semua Kampus</option>
                                    {campuses.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSelectAllSimulated}
                            className="btn btn-sm bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-100 font-bold flex items-center gap-1.5"
                        >
                            <Zap className="w-3.5 h-3.5 text-sky-600" />
                            <span>Simulasikan Semua Potensi ({potentialLayers.length})</span>
                        </button>

                        {simulatedLayerIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearSimulated}
                                className="btn btn-sm bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold flex items-center gap-1.5"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Gauge */}
                <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-gray-200/80 dark:border-slate-700 shadow-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                        <div>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 block">Total Vegetasi Saat Ini</span>
                            <span className="text-xl font-bold text-gray-800 dark:text-slate-200">
                                {analysis.vegetated_percentage ?? greenPercent}%
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                                RTH: {greenPercent}% • Non-RTH: {(Math.max(0, (analysis.vegetated_percentage || 0) - (greenPercent || 0))).toFixed(2)}%
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 block">
                                {simulatedLayerIds.length > 0 ? 'Prediksi Tutupan Simulasi' : 'Target Standar'}
                            </span>
                            <span className={`text-xl font-extrabold ${
                                simulatedLayerIds.length > 0
                                    ? isTargetAchievedWithSim ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
                                    : 'text-amber-600 dark:text-amber-400'
                            }`}>
                                {simulatedLayerIds.length > 0 ? `${simulatedVegPercent}%` : '30.0%'}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                                {simulatedLayerIds.length > 0 ? `+${formatArea(simulatedAddedArea)} vegetasi baru` : 'Target Minimum Permen'}
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 block">Status Target 30%</span>
                            <span className={`text-base font-bold ${
                                isTargetAchievedWithSim || isAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                                {isTargetAchievedWithSim || isAchieved ? '✓ Terpenuhi' : `Defisit ${remainingSimGapPercent}%`}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                                {simulatedLayerIds.length} layer dikonversi
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden relative flex">
                            <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-amber-500 z-10" title="Batas Target 30%" />
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, greenPercent)}%` }}
                                title={`RTH: ${greenPercent}%`}
                            />
                            <div
                                className="h-full bg-lime-400 transition-all duration-500"
                                style={{ width: `${Math.min(100 - greenPercent, Math.max(0, (analysis.vegetated_percentage || 0) - greenPercent))}%` }}
                                title={`Non-RTH: ${(Math.max(0, (analysis.vegetated_percentage || 0) - greenPercent)).toFixed(2)}%`}
                            />
                            {simulatedGainPercent > 0 && (
                                <div
                                    className="h-full bg-sky-400 dark:bg-sky-500 transition-all duration-500 animate-pulse"
                                    style={{
                                        width: `${Math.min(100 - (analysis.vegetated_percentage || greenPercent), simulatedGainPercent)}%`
                                    }}
                                    title={`Simulasi Tambahan: +${simulatedGainPercent}%`}
                                />
                            )}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                            <span>0%</span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold">Ambang Batas 30%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 card p-5 flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 font-display flex items-center gap-2">
                                <Compass className="w-4 h-4 text-emerald-600" />
                                <span>Peta Zonasi Analisis Spasial</span>
                                {selectedCampus && (
                                    <span className="badge badge-green text-[10px] font-bold">
                                        {selectedCampus.name}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                Klik kartu rekomendasi di samping atau klik poligon pada peta untuk zoom & sorot objek
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedSpatialItem && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedSpatialItem(null)}
                                    className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800"
                                    title="Batalkan sorotan layer"
                                >
                                    <X className="w-3 h-3" />
                                    <span>Reset Sorotan</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-inner">
                        <LeafletMap
                            campusBoundaries={campusBoundaries}
                            selectedCampusBoundary={selectedCampusBoundary}
                            landUsesGeoJson={geoJsonData}
                            mapMode="spatial_analysis"
                            simulatedLayerIds={simulatedLayerIds}
                            feedbackGeoJson={feedbackGeoJson}
                            selectedFeature={selectedSpatialItem}
                            onPolygonClick={(feat) => setSelectedSpatialItem(feat)}
                            height="100%"
                        />
                        <MapLegend categories={categories} mapMode="spatial_analysis" />
                        <MapPopup
                            feature={selectedSpatialItem}
                            onClose={() => setSelectedSpatialItem(null)}
                        />
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60 text-xs text-gray-500 dark:text-slate-400 flex items-center justify-between">
                        <span>💡 Klik objek layer pada peta untuk menginspeksi atau memilih kartu rekomendasi di samping.</span>
                        <Link href="/map" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                            Buka Full GIS ➔
                        </Link>
                    </div>
                </div>

                {/* Right: Recommendation & ACC Manager */}
                <div className="lg:col-span-5 card p-5 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 font-display">
                                Daftar Rekomendasi Spasial
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                Simulasikan atau setujui (ACC) rencana pengembangan
                            </p>
                        </div>

                        <div className="flex p-0.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs">
                            <button
                                type="button"
                                onClick={() => setRecSubTab('spatial')}
                                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                                    recSubTab === 'spatial'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-slate-400'
                                }`}
                            >
                                Spasial ({allSpatialLayers.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecSubTab('text')}
                                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                                    recSubTab === 'text'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-slate-400'
                                }`}
                            >
                                Pedoman Umum
                            </button>
                        </div>
                    </div>

                    {recSubTab === 'spatial' ? (
                        <>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={spatialSearch}
                                    onChange={e => setSpatialSearch(e.target.value)}
                                    placeholder="Cari layer rekomendasi..."
                                    className="form-input pl-8 pr-7 py-1.5 text-xs rounded-xl w-full"
                                />
                                {spatialSearch && (
                                    <button onClick={() => setSpatialSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl text-[10px]">
                                {[
                                    { key: 'all', label: 'Semua', count: allSpatialLayers.length },
                                    { key: 'conservation', label: '🛡️ Proteksi', count: conservationLayers.filter(l => l.pillar_type === 'conservation').length, cls: 'bg-emerald-600 text-white' },
                                    { key: 'conversion', label: '🌱 Konversi', count: rthConversionLayers.length, cls: 'bg-teal-600 text-white' },
                                    { key: 'revitalization', label: '🌳 Revitalisasi', count: revitalizationLayers.length, cls: 'bg-amber-600 text-white' },
                                    { key: 'alternative', label: '🏢 Alternatif', count: alternativeLayers.length, cls: 'bg-sky-600 text-white' },
                                    { key: 'simulated', label: '⚡ Tersimulasi', count: simulatedLayerIds.length, cls: 'bg-sky-700 text-white' },
                                ].map(({ key, label, count, cls }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSpatialPillarFilter(key)}
                                        className={`px-2 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                                            spatialPillarFilter === key
                                                ? (cls || 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs')
                                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>{label}</span>
                                        <span className={`text-[9px] ${spatialPillarFilter === key && cls ? 'opacity-80' : 'text-gray-400'}`}>({count})</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
                                {filteredSpatialItems.length === 0 ? (
                                    <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-500">
                                        Tidak ada rekomendasi pada filter ini.
                                    </div>
                                ) : (
                                    filteredSpatialItems.map((item) => {
                                        const isConservation = item.zone_type === 'conservation';
                                        const isSimulated = simulatedLayerIds.includes(item.id);
                                        const isApproved = item.is_approved === true;
                                        const isConversion = item.pillar_type === 'rth_conversion';
                                        const isRevitalization = item.pillar_type === 'revitalization';
                                        const isSelected = selectedSpatialItem && String(selectedSpatialItem.id) === String(item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedSpatialItem(prev => (prev && String(prev.id) === String(item.id) ? null : item))}
                                                className={`p-3.5 rounded-2xl border transition-all space-y-2 cursor-pointer select-none ${
                                                    isSelected
                                                        ? 'ring-2 ring-amber-500 shadow-lg scale-[1.01] bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500'
                                                        : isApproved
                                                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/20 hover:border-emerald-500 hover:shadow-sm'
                                                            : isSimulated
                                                                ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 ring-2 ring-sky-400/20 hover:border-sky-400 hover:shadow-sm'
                                                                : isConversion
                                                                    ? 'bg-teal-50/60 dark:bg-teal-950/25 border-teal-200 dark:border-teal-800/60 hover:border-teal-400 hover:shadow-sm'
                                                                    : isRevitalization
                                                                        ? 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/50 hover:border-amber-400 hover:shadow-sm'
                                                                        : isConservation
                                                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-400 hover:shadow-sm'
                                                                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-400 hover:shadow-sm'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-amber-600 animate-bounce" />
                                                            <span>Sedang Di-Zoom & Disorot pada Peta</span>
                                                        </span>
                                                        <span className="text-[9px] underline">Klik untuk batalkan</span>
                                                    </div>
                                                )}

                                                {isApproved && (
                                                    <div className="flex items-center justify-between text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md">
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Telah di-ACC — Tampil di Perencanaan Kampus Publik
                                                        </span>
                                                        {item.target_year && <span>Target: {item.target_year}</span>}
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        {isConservation ? (
                                                            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                        ) : isConversion ? (
                                                            <Leaf className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                                        ) : (
                                                            <Trees className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                        )}
                                                        <span className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className={`badge text-[9px] flex-shrink-0 ${item.badge_color || 'badge-slate'}`}>
                                                        {item.badge}
                                                    </span>
                                                </div>

                                                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                                                    {item.action_description || item.action_benefit}
                                                </p>

                                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-gray-100/80 dark:border-slate-800 text-[11px]">
                                                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                                                        <span>{formatArea(item.area_size)}</span>
                                                        {item.potential_gain_percent > 0 && (
                                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                +{item.potential_gain_percent}%
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSimulateLayer(item.id);
                                                            }}
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                                                isSimulated
                                                                    ? 'bg-sky-600 text-white shadow-xs'
                                                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-950/50'
                                                            }`}
                                                        >
                                                            {isSimulated ? (
                                                                <>
                                                                    <CheckSquare className="w-3 h-3" />
                                                                    <span>Tersimulasi</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Square className="w-3 h-3" />
                                                                    <span>Simulasikan</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.post(route('spatial-plans.toggle-approval'), {
                                                                    campus_id: item.campus_id || selectedCampusId,
                                                                    land_use_id: item.id,
                                                                    title: item.intervention_title || item.name,
                                                                    pillar_type: item.pillar_type || item.zone_type,
                                                                    description: item.action_benefit || item.action_description,
                                                                    area_size: item.area_size,
                                                                    potential_gain_percent: item.potential_gain_percent || 0,
                                                                }, { preserveScroll: true });
                                                            }}
                                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-xs ${
                                                                isApproved
                                                                    ? 'bg-emerald-600 text-white hover:bg-rose-600 hover:text-white'
                                                                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                                                            }`}
                                                        >
                                                            {isApproved ? (
                                                                <>
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>✓ Ter-ACC</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                                    <span>+ ACC Rencana</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                            {(recommendations.items || []).map((rec) => (
                                <div
                                    key={rec.id}
                                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 space-y-1.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                                            {rec.title}
                                        </span>
                                        <span className={`badge text-[10px] ${
                                            rec.priority === 'Tinggi' ? 'badge-amber' : 'badge-green'
                                        }`}>
                                            Prioritas {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                                        {rec.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-[11px] text-gray-400 dark:text-slate-500 italic pt-1">
                        * Seluruh kartu spasial terintegrasi dengan koordinat poligon aktual pada peta GIS.
                    </p>
                </div>
            </div>
        </div>
    );
}
