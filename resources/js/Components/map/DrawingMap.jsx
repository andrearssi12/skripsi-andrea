import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { formatArea } from '@/lib/utils';
import { Layers, Trash2, Edit3, Square, Check, AlertCircle, Info } from 'lucide-react';

// Fix leaflet default marker icons in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Helper to convert any GeoJSON Polygon/MultiPolygon to clean 1D [lat, lng] array
function extractPolygonLatLngs(geom) {
    if (!geom) return null;
    if (typeof geom === 'string') {
        try {
            geom = JSON.parse(geom);
        } catch {
            return null;
        }
    }
    if (!geom.coordinates) return null;

    let ring = [];
    if (geom.type === 'Polygon') {
        ring = geom.coordinates[0];
    } else if (geom.type === 'MultiPolygon') {
        ring = geom.coordinates[0]?.[0];
    }

    if (!Array.isArray(ring) || ring.length < 3) return null;

    const clean = [...ring];
    if (clean.length > 3) {
        const first = clean[0];
        const last = clean[clean.length - 1];
        if (first && last && first[0] === last[0] && first[1] === last[1]) {
            clean.pop();
        }
    }

    // GeoJSON is [lng, lat], Leaflet is [lat, lng]
    return clean.map(pt => [Number(pt[1]), Number(pt[0])]);
}

// Calculate approximate area in m2 (Spherical formula)
function computeSphericalArea(geometry) {
    if (!geometry || !geometry.coordinates) return 0;
    const coords = geometry.type === 'Polygon' ? geometry.coordinates[0] : (geometry.coordinates[0]?.[0] || []);
    if (!coords || coords.length < 3) return 0;

    const radius = 6378137; // WGS84
    let area = 0;
    const len = coords.length;

    for (let i = 0; i < len - 1; i++) {
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const lon1 = (p1[0] * Math.PI) / 180;
        const lat1 = (p1[1] * Math.PI) / 180;
        const lon2 = (p2[0] * Math.PI) / 180;
        const lat2 = (p2[1] * Math.PI) / 180;
        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs((area * radius * radius) / 2.0);
    return Math.round(area * 100) / 100;
}

export default function DrawingMap({
    campus,
    landUses = [],
    initialGeometry = null,
    onGeometryChange,
    height = '520px',
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const drawControlRef = useRef(null);
    const landUseLayerRef = useRef(null);
    const boundaryLayerRef = useRef(null);

    // Ref to hold onGeometryChange without triggering map rebuilds
    const onGeometryChangeRef = useRef(onGeometryChange);
    useEffect(() => {
        onGeometryChangeRef.current = onGeometryChange;
    }, [onGeometryChange]);

    // Flag to prevent re-parsing initialGeometry when the change originated from internal draw/edit
    const isInternalChangeRef = useRef(false);

    const [currentArea, setCurrentArea] = useState(0);
    const [hasGeometry, setHasGeometry] = useState(false);
    const [drawInstruction, setDrawInstruction] = useState('Gunakan tombol gambar di pojok kiri atas untuk membuat polygon atau kotak.');

    // 1. Initialize Map ONCE on mount
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [-7.8332, 110.3831],
            zoom: 17,
            maxZoom: 22,
        });

        L.tileLayer(TILE_URL, {
            attribution: TILE_ATTR,
            maxZoom: 22,
            maxNativeZoom: 19,
        }).addTo(map);

        // FeatureGroup to store editable polygon layers
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;

        // Leaflet Draw Control
        const drawControl = new L.Control.Draw({
            position: 'topleft',
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    drawError: {
                        color: '#ef4444',
                        timeout: 1000,
                        message: '<strong>Peringatan:</strong> Batas polygon tidak boleh saling bertumpukan/menyilang!',
                    },
                    shapeOptions: {
                        color: '#059669',
                        weight: 3,
                        fillColor: '#10b981',
                        fillOpacity: 0.55,
                        dashArray: '4, 4',
                    },
                },
                rectangle: {
                    shapeOptions: {
                        color: '#0284c7',
                        weight: 3,
                        fillColor: '#38bdf8',
                        fillOpacity: 0.55,
                        dashArray: '4, 4',
                    },
                },
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
            },
            edit: {
                featureGroup: drawnItems,
                remove: true,
            },
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;

        // Handlers for Draw Events
        map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);

            const geojson = layer.toGeoJSON();
            const geometry = geojson.geometry;
            const area = computeSphericalArea(geometry);

            isInternalChangeRef.current = true;
            setCurrentArea(area);
            setHasGeometry(true);
            setDrawInstruction('Polygon berhasil digambar. Anda dapat mengedit titik-titiknya dengan tombol edit (ikon pensil).');
            onGeometryChangeRef.current?.(geometry, area);
        });

        map.on(L.Draw.Event.EDITED, (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                const geojson = layer.toGeoJSON();
                const geometry = geojson.geometry;
                const area = computeSphericalArea(geometry);

                isInternalChangeRef.current = true;
                setCurrentArea(area);
                setHasGeometry(true);
                setDrawInstruction('Batas polygon dan luasan berhasil disesuaikan.');
                onGeometryChangeRef.current?.(geometry, area);
            });
        });

        map.on(L.Draw.Event.DELETED, () => {
            isInternalChangeRef.current = true;
            setCurrentArea(0);
            setHasGeometry(false);
            setDrawInstruction('Polygon telah dihapus. Silakan gambar polygon baru jika diperlukan.');
            onGeometryChangeRef.current?.(null, 0);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // 2. Handle Campus Boundary & Land Uses Background Layers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove old boundary
        if (boundaryLayerRef.current) {
            map.removeLayer(boundaryLayerRef.current);
            boundaryLayerRef.current = null;
        }

        // Render Campus Boundary
        if (campus?.boundary_geometry) {
            try {
                const geom = typeof campus.boundary_geometry === 'string'
                    ? JSON.parse(campus.boundary_geometry)
                    : campus.boundary_geometry;

                const boundaryLayer = L.geoJSON(geom, {
                    style: {
                        color: '#6366f1',
                        weight: 2.5,
                        dashArray: '6, 6',
                        fillColor: '#818cf8',
                        fillOpacity: 0.05,
                    },
                }).addTo(map);

                boundaryLayerRef.current = boundaryLayer;

                // Only fit boundary if no polygon drawn yet
                if (!drawnItemsRef.current || drawnItemsRef.current.getLayers().length === 0) {
                    map.fitBounds(boundaryLayer.getBounds(), { padding: [30, 30] });
                }
            } catch (err) {
                console.error('Error rendering campus boundary:', err);
            }
        }

        // Remove old land uses
        if (landUseLayerRef.current) {
            map.removeLayer(landUseLayerRef.current);
            landUseLayerRef.current = null;
        }

        // Render reference land uses (semi-transparent backdrop)
        if (landUses && landUses.length > 0) {
            const features = landUses
                .filter((lu) => lu.geometry)
                .map((lu) => {
                    const g = typeof lu.geometry === 'string' ? JSON.parse(lu.geometry) : lu.geometry;
                    return {
                        type: 'Feature',
                        properties: {
                            name: lu.name,
                            category_color: lu.category?.color || '#94a3b8',
                            green_status: lu.green_status,
                            area_size: lu.area_size,
                        },
                        geometry: g,
                    };
                });

            if (features.length > 0) {
                const luLayer = L.geoJSON({ type: 'FeatureCollection', features }, {
                    style: (feat) => ({
                        color: feat.properties.category_color || '#94a3b8',
                        weight: 1.5,
                        fillColor: feat.properties.category_color || '#94a3b8',
                        fillOpacity: 0.15,
                    }),
                    onEachFeature: (feature, layer) => {
                        const p = feature.properties;
                        layer.bindTooltip(`<b>${p.name}</b><br><span style="font-size:10px">${p.green_status} · ${formatArea(p.area_size)}</span>`, {
                            sticky: true,
                            className: 'leaflet-tooltip-custom',
                        });
                    },
                }).addTo(map);

                luLayer.bringToBack();
                landUseLayerRef.current = luLayer;
            }
        }
    }, [campus, landUses]);

    // 3. Load initialGeometry or geometry selected from AI recommendation
    useEffect(() => {
        const map = mapRef.current;
        const drawnItems = drawnItemsRef.current;
        if (!map || !drawnItems) return;

        // If this update was triggered from user's own drawing/editing on the map, do not reset!
        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false;
            return;
        }

        if (initialGeometry) {
            try {
                const latlngs = extractPolygonLatLngs(initialGeometry);
                if (!latlngs || latlngs.length < 3) return;

                drawnItems.clearLayers();

                // Create a standard L.polygon which is 100% compatible with Leaflet Draw edit mode
                const poly = L.polygon(latlngs, {
                    color: '#059669',
                    weight: 3,
                    fillColor: '#10b981',
                    fillOpacity: 0.55,
                    dashArray: '4, 4',
                });

                drawnItems.addLayer(poly);

                const area = computeSphericalArea(poly.toGeoJSON().geometry);
                setCurrentArea(area);
                setHasGeometry(true);
                setDrawInstruction('Geometri dimuat ke peta. Klik tombol edit di toolbar (ikon pensil) untuk mengedit titik polygon.');

                const bounds = poly.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 19 });
                }
            } catch (err) {
                console.error('Error loading initialGeometry into DrawingMap:', err);
            }
        }
    }, [initialGeometry]);

    const handleClearDrawn = () => {
        if (drawnItemsRef.current) {
            drawnItemsRef.current.clearLayers();
            isInternalChangeRef.current = true;
            setCurrentArea(0);
            setHasGeometry(false);
            setDrawInstruction('Polygon telah dibersihkan. Anda dapat menggambar polygon baru.');
            onGeometryChangeRef.current?.(null, 0);
        }
    };

    return (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            {/* Top Toolbar / Info Banner */}
            <div className="p-3 bg-gray-50/90 dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-200">
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{drawInstruction}</span>
                </div>

                <div className="flex items-center gap-2">
                    {hasGeometry && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                            <span>Luas Tergambar:</span>
                            <span>{formatArea(currentArea)}</span>
                        </div>
                    )}

                    {hasGeometry && (
                        <button
                            type="button"
                            onClick={handleClearDrawn}
                            className="btn btn-ghost btn-sm px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-1"
                            title="Hapus gambar polygon saat ini"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reset Gambar</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div
                ref={containerRef}
                style={{ height }}
                className="w-full z-0 relative"
            />

            {/* Floating Helper Legend */}
            <div className="absolute bottom-3 right-3 z-[1000] p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-gray-200 dark:border-slate-800 shadow-md text-[11px] space-y-1.5 pointer-events-none">
                <div className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Petunjuk Editor</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                    <span className="w-3 h-3 rounded bg-emerald-500/50 border border-emerald-600 border-dashed" />
                    <span>Polygon Rencana (Bisa diedit)</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                    <span className="w-3 h-0.5 border-t-2 border-indigo-500 border-dashed" />
                    <span>Batas Kampus</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                    <span className="w-3 h-3 rounded bg-gray-400/20 border border-gray-400" />
                    <span>Lahan / Bangunan Eksisting</span>
                </div>
            </div>
        </div>
    );
}
