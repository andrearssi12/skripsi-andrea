import * as turf from '@turf/turf';

/**
 * Read and parse a GeoJSON file into JSON object.
 * @param {File} file
 * @returns {Promise<object>}
 */
export function readGeoJsonFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('Berkas tidak ditemukan.'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const json = JSON.parse(text);
                resolve(json);
            } catch (err) {
                reject(new Error('Format berkas tidak valid. Pastikan berkas berupa JSON atau GeoJSON yang valid.'));
            }
        };
        reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
        reader.readAsText(file);
    });
}

/**
 * Extract geometry and properties from parsed GeoJSON.
 * Supports FeatureCollection, Feature, or direct Geometry objects.
 * @param {object} geoJson
 * @param {Array} categories
 * @param {Array} campuses
 * @returns {object}
 */
export function extractGeoJsonDetails(geoJson, categories = [], campuses = []) {
    if (!geoJson || typeof geoJson !== 'object') {
        throw new Error('Data GeoJSON tidak valid.');
    }

    let geometry = null;
    let properties = {};
    let featureCount = 1;
    let featureIndex = 0;
    let allFeatures = [];

    if (geoJson.type === 'FeatureCollection') {
        allFeatures = Array.isArray(geoJson.features) ? geoJson.features : [];
        featureCount = allFeatures.length;

        if (featureCount === 0) {
            throw new Error('FeatureCollection tidak memiliki objek feature.');
        }

        // Pick the first feature with valid polygon/multipolygon geometry
        const polyFeature = allFeatures.find(
            f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
        );

        if (!polyFeature) {
            throw new Error('Tidak ditemukan objek dengan tipe geometri Polygon atau MultiPolygon dalam berkas GeoJSON.');
        }

        geometry = polyFeature.geometry;
        properties = polyFeature.properties || {};
    } else if (geoJson.type === 'Feature') {
        if (!geoJson.geometry) {
            throw new Error('Objek Feature tidak memiliki properti geometry.');
        }
        geometry = geoJson.geometry;
        properties = geoJson.properties || {};
    } else if (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon') {
        geometry = geoJson;
        properties = {};
    } else if (geoJson.coordinates) {
        geometry = {
            type: Array.isArray(geoJson.coordinates[0]?.[0]?.[0]) ? 'MultiPolygon' : 'Polygon',
            coordinates: geoJson.coordinates,
        };
        properties = {};
    } else {
        throw new Error('Tipe GeoJSON tidak dikenali. Harus berupa FeatureCollection, Feature, atau Polygon.');
    }

    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
        throw new Error(`Tipe geometri "${geometry.type}" tidak didukung. Harap gunakan Polygon atau MultiPolygon.`);
    }

    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
        throw new Error('Koordinat geometri kosong.');
    }

    // If single-part MultiPolygon (common QGIS export default), normalize to standard Polygon
    if (geometry.type === 'MultiPolygon' && geometry.coordinates.length === 1) {
        geometry = {
            type: 'Polygon',
            coordinates: geometry.coordinates[0],
        };
    }

    // Count vertices
    let vertexCount = 0;
    try {
        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach(ring => {
                vertexCount += ring.length;
            });
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(poly => {
                poly.forEach(ring => {
                    vertexCount += ring.length;
                });
            });
        }
    } catch (e) {
        vertexCount = 0;
    }

    // Compute area in m²
    let areaM2 = 0;
    try {
        const feature = { type: 'Feature', geometry, properties: {} };
        areaM2 = Math.round(turf.area(feature) * 100) / 100;
    } catch (err) {
        console.warn('Gagal menghitung luas area:', err);
    }

    // Auto-map QGIS properties to application fields
    const suggestedFields = {};

    const findProp = (keys) => {
        for (const k of keys) {
            for (const propKey of Object.keys(properties)) {
                if (propKey.toLowerCase() === k.toLowerCase() && properties[propKey] !== undefined && properties[propKey] !== null && String(properties[propKey]).trim() !== '') {
                    return String(properties[propKey]).trim();
                }
            }
        }
        return null;
    };

    // 1. Name
    const nameVal = findProp(['name', 'nama', 'nama_objek', 'nama_lahan', 'label', 'title', 'Title', 'Nama']);
    if (nameVal) suggestedFields.name = nameVal;

    // 2. Code
    const codeVal = findProp(['code', 'kode', 'kode_objek', 'kode_lahan', 'id_objek', 'object_id', 'Kode']);
    if (codeVal) suggestedFields.code = codeVal;

    // 3. Description
    const descVal = findProp(['description', 'deskripsi', 'keterangan', 'ket', 'notes', 'catatan', 'fungsi', 'Deskripsi']);
    if (descVal) suggestedFields.description = descVal;

    // 4. Area size from properties if provided, else calculated
    const areaVal = findProp(['area_size', 'area', 'luas', 'luas_m2', 'shape_area', 'Shape_Area', 'Luas']);
    if (areaVal && !isNaN(parseFloat(areaVal)) && parseFloat(areaVal) > 0) {
        suggestedFields.area_size = parseFloat(areaVal);
    } else if (areaM2 > 0) {
        suggestedFields.area_size = areaM2;
    }

    // 5. Green Status
    const statusVal = findProp(['green_status', 'status', 'zonasi', 'status_zonasi', 'status_rth', 'rth', 'Zonasi']);
    if (statusVal) {
        const lower = statusVal.toLowerCase();
        if (lower.includes('non-green') || lower.includes('non green') || lower.includes('bukan rth') || lower.includes('terbangun')) {
            suggestedFields.green_status = 'Non-Green Area';
        } else if (lower.includes('vegetasi') || lower.includes('pohon') || lower.includes('non-rth')) {
            suggestedFields.green_status = 'Vegetasi Non-RTH';
        } else if (lower.includes('green') || lower.includes('rth') || lower.includes('taman') || lower.includes('hijau')) {
            suggestedFields.green_status = 'Green Area';
        }
    }

    // 6. Condition
    const condVal = findProp(['condition', 'kondisi', 'kualitas', 'keadaan', 'Kondisi']);
    if (condVal) {
        const lower = condVal.toLowerCase();
        if (lower.includes('kurang') || lower.includes('buruk') || lower.includes('rusak') || lower.includes('poor')) {
            suggestedFields.condition = 'Kurang';
        } else if (lower.includes('sedang') || lower.includes('cukup') || lower.includes('fair')) {
            suggestedFields.condition = 'Sedang';
        } else if (lower.includes('baik') || lower.includes('bagus') || lower.includes('good')) {
            suggestedFields.condition = 'Baik';
        }
    }

    // 7. Category matching
    const catVal = findProp(['category_id', 'category', 'category_name', 'kategori', 'jenis', 'tipe', 'Kategori']);
    if (catVal && categories.length > 0) {
        // Try matching by exact ID or name
        const matched = categories.find(
            c => String(c.id) === String(catVal) || c.name.toLowerCase() === catVal.toLowerCase() || c.name.toLowerCase().includes(catVal.toLowerCase())
        );
        if (matched) {
            suggestedFields.category_id = String(matched.id);
        }
    }

    // 8. Campus matching
    const campVal = findProp(['campus_id', 'campus', 'campus_name', 'kampus', 'lokasi', 'Kampus']);
    if (campVal && campuses.length > 0) {
        const matched = campuses.find(
            c => String(c.id) === String(campVal) || c.name.toLowerCase() === campVal.toLowerCase() || c.code.toLowerCase() === campVal.toLowerCase() || c.name.toLowerCase().includes(campVal.toLowerCase())
        );
        if (matched) {
            suggestedFields.campus_id = String(matched.id);
        }
    }

    return {
        geometry,
        properties,
        suggestedFields,
        areaM2,
        vertexCount,
        featureCount,
        allFeatures,
    };
}

/**
 * Trigger browser download for a GeoJSON file.
 * @param {object|string} data
 * @param {string} filename
 */
export function downloadGeoJson(data, filename = 'export_spatial.geojson') {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/geo+json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.geojson') ? filename : `${filename}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
