import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import * as turf from '@turf/turf';
import { formatArea } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { readGeoJsonFile, extractGeoJsonDetails } from '@/lib/geojsonParser';
import {
    AlertTriangle, Trash2, Edit3, Layers, Eye, EyeOff,
    MapPin, Upload, FileUp, Sparkles, Check
} from 'lucide-react';

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

function parseGeom(value) {
    if (!value) return null;
    try {
        const g = typeof value === 'string' ? JSON.parse(value) : value;
        if (!g) return null;
        if (g.coordinates) return g;
        if (g.geometry?.coordinates) return g.geometry;
        if (g.type === 'FeatureCollection' && Array.isArray(g.features)) {
            const f = g.features.find(item => item?.geometry?.coordinates);
            if (f) return f.geometry;
        }
        return null;
    } catch {
        return null;
    }
}

function getRefStyle(feature) {
    const s = feature?.properties?.green_status;
    const c = feature?.properties?.category_color;
    const isChild = Boolean(feature?.properties?.parent_id);
    const isGreen = s === 'Green Area';
    const isVeg = s === 'Vegetasi Non-RTH';
    const color = c || (isGreen ? '#059669' : isVeg ? '#65a30d' : '#64748b');

    return {
        color: isChild ? '#064e3b' : color,
        weight: isChild ? 2.5 : 1.5,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: isChild ? 0.6 : 0.35,
        dashArray: isChild ? '2, 2' : '4, 4',
    };
}

export default function LeafletDrawMap({
    campusBoundary = null,
    initialGeometry = null,
    categoryColor = '#10b981',
    onGeometryChange,
    onPropertiesExtracted,
    height = '420px',
    isBoundaryMode = false,
    existingLandUsesGeoJson = null,
    otherCampusesGeoJson = null,
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const tileLayerRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const boundaryLyrRef = useRef(null);
    const otherCampusesLyrRef = useRef(null);
    const refLyrRef = useRef(null);
    const quickFileInputRef = useRef(null);

    const [mapReady, setMapReady] = useState(false);
    const [spatialError, setSpatialError] = useState(null);
    const [calcArea, setCalcArea] = useState(0);
    const [refVisible, setRefVisible] = useState(true);
    const [uploadSuccessNote, setUploadSuccessNote] = useState(null);
    const { isDark } = useTheme();

    // Keep active campusBoundary in a ref so Leaflet event listeners always read the latest boundary
    const activeBoundaryRef = useRef(campusBoundary);
    useEffect(() => {
        activeBoundaryRef.current = campusBoundary;
    }, [campusBoundary]);

    const validateAndEmit = useCallback((geoJsonFeature) => {
        setSpatialError(null);
        if (!geoJsonFeature?.geometry) {
            onGeometryChange?.(null, 0);
            return;
        }

        const geometry = geoJsonFeature.geometry;

        if (isBoundaryMode) {
            try {
                const area = Math.round(turf.area(geoJsonFeature) * 100) / 100;
                setCalcArea(area);
                onGeometryChange?.(geometry, area, true);
            } catch (e) {
                console.error('Area calc error:', e);
            }
            return;
        }

        // Always read latest active boundary
        const currentBoundary = activeBoundaryRef.current || campusBoundary;
        const boundaryGeom = parseGeom(currentBoundary);

        if (boundaryGeom) {
            try {
                const bPoly = turf.feature(boundaryGeom);
                const coords = geometry.type === 'Polygon'
                    ? geometry.coordinates[0]
                    : geometry.coordinates[0][0];

                let allInside = true;
                for (const coord of coords) {
                    const pt = turf.point(coord);
                    const isInside = turf.booleanPointInPolygon(pt, bPoly, { ignoreBoundary: false });
                    if (!isInside) {
                        allInside = false;
                        break;
                    }
                }

                if (!allInside) {
                    setSpatialError('Peringatan: Poligon berada di luar batas wilayah kampus yang dipilih! Pastikan objek berada di dalam garis biru putus-putus.');
                    const area = Math.round(turf.area(geoJsonFeature) * 100) / 100;
                    setCalcArea(area);
                    onGeometryChange?.(geometry, area, false);
                    return;
                }
            } catch (err) {
                console.warn('Boundary containment check error:', err);
            }
        }

        try {
            const area = Math.round(turf.area(geoJsonFeature) * 100) / 100;
            setCalcArea(area);
            onGeometryChange?.(geometry, area, true);
        } catch (e) {
            console.error('Area calc error:', e);
        }
    }, [campusBoundary, isBoundaryMode, onGeometryChange]);

    // Keep validateAndEmit in a ref so Leaflet event listeners never have stale closures
    const validateAndEmitRef = useRef(validateAndEmit);
    useEffect(() => {
        validateAndEmitRef.current = validateAndEmit;
    }, [validateAndEmit]);

function extractRingsForLeaflet(geom) {
    if (!geom || !geom.coordinates) return [];

    let rawRings = [];
    if (geom.type === 'Polygon') {
        if (Array.isArray(geom.coordinates[0])) {
            rawRings = [geom.coordinates[0]];
        }
    } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) {
            if (Array.isArray(poly) && Array.isArray(poly[0])) {
                rawRings.push(poly[0]);
            }
        }
    }

    if (rawRings.length === 0) return [];

    return rawRings.map(ring => {
        if (!Array.isArray(ring) || ring.length < 3) return null;
        const clean = [...ring];
        // Strip closing coordinate duplicate so Leaflet Draw edit handles don't collide
        if (clean.length > 3) {
            const first = clean[0];
            const last = clean[clean.length - 1];
            if (first && last && first[0] === last[0] && first[1] === last[1]) {
                clean.pop();
            }
        }
        return clean.map(pt => L.latLng(Number(pt[1]), Number(pt[0])));
    }).filter(Boolean);
}

    // Function to render a geometry into the Leaflet Draw layer and fit bounds
    const loadGeometryIntoMap = useCallback((geom, fit = true, emitToParent = false) => {
        if (!mapRef.current || !drawnItemsRef.current) return;
        const drawnItems = drawnItemsRef.current;
        const map = mapRef.current;

        const parsed = parseGeom(geom);
        if (!parsed) return;

        drawnItems.clearLayers();
        // Clear previous segment labels
        map._clearSegMarkers?.();

        try {
            const rings = extractRingsForLeaflet(parsed);
            if (rings.length === 0) return;

            rings.forEach(ringLatLngs => {
                const polygonLayer = L.polygon(ringLatLngs, {
                    color: isBoundaryMode ? '#1d4ed8' : categoryColor,
                    fillColor: isBoundaryMode ? '#1d4ed8' : categoryColor,
                    fillOpacity: 0.5,
                    weight: 3,
                });
                drawnItems.addLayer(polygonLayer);
            });

            // Draw segment length labels safely
            try {
                const firstLayer = drawnItems.getLayers()[0];
                const ll = firstLayer?.getLatLngs?.();
                if (ll) {
                    map._drawSegLabels?.(ll);
                }
            } catch (_) {}

            // Compute area & validate containment
            const feat = { type: 'Feature', geometry: parsed, properties: {} };
            if (emitToParent) {
                validateAndEmitRef.current?.(feat);
            } else {
                try {
                    const area = Math.round(turf.area(feat) * 100) / 100;
                    setCalcArea(area);
                } catch (_) {}
            }

            if (fit) {
                const bounds = drawnItems.getBounds();
                if (bounds && bounds.isValid && bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 });
                }
            }
        } catch (err) {
            console.error('Gagal merender geometri ke peta:', err);
        }
    }, [categoryColor, isBoundaryMode]);

    // 1. Initialize Map and Leaflet.Draw Control
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [-7.8332, 110.3831],
            zoom: 16,
            zoomControl: true,
        });

        const tileLayer = L.tileLayer(TILE_CONFIG.url, {
            attribution: TILE_CONFIG.attribution,
            maxZoom: TILE_CONFIG.maxZoom,
            maxNativeZoom: TILE_CONFIG.maxNativeZoom,
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;

        const shapeOptions = {
            color: isBoundaryMode ? '#1d4ed8' : categoryColor,
            fillColor: isBoundaryMode ? '#1d4ed8' : categoryColor,
            fillOpacity: 0.5,
            weight: 3,
        };

        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    showLength: true,
                    shapeOptions,
                    // Tidak ada batasan jumlah titik — pengguna klik ganda / tekan ESC untuk selesai
                },
                rectangle: { shapeOptions },
                polyline: false,
                circle: false,
                circlemarker: false,
                marker: false,
            },
            edit: { featureGroup: drawnItems, remove: true },
        });
        map.addControl(drawControl);

        function fmtLen(m) {
            if (m >= 1000) return (m / 1000).toFixed(2) + ' km';
            return Math.round(m) + ' m';
        }

        // Ref to hold segment-length markers so they can be cleared
        const segMarkersRef = { current: [] };

        function clearSegMarkers() {
            segMarkersRef.current.forEach(mk => map.removeLayer(mk));
            segMarkersRef.current = [];
        }

        function getFirstRing(arr) {
            if (!arr || !Array.isArray(arr) || arr.length === 0) return [];
            let curr = arr;
            while (Array.isArray(curr[0])) {
                curr = curr[0];
            }
            return curr;
        }

        // ── Helper: render label panjang segmen di tengah setiap sisi ────
        function drawSegLabels(latlngs) {
            clearSegMarkers();
            if (!latlngs) return;
            const pts = getFirstRing(latlngs);
            if (!pts || pts.length < 2) return;
            const closedPts = [...pts];
            const first = closedPts[0];
            const last = closedPts[closedPts.length - 1];
            if (first && last && (first.lat !== last.lat || first.lng !== last.lng)) {
                closedPts.push(first);
            }
            for (let i = 0; i < closedPts.length - 1; i++) {
                const a = closedPts[i];
                const b = closedPts[i + 1];
                if (!a || !b || typeof a.lat !== 'number' || typeof b.lat !== 'number') continue;
                try {
                    const mid = L.latLng(
                        (a.lat + b.lat) / 2,
                        (a.lng + b.lng) / 2
                    );
                    const dist = map.distance(a, b);
                    const mk = L.marker(mid, {
                        icon: L.divIcon({
                            className: 'segment-length-badge',
                            html: `<span>${fmtLen(dist)}</span>`,
                            iconAnchor: [0, 0],
                        }),
                        interactive: false,
                        zIndexOffset: 1000,
                    }).addTo(map);
                    segMarkersRef.current.push(mk);
                } catch (_) {}
            }
        }

        // ── Live segment labels SAAT MENGGAMBAR ──────────────────────────
        // draw:drawvertex memberikan e.layers berisi Marker-marker vertex yang sudah diklik
        // Ekstrak latlng dari setiap marker → tampilkan label antar titik
        map.on('draw:drawvertex', (e) => {
            try {
                const vertexMarkers = e.layers?.getLayers?.() ?? [];
                if (vertexMarkers.length < 2) return;
                // Setiap layer di sini adalah L.Marker — ambil getLatLng() bukan getLatLngs()
                const latlngs = vertexMarkers.map(m => m.getLatLng());
                drawSegLabels(latlngs);
            } catch (_) {}
        });

        // ── Live label segmen terakhir saat kursor bergerak (during draw) ─
        // Tambahkan satu label floating dari titik terakhir ke posisi mouse
        const lastSegMk = { current: null };

        map.on('mousemove', (e) => {
            // Hanya aktif saat sedang menggambar — cek apakah ada vertex markers
            if (segMarkersRef.current.length === 0) {
                if (lastSegMk.current) {
                    map.removeLayer(lastSegMk.current);
                    lastSegMk.current = null;
                }
                return;
            }
            try {
                // Titik terakhir yang diklik = ambil dari segmen label terakhir
                // Gunakan cara aman: akses draw handler internal
                const handler = drawControl._toolbars?.draw?._activeMode?.handler;
                if (!handler || !handler._poly) {
                    if (lastSegMk.current) {
                        map.removeLayer(lastSegMk.current);
                        lastSegMk.current = null;
                    }
                    return;
                }
                const polyLatLngs = handler._poly.getLatLngs();
                if (!polyLatLngs || polyLatLngs.length === 0) return;

                const lastPt = polyLatLngs[polyLatLngs.length - 1];
                const dist = map.distance(lastPt, e.latlng);
                const mid = L.latLng(
                    (lastPt.lat + e.latlng.lat) / 2,
                    (lastPt.lng + e.latlng.lng) / 2
                );

                if (lastSegMk.current) map.removeLayer(lastSegMk.current);
                lastSegMk.current = L.marker(mid, {
                    icon: L.divIcon({
                        className: 'segment-length-badge',
                        html: `<span style="opacity:0.7;font-style:italic">${fmtLen(dist)}</span>`,
                        iconAnchor: [0, 0],
                    }),
                    interactive: false,
                    zIndexOffset: 900,
                }).addTo(map);
            } catch (_) {}
        });

        // Bersihkan floating label saat gambar selesai / dibatalkan
        map.on('draw:drawstop draw:drawstart', () => {
            if (lastSegMk.current) {
                map.removeLayer(lastSegMk.current);
                lastSegMk.current = null;
            }
        });

        // ── Live label saat EDIT vertex di-drag ──────────────────────────
        // draw:editvertex fires setiap kali vertex di-drag selama mode edit
        map.on('draw:editvertex', () => {
            try {
                const editedLayers = drawnItems.getLayers();
                if (editedLayers.length === 0) return;
                const ll = editedLayers[0].getLatLngs?.();
                if (ll) drawSegLabels(ll);
            } catch (_) {}
        });

        // Always invoke the latest validateAndEmit via ref
        map.on(L.Draw.Event.CREATED, (e) => {
            drawnItems.clearLayers();
            drawnItems.addLayer(e.layer);
            setUploadSuccessNote(null);
            validateAndEmitRef.current?.(e.layer.toGeoJSON());

            // Draw segment length labels on finished polygon
            try {
                const latlngs = e.layer.getLatLngs?.();
                if (latlngs) drawSegLabels(latlngs);
            } catch (_) {}
        });

        map.on(L.Draw.Event.EDITED, () => {
            clearSegMarkers();
            const layers = drawnItems.getLayers();
            if (layers.length > 0) {
                setUploadSuccessNote(null);
                let outGeom;
                if (layers.length === 1) {
                    outGeom = layers[0].toGeoJSON().geometry;
                } else {
                    outGeom = {
                        type: 'MultiPolygon',
                        coordinates: layers.map(l => l.toGeoJSON().geometry.coordinates),
                    };
                }
                validateAndEmitRef.current?.({
                    type: 'Feature',
                    geometry: outGeom,
                    properties: {},
                });
                // Re-draw segment labels
                try {
                    const latlngs = layers[0].getLatLngs?.();
                    if (latlngs) drawSegLabels(latlngs);
                } catch (_) {}
            }
        });

        map.on(L.Draw.Event.DELETED, () => {
            clearSegMarkers();
            setCalcArea(0);
            setSpatialError(null);
            setUploadSuccessNote(null);
            onGeometryChange?.(null, 0);
        });

        // Store helpers so loadGeometryIntoMap can also refresh labels
        map._clearSegMarkers = clearSegMarkers;
        map._drawSegLabels = drawSegLabels;

        mapRef.current = map;
        setMapReady(true);

        const t = setTimeout(() => map.invalidateSize(), 250);
        return () => {
            clearTimeout(t);
            map.remove();
            mapRef.current = null;
            setMapReady(false);
        };
    }, []);

    // 3. Render Other Campuses Boundaries (Context Layer)
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        if (otherCampusesLyrRef.current) {
            map.removeLayer(otherCampusesLyrRef.current);
            otherCampusesLyrRef.current = null;
        }

        if (otherCampusesGeoJson && otherCampusesGeoJson.features && otherCampusesGeoJson.features.length > 0) {
            const layer = L.geoJSON(otherCampusesGeoJson, {
                style: {
                    color: isDark ? '#64748b' : '#94a3b8',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '6, 6',
                    fillColor: '#94a3b8',
                    fillOpacity: 0.03,
                },
                onEachFeature: (feature, l) => {
                    const p = feature.properties || {};
                    l.bindTooltip(
                        `<div style="font-size:11px;font-weight:bold">${p.name || 'Kampus UAD'}</div>`,
                        { sticky: true }
                    );
                },
            }).addTo(map);

            layer.bringToBack();
            otherCampusesLyrRef.current = layer;
        }
    }, [mapReady, otherCampusesGeoJson, isDark]);

    // 4. Render Active Campus Boundary & Auto-Zoom to It
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        if (boundaryLyrRef.current) {
            map.removeLayer(boundaryLyrRef.current);
            boundaryLyrRef.current = null;
        }

        const geom = parseGeom(campusBoundary);
        if (geom) {
            const lyr = L.geoJSON({ type: 'Feature', geometry: geom }, {
                style: {
                    color: isDark ? '#60a5fa' : '#1d4ed8',
                    weight: 3,
                    opacity: 0.9,
                    dashArray: '8, 6',
                    fillColor: '#3b82f6',
                    fillOpacity: isDark ? 0.08 : 0.05,
                },
            }).addTo(map);

            boundaryLyrRef.current = lyr;

            // When campus boundary changes, fly to the new campus boundary if no active polygon
            const initGeom = parseGeom(initialGeometry);
            if (!initGeom && (!drawnItemsRef.current || drawnItemsRef.current.getLayers().length === 0)) {
                try {
                    const b = lyr.getBounds();
                    if (b.isValid()) {
                        map.flyToBounds(b, { padding: [40, 40], duration: 1.0 });
                    }
                } catch (e) {}
            }
        }
    }, [mapReady, campusBoundary, isDark]);

    // 5. Render Reference Land Uses with Child Priority
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        if (refLyrRef.current) {
            map.removeLayer(refLyrRef.current);
            refLyrRef.current = null;
        }

        const fc = existingLandUsesGeoJson;
        if (!fc || !fc.features || fc.features.length === 0) return;

        const cleanFeatures = fc.features
            .map(f => {
                const geom = parseGeom(f.geometry ?? f.properties?.geometry);
                if (!geom) return null;
                return { type: 'Feature', properties: f.properties || {}, geometry: geom };
            })
            .filter(Boolean)
            .sort((a, b) => {
                const aChild = Boolean(a.properties?.parent_id);
                const bChild = Boolean(b.properties?.parent_id);
                if (aChild !== bChild) {
                    return aChild ? 1 : -1;
                }
                return (b.properties?.area_size || 0) - (a.properties?.area_size || 0);
            });

        if (!cleanFeatures.length) return;

        const lyr = L.geoJSON(
            { type: 'FeatureCollection', features: cleanFeatures },
            {
                style: getRefStyle,
                onEachFeature: (feature, l) => {
                    const p = feature.properties || {};
                    const isChild = Boolean(p.parent_id);

                    l.bindTooltip(
                        `<div style="font-size:11px;font-weight:700;line-height:1.3">${p.name}</div>` +
                        `<div style="font-size:10px;opacity:0.8">${p.category_name || ''} · ${formatArea(p.area_size)}</div>` +
                        `<div style="font-size:9px;color:#10b981;font-weight:600">${p.green_status || ''}${isChild ? ' (Objek Bagian)' : ''}</div>`,
                        { sticky: true, className: 'leaflet-tooltip-custom' }
                    );

                    if (isChild) {
                        setTimeout(() => l.bringToFront(), 15);
                    }
                },
            }
        ).addTo(map);

        lyr.bringToBack();
        refLyrRef.current = lyr;

        if (!refVisible) {
            lyr.setStyle({ opacity: 0, fillOpacity: 0 });
        }
    }, [mapReady, existingLandUsesGeoJson, refVisible]);

    // 6. Load Initial Geometry (or geometry passed from parent / upload)
    useEffect(() => {
        if (!mapReady || !initialGeometry) return;
        // Delay slightly on initial mount so map container size is ready
        const t = setTimeout(() => {
            loadGeometryIntoMap(initialGeometry, true, false);
        }, 150);
        return () => clearTimeout(t);
    }, [mapReady, initialGeometry, loadGeometryIntoMap]);

    // Quick GeoJSON File Upload handler directly from map toolbar
    const handleQuickFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const json = await readGeoJsonFile(file);
            const details = extractGeoJsonDetails(json);
            loadGeometryIntoMap(details.geometry, true, true);
            setUploadSuccessNote(`Berkas "${file.name}" berhasil dimuat (${details.vertexCount} titik vertex, luas: ${formatArea(details.areaM2)})`);
            onPropertiesExtracted?.(details.suggestedFields, details.properties);
        } catch (err) {
            setSpatialError(err.message || 'Gagal memuat berkas GeoJSON.');
        } finally {
            if (quickFileInputRef.current) quickFileInputRef.current.value = '';
        }
    };

    const toggleRef = () => {
        setRefVisible(v => {
            const next = !v;
            if (refLyrRef.current) {
                if (next) {
                    refLyrRef.current.setStyle(getRefStyle);
                } else {
                    refLyrRef.current.setStyle({ opacity: 0, fillOpacity: 0 });
                }
            }
            return next;
        });
    };

    const handleClear = () => {
        drawnItemsRef.current?.clearLayers();
        setCalcArea(0);
        setSpatialError(null);
        setUploadSuccessNote(null);
        onGeometryChange?.(null, 0);
    };

    const refCount = existingLandUsesGeoJson?.features?.length ?? 0;

    return (
        <div className="space-y-2">
            {/* Hidden file input for quick map upload */}
            <input
                ref={quickFileInputRef}
                type="file"
                accept=".geojson,.json"
                onChange={handleQuickFileUpload}
                className="hidden"
            />

            {/* Toolbar Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Gambar poligon bebas titik — <span className="font-semibold text-emerald-700 dark:text-emerald-400">klik dua kali</span> atau <span className="font-semibold text-emerald-700 dark:text-emerald-400">klik titik awal</span> untuk selesai</span>
                    </div>

                    {/* Quick Upload Button on Map */}
                    <button
                        type="button"
                        onClick={() => quickFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
                        title="Upload file GeoJSON QGIS langsung ke peta"
                    >
                        <Upload className="w-3 h-3" />
                        <span>Unggah GeoJSON</span>
                    </button>

                    {!isBoundaryMode && (
                        <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium">
                            <span className="w-4 border-t-2 border-blue-700 dark:border-blue-400 border-dashed inline-block" />
                            <span>Batas kampus</span>
                        </div>
                    )}

                    {refCount > 0 && (
                        <button
                            type="button"
                            onClick={toggleRef}
                            className={`flex items-center gap-1.5 font-semibold transition-colors px-2 py-0.5 rounded-lg border ${
                                refVisible
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                            }`}
                        >
                            {refVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <Layers className="w-3 h-3" />
                            <span>{refCount} data lahan lain {refVisible ? '(aktif)' : '(sembunyi)'}</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {calcArea > 0 && (
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-xl">
                            Luas: {formatArea(calcArea)}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Poligon
                    </button>
                </div>
            </div>

            {/* Upload Success Note */}
            {uploadSuccessNote && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{uploadSuccessNote}</span>
                    </div>
                    <button type="button" onClick={() => setUploadSuccessNote(null)} className="text-emerald-600 hover:text-emerald-800">
                        &times;
                    </button>
                </div>
            )}

            {/* Spatial Containment Warning */}
            {spatialError && (
                <div className="alert alert-danger animate-fade-in text-xs py-2.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{spatialError}</span>
                </div>
            )}

            {/* Map Canvas */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm" style={{ height }}>
                <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
            </div>
        </div>
    );
}
