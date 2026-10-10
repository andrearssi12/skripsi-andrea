import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatArea } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import FeedbackPopup from '@/components/map/FeedbackPopup';

// Fix Leaflet default marker icons in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TILE_CONFIG = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    maxNativeZoom: 19,
};

/**
 * Returns distinct styling for each layer based on its configured category color.
 * Uses category_color as the primary source of truth so every category is visually unique.
 */
/**
 * Returns distinct styling for each layer based on its configured category color or spatial analysis zone.
 */
function getLayerStyle(feature, mapMode = 'standard', simulatedLayerIds = []) {
    const p = feature.properties || {};
    const { green_status, category_color, parent_id, id } = p;
    const isChild = Boolean(parent_id);
    const isGreen = green_status === 'Green Area';
    const isVeg = green_status === 'Vegetasi Non-RTH';

    // ── Mode 1: Spatial Analysis / Rekomendasi Spasial ─────────────────
    if (mapMode === 'spatial_analysis') {
        const isSimulated = simulatedLayerIds.some(sid => String(sid) === String(id));

        if (isSimulated) {
            return {
                color: '#0284c7', // Sky Blue glow
                weight: isChild ? 4 : 3.5,
                opacity: 1,
                fillColor: '#0ea5e9',
                fillOpacity: isChild ? 0.95 : 0.85,
                dashArray: '3, 3',
                className: 'simulated-polygon-pulse',
            };
        }

        if (isGreen || isVeg) {
            const needsRevitalization = ['Sedang', 'Kurang'].includes(p.condition);
            // Zona Konservasi Prioritas (Wajib Dipertahankan) & Zona Revitalisasi
            return {
                color: needsRevitalization ? '#d97706' : (isGreen ? '#059669' : '#16a34a'),
                weight: isChild ? 4 : 3,
                opacity: 1,
                fillColor: needsRevitalization ? '#f59e0b' : (isGreen ? '#10b981' : '#22c55e'),
                fillOpacity: isChild ? 0.9 : 0.75,
                dashArray: needsRevitalization ? '4, 3' : (isChild ? '2, 2' : null),
            };
        }

        // Non-Green Potential Analysis (Pilar 3 & 4)
        const lowerName = (p.name + ' ' + (p.category_name || '')).toLowerCase();
        const isOpenGround = /lapangan|tanah|halaman|taman|terbuka|kosong|rumput/i.test(lowerName);
        const isBuilding = /gedung|bangunan|aula|lab|hall|kantor|perpustakaan|masjid/i.test(lowerName);
        const isParkingOrPlaza = /parkir|plaza|paving|aspal/i.test(lowerName);
        const isCorridor = /jalan|selasar|pedestrian|koridor|jalur|trotoar/i.test(lowerName);

        if (isOpenGround && !isBuilding) {
            // Pilar 3: Kandidat Konversi RTH Baru
            return {
                color: '#0d9488', // Teal
                weight: isChild ? 3.5 : 3,
                opacity: 1,
                fillColor: '#14b8a6',
                fillOpacity: 0.65,
                dashArray: '6, 4',
            };
        }

        if (isBuilding) {
            return {
                color: '#0284c7', // Potential Green Roof / Vertical Garden
                weight: isChild ? 3 : 2.5,
                opacity: 0.95,
                fillColor: '#38bdf8',
                fillOpacity: isChild ? 0.55 : 0.4,
                dashArray: '5, 4',
            };
        }

        if (isParkingOrPlaza) {
            return {
                color: '#d97706', // Potential Canopy Trees / Planter Box
                weight: isChild ? 3 : 2.5,
                opacity: 0.95,
                fillColor: '#f59e0b',
                fillOpacity: isChild ? 0.55 : 0.4,
                dashArray: '5, 4',
            };
        }

        if (isCorridor) {
            return {
                color: '#65a30d', // Potential Green Corridor
                weight: 2.5,
                opacity: 0.9,
                fillColor: '#84cc16',
                fillOpacity: 0.4,
                dashArray: '4, 4',
            };
        }

        return {
            color: '#64748b',
            weight: 1.5,
            opacity: 0.5,
            fillColor: '#94a3b8',
            fillOpacity: 0.2,
        };
    }

    // ── Mode 2: Standard Thematic Category Colors ─────────────────────
    const baseColor = category_color || (isGreen ? '#10b981' : isVeg ? '#84cc16' : '#94a3b8');

    return {
        color: baseColor,
        weight: isChild ? 3.5 : 2,
        opacity: 1,
        fillColor: baseColor,
        fillOpacity: isChild ? 0.85 : 0.6,
        dashArray: isChild ? '3, 3' : null,
    };
}

function addLayerToMap(map, features, onPolygonClick, isChild = false, mapMode = 'standard', simulatedLayerIds = [], feedbackDensity = {}) {
    return L.geoJSON({ type: 'FeatureCollection', features }, {
        pane: isChild ? 'childPolygonPane' : 'parentPolygonPane',
        style: (feat) => getLayerStyle(feat, mapMode, simulatedLayerIds),
        onEachFeature: (feature, layerItem) => {
            const p = feature.properties || {};
            const isSimulated = simulatedLayerIds.some(sid => String(sid) === String(p.id));
            const isGreen = p.green_status === 'Green Area';
            const isVeg = p.green_status === 'Vegetasi Non-RTH';
            const reportCount = feedbackDensity[p.id] || 0;

            let tooltipBadge = '';
            if (mapMode === 'spatial_analysis') {
                if (isSimulated) {
                    tooltipBadge = `<div style="font-size:9px;color:#0284c7;font-weight:700">⚡ TERSIMULASI: Konversi Vegetasi Aktif</div>`;
                } else if (isGreen || isVeg) {
                    tooltipBadge = `<div style="font-size:9px;color:#059669;font-weight:700">🛡️ ZONA KONSERVASI: Wajib Dipertahankan</div>`;
                } else {
                    const lowerName = (p.name + ' ' + (p.category_name || '')).toLowerCase();
                    if (/gedung|bangunan|aula|lab|hall|kantor/i.test(lowerName)) {
                        tooltipBadge = `<div style="font-size:9px;color:#0284c7;font-weight:700">🌿 POTENSI: Roof Garden & Dinding Hijau</div>`;
                    } else if (/parkir|plaza|paving|lapangan/i.test(lowerName)) {
                        tooltipBadge = `<div style="font-size:9px;color:#d97706;font-weight:700">🌳 POTENSI: Pohon Peneduh & Planter Box</div>`;
                    } else {
                        tooltipBadge = `<div style="font-size:9px;color:#64748b;font-weight:600">🏢 Zona Fasilitas Terbangun</div>`;
                    }
                }
            } else {
                tooltipBadge = `<div style="font-size:9px;color:#10b981;font-weight:600">${p.green_status || ''}${isChild ? ' (Objek Bagian)' : ''}</div>`;
            }

            const feedbackBadge = reportCount > 0
                ? `<div style="font-size:9px;color:#b45309;background:#fef3c7;border:1px solid #fde68a;font-weight:700;margin-top:3px;padding:1px 6px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">💬 ${reportCount} Laporan Civitas</div>`
                : '';

            // Bind tooltip for quick hover info
            layerItem.bindTooltip(
                `<div style="font-size:11px;font-weight:700;line-height:1.3">${p.name}</div>` +
                `<div style="font-size:10px;opacity:0.8">${p.category_name || ''} · ${formatArea(p.area_size)}</div>` +
                tooltipBadge + feedbackBadge,
                { sticky: true, className: 'leaflet-tooltip-custom' }
            );

            layerItem.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                onPolygonClick?.(feature.properties);
            });

            layerItem.on('mouseover', function (e) {
                L.DomEvent.stopPropagation(e);
                this.setStyle({
                    weight: isChild ? 4.5 : 3.5,
                    opacity: 1,
                    fillOpacity: isChild ? 0.95 : 0.85,
                });
                if (isChild) {
                    this.bringToFront();
                }
            });

            layerItem.on('mouseout', function () {
                this.setStyle(getLayerStyle(feature, mapMode, simulatedLayerIds));
            });
        },
    }).addTo(map);
}

export default function LeafletMap({
    center = [-7.8332, 110.3831],
    zoom = 16,
    campusBoundaries,
    selectedCampusBoundary,
    landUsesGeoJson,
    feedbackGeoJson = null,
    approvedSpatialPlansGeoJson = null,
    showSpatialPlans = true,
    onSpatialPlanClick = null,
    selectedFeature = null,
    selectedFeedback = null,
    onFeedbackClick = null,
    mapMode = 'standard', // 'standard' | 'spatial_analysis'
    simulatedLayerIds = [],
    filters = {},
    onPolygonClick,
    height = '100%',
}) {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const tileLayerRef = useRef(null);
    const layersRef = useRef({ campus: null, parents: null, children: null, feedback: null, highlight: null, spatialPlans: null });
    const [mapReady, setMapReady] = useState(false);
    const [showFeedback, setShowFeedback] = useState(true);
    const [internalSelectedFeedback, setInternalSelectedFeedback] = useState(null);
    const { isDark } = useTheme();

    const activeFeedback = selectedFeedback !== null && selectedFeedback !== undefined ? selectedFeedback : internalSelectedFeedback;
    const feedbackDensity = feedbackGeoJson?.density_by_land_use || {};
    const feedbackFeatures = feedbackGeoJson?.features || [];

    // Clear feedback popup when polygon feature detail is opened
    useEffect(() => {
        if (selectedFeature) {
            setInternalSelectedFeedback(null);
        }
    }, [selectedFeature]);

    // 1. Initialize Leaflet map with custom DOM panes for strict Z-index hierarchy
    useEffect(() => {
        if (!containerRef.current) return;
        if (mapRef.current) return;

        const map = L.map(containerRef.current, {
            center,
            zoom,
            zoomControl: false,
        });

        // ── Create Custom Dedicated Panes ─────────────────────────────────
        // 1. Campus boundary pane (bottom of overlays)
        const campusPane = map.createPane('campusBoundaryPane');
        campusPane.style.zIndex = '350';

        // 2. Parent / General land use polygons pane
        const parentPane = map.createPane('parentPolygonPane');
        parentPane.style.zIndex = '450';

        // 3. Child land use polygons pane (ALWAYS on top of parent polygons)
        const childPane = map.createPane('childPolygonPane');
        childPane.style.zIndex = '550';

        // 4. Approved spatial planning overlay pane
        const spatialPlansPane = map.createPane('spatialPlansPane');
        spatialPlansPane.style.zIndex = '580';

        // 5. Highlight polygon pane (topmost overlay for selected layers)
        const highlightPane = map.createPane('highlightPolygonPane');
        highlightPane.style.zIndex = '650';

        // 6. Feedback marker pane (topmost interactive pins)
        const feedbackPane = map.createPane('feedbackMarkerPane');
        feedbackPane.style.zIndex = '700';

        // Initial Tile Layer
        const tileLayer = L.tileLayer(TILE_CONFIG.url, {
            attribution: TILE_CONFIG.attribution,
            maxZoom: TILE_CONFIG.maxZoom,
            maxNativeZoom: TILE_CONFIG.maxNativeZoom,
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Zoom control bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Scale control bottom-left
        L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

        // Clicking map background dismisses active feedback popup
        map.on('click', () => {
            setInternalSelectedFeedback(null);
        });

        mapRef.current = map;
        setMapReady(true);

        const timer = setTimeout(() => map.invalidateSize(), 200);

        return () => {
            clearTimeout(timer);
            map.remove();
            mapRef.current = null;
            setMapReady(false);
        };
    }, []);

    // 3. Campus boundary layer (Rendered in campusBoundaryPane)
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        if (layersRef.current.campus) {
            map.removeLayer(layersRef.current.campus);
            layersRef.current.campus = null;
        }

        const boundariesToRender = campusBoundaries || selectedCampusBoundary;

        if (boundariesToRender && boundariesToRender.features && boundariesToRender.features.length > 0) {
            const layer = L.geoJSON(boundariesToRender, {
                pane: 'campusBoundaryPane',
                style: {
                    color: isDark ? '#60a5fa' : '#1d4ed8',
                    weight: 3,
                    opacity: 0.9,
                    dashArray: '8, 6',
                    fillColor: '#3b82f6',
                    fillOpacity: isDark ? 0.08 : 0.05,
                },
            }).addTo(map);

            layersRef.current.campus = layer;
        }
    }, [mapReady, campusBoundaries, selectedCampusBoundary, isDark]);

    // 4. Zoom automatically to selected campus boundary whenever it changes
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        // If a specific feature is selected (e.g. from feedback link or click), let feature highlight zoom handle it!
        if (selectedFeature?.id) return;

        const targetBoundary = selectedCampusBoundary || campusBoundaries;
        if (targetBoundary && targetBoundary.features && targetBoundary.features.length > 0) {
            try {
                const tmpLayer = L.geoJSON(targetBoundary);
                const bounds = tmpLayer.getBounds();
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
                }
            } catch (err) {
                console.warn('Could not fly to campus bounds:', err);
            }
        }
    }, [mapReady, selectedCampusBoundary, campusBoundaries, selectedFeature]);

    // 5. Land use polygon layers — Parent Layers (parentPolygonPane) vs Child Layers (childPolygonPane)
    useEffect(() => {
        if (!mapReady || !mapRef.current || !landUsesGeoJson) return;
        const map = mapRef.current;

        // Remove old land use layers
        ['parents', 'children'].forEach(key => {
            if (layersRef.current[key]) {
                map.removeLayer(layersRef.current[key]);
                layersRef.current[key] = null;
            }
        });

        const { search = '', category_id, green_status } = filters;

        const allFeatures = (landUsesGeoJson.features || []).filter(f => {
            const p = f.properties || {};
            if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
            if (category_id && String(p.category_id) !== String(category_id)) return false;
            if (green_status && p.green_status !== green_status) return false;
            return true;
        });

        // 1. Separate Parent Features (no parent_id) and Child Features (has parent_id)
        const parentFeatures = allFeatures.filter(f => !f.properties?.parent_id);
        const childFeatures  = allFeatures.filter(f => Boolean(f.properties?.parent_id));

        // 2. Render Parent layers in parentPolygonPane (zIndex 450)
        if (parentFeatures.length > 0) {
            layersRef.current.parents = addLayerToMap(map, parentFeatures, onPolygonClick, false, mapMode, simulatedLayerIds, feedbackDensity);
        }

        // 3. Render Child layers in childPolygonPane (zIndex 550 - ALWAYS receives clicks & hovers first)
        if (childFeatures.length > 0) {
            layersRef.current.children = addLayerToMap(map, childFeatures, onPolygonClick, true, mapMode, simulatedLayerIds, feedbackDensity);
        }

        // Fit bounds to land uses if no campus boundary
        if (!selectedCampusBoundary && !layersRef.current.campus && allFeatures.length > 0) {
            const tmpLayer = L.geoJSON({ type: 'FeatureCollection', features: allFeatures });
            try {
                const bounds = tmpLayer.getBounds();
                if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
            } catch (err) { /* ignore */ }
        }
    }, [mapReady, landUsesGeoJson, filters, onPolygonClick, selectedCampusBoundary, mapMode, simulatedLayerIds, feedbackDensity]);

    // 6. User Feedback Markers Layer on Map (feedbackMarkerPane, zIndex 650)
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        if (layersRef.current.feedback) {
            map.removeLayer(layersRef.current.feedback);
            layersRef.current.feedback = null;
        }

        if (!showFeedback || feedbackFeatures.length === 0) return;

        const markersGroup = L.featureGroup();

        feedbackFeatures.forEach(feat => {
            const coords = feat.geometry?.coordinates;
            if (!coords || coords.length < 2) return;

            const [lng, lat] = coords;
            const p = feat.properties || {};

            let pinColor = '#f59e0b'; // Menunggu
            let statusLabel = 'Menunggu Review';
            if (p.status === 'Diproses' || p.status === 'Reviewed') {
                pinColor = '#0284c7';
                statusLabel = 'Sedang Diproses';
            }
            if (p.status === 'Selesai' || p.status === 'Resolved') {
                pinColor = '#10b981';
                statusLabel = 'Selesai Ditindaklanjuti';
            }

            const count = p.count || 1;
            const hasMultiple = count > 1;

            const customIcon = L.divIcon({
                className: 'custom-feedback-pin-wrap',
                html: `
                    <div style="position:relative; width:34px; height:42px; cursor:pointer; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.35)); transition:transform 0.15s ease;" class="hover:scale-110">
                        <svg viewBox="0 0 32 40" width="34" height="42" style="display:block;">
                            <!-- Teardrop Pin Body -->
                            <path d="M16 0 C7.16 0 0 7.16 0 16 C0 26.5 16 40 16 40 C16 40 32 26.5 32 16 C32 7.16 24.84 0 16 0 Z" fill="${pinColor}" stroke="#ffffff" stroke-width="2.2"/>
                            <!-- White Inner Circle -->
                            <circle cx="16" cy="15" r="8.5" fill="#ffffff"/>
                            <!-- Chat Bubble Icon -->
                            <path d="M11.5 12 h9 a1 1 0 0 1 1 1 v4 a1 1 0 0 1 -1 1 h-5 l-2.5 2.5 v-2.5 h-1.5 a1 1 0 0 1 -1 -1 v-4 a1 1 0 0 1 1 -1 Z" fill="${pinColor}"/>
                        </svg>
                        ${hasMultiple ? `
                            <!-- Multiple reports counter badge -->
                            <div style="position:absolute; top:-5px; right:-6px; min-width:19px; height:19px; padding:0 4px; border-radius:999px; background:#e11d48; color:#ffffff; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 2px 4px rgba(0,0,0,0.35); line-height:1;">
                                ${count}
                            </div>
                        ` : `
                            <!-- Top status indicator dot -->
                            <div style="position:absolute; top:-2px; right:-2px; width:9px; height:9px; border-radius:50%; background:${pinColor}; border:1.5px solid #ffffff; box-shadow:0 0 6px ${pinColor};"></div>
                        `}
                    </div>
                `,
                iconSize: [34, 42],
                iconAnchor: [17, 42],
                popupAnchor: [0, -42],
            });

            const marker = L.marker([lat, lng], {
                icon: customIcon,
                pane: 'feedbackMarkerPane',
                title: `${p.title} (${count} Laporan)`,
            });

            // Modern subtle tooltip on hover
            marker.bindTooltip(`
                <div style="font-family:system-ui,-apple-system,sans-serif; font-size:11px; line-height:1.3; max-width:220px;">
                    <div style="font-weight:700; color:#0f172a; margin-bottom:2px;">${p.title}</div>
                    <div style="font-size:10px; color:${pinColor}; font-weight:700;">● ${hasMultiple ? `${count} Laporan Civitas` : statusLabel}</div>
                    <div style="font-size:9px; color:#64748b; margin-top:2px;">📍 ${p.land_use_name} · Klik untuk ${hasMultiple ? 'melihat semua' : 'detail'}</div>
                </div>
            `, {
                direction: 'top',
                offset: [0, -42],
                className: 'leaflet-tooltip-feedback',
                opacity: 0.95,
            });

            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                setInternalSelectedFeedback(p);
                onFeedbackClick?.(p);
                map.flyTo([lat, lng], Math.max(map.getZoom(), 18), { duration: 0.7 });
            });

            markersGroup.addLayer(marker);
        });

        markersGroup.addTo(map);
        layersRef.current.feedback = markersGroup;
    }, [mapReady, feedbackFeatures, showFeedback, onFeedbackClick]);

    // 7. Approved Spatial Planning Layer Overlay (spatialPlansPane, zIndex 580)
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        if (layersRef.current.spatialPlans) {
            map.removeLayer(layersRef.current.spatialPlans);
            layersRef.current.spatialPlans = null;
        }

        if (!showSpatialPlans || !approvedSpatialPlansGeoJson?.features?.length) return;

        const planLayer = L.geoJSON(approvedSpatialPlansGeoJson, {
            pane: 'spatialPlansPane',
            style: () => ({
                color: '#0284c7', // Sky Blue
                weight: 3.5,
                opacity: 0.95,
                fillColor: '#38bdf8',
                fillOpacity: 0.4,
                dashArray: '6, 6',
            }),
            onEachFeature: (feature, layer) => {
                const p = feature.properties || {};
                layer.bindTooltip(
                    `<div style="font-size:10px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;">🌟 Rencana Masa Depan (ACC)</div>` +
                    `<div style="font-size:12px;font-weight:700;line-height:1.3;margin-top:2px">${p.title}</div>` +
                    `<div style="font-size:10px;opacity:0.8">${p.campus_name || ''} · ${formatArea(p.area_size)} (Target: ${p.target_year || '-'})</div>`,
                    { sticky: true, className: 'leaflet-tooltip-custom' }
                );

                layer.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    onSpatialPlanClick?.(p);
                });

                layer.on('mouseover', function (e) {
                    L.DomEvent.stopPropagation(e);
                    this.setStyle({
                        weight: 4.5,
                        fillOpacity: 0.65,
                    });
                });

                layer.on('mouseout', function () {
                    this.setStyle({
                        weight: 3.5,
                        fillOpacity: 0.4,
                    });
                });
            },
        }).addTo(map);

        layersRef.current.spatialPlans = planLayer;
    }, [mapReady, approvedSpatialPlansGeoJson, showSpatialPlans, onSpatialPlanClick]);

    // 8. Highlight & Fly to selected polygon when user clicks on a layer in sidebar, popup or search
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        // Remove previous highlight layer
        if (layersRef.current.highlight) {
            map.removeLayer(layersRef.current.highlight);
            layersRef.current.highlight = null;
        }

        if (!selectedFeature?.id) return;

        let feat = landUsesGeoJson?.features?.find(
            f => String(f.properties?.id) === String(selectedFeature.id)
        );

        if (!feat && approvedSpatialPlansGeoJson?.features) {
            feat = approvedSpatialPlansGeoJson.features.find(
                f => String(f.properties?.id) === String(selectedFeature.id) ||
                     String(f.properties?.plan_id) === String(selectedFeature.plan_id || selectedFeature.id) ||
                     String(f.id) === String(selectedFeature.id)
            );
        }

        if (feat && feat.geometry) {
            try {
                const highlightLayer = L.geoJSON(feat, {
                    pane: 'highlightPolygonPane',
                    style: {
                        color: '#f59e0b', // Glowing Amber
                        weight: 4.5,
                        opacity: 1,
                        dashArray: '8, 6',
                        className: 'highlight-polygon-outline',
                        fillColor: '#f59e0b',
                        fillOpacity: 0.25,
                    },
                }).addTo(map);

                layersRef.current.highlight = highlightLayer;

                const bounds = highlightLayer.getBounds();
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 19, duration: 1.0 });
                }
            } catch (e) {
                console.warn('Could not highlight feature:', e);
            }
        }
    }, [mapReady, selectedFeature, landUsesGeoJson, approvedSpatialPlansGeoJson]);

    return (
        <div className="relative w-full h-full min-h-[350px]">
            {/* Feedback Toggle Overlay Button on Map — Positioned at bottom-right to never overlap with campus filter */}
            {feedbackFeatures.length > 0 && (
                <div className="absolute bottom-6 right-4 z-[950] pointer-events-auto">
                    <button
                        type="button"
                        onClick={() => setShowFeedback(v => !v)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold shadow-lg border transition-all flex items-center gap-2 backdrop-blur-md ${
                            showFeedback
                                ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20 hover:bg-amber-600'
                                : 'bg-white/95 dark:bg-slate-900/95 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-800 hover:bg-amber-50/80 dark:hover:bg-slate-800'
                        }`}
                        title="Tampilkan / Sembunyikan Titik Laporan Civitas pada Peta"
                    >
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                            showFeedback ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}>
                            💬
                        </span>
                        <div className="text-left">
                            <span className="block leading-tight text-[11px]">Laporan Civitas</span>
                            <span className="text-[10px] opacity-80 font-normal">{feedbackFeatures.length} Titik Laporan</span>
                        </div>
                        <span className={`w-2.5 h-2.5 rounded-full ml-1 ${showFeedback ? 'bg-emerald-300 animate-pulse' : 'bg-gray-300 dark:bg-slate-600'}`} />
                    </button>
                </div>
            )}

            {/* Floating Feedback Popup (styled identically to MapPopup detail lahan) */}
            <FeedbackPopup
                feedback={activeFeedback}
                onClose={() => {
                    setInternalSelectedFeedback(null);
                    onFeedbackClick?.(null);
                }}
                onSelectLandUse={(landUseId) => {
                    const feat = (landUsesGeoJson?.features || []).find(
                        f => String(f.properties?.id) === String(landUseId)
                    );
                    if (feat?.properties) {
                        setInternalSelectedFeedback(null);
                        onFeedbackClick?.(null);
                        onPolygonClick?.(feat.properties);
                    }
                }}
            />

            <div
                ref={containerRef}
                style={{ height: '100%', width: '100%', minHeight: '350px' }}
                className="rounded-xl overflow-hidden z-0"
            />
        </div>
    );
}
