import { useState, useRef } from 'react';
import { readGeoJsonFile, extractGeoJsonDetails, downloadGeoJson } from '@/lib/geojsonParser';
import { formatArea } from '@/lib/utils';
import Button from '@/components/ui/Button';
import {
    Upload, FileText, Download, CheckCircle2, AlertCircle,
    RotateCcw, Sparkles, Code2, Layers, Check, X, FileUp
} from 'lucide-react';

export default function GeoJsonUploader({
    onGeoJsonLoaded,
    categories = [],
    campuses = [],
    currentGeometry = null,
    currentName = 'data_lahan',
    isBoundaryMode = false,
    className = '',
}) {
    const [activeTab, setActiveTab] = useState('file'); // 'file' | 'paste'
    const [dragActive, setDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loadedInfo, setLoadedInfo] = useState(null);
    const [pasteText, setPasteText] = useState('');
    const fileInputRef = useRef(null);

    const processGeoJson = (jsonData, sourceName = 'Upload File') => {
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const details = extractGeoJsonDetails(jsonData, categories, campuses);
            setLoadedInfo({
                sourceName,
                geometryType: details.geometry.type,
                vertexCount: details.vertexCount,
                areaM2: details.areaM2,
                featureCount: details.featureCount,
                suggestedFields: details.suggestedFields,
                propertiesCount: Object.keys(details.properties).length,
                properties: details.properties,
            });

            // Call parent callback
            onGeoJsonLoaded?.({
                geometry: details.geometry,
                areaM2: details.areaM2,
                suggestedFields: details.suggestedFields,
                properties: details.properties,
                rawGeoJson: jsonData,
                sourceName,
            });
        } catch (err) {
            setErrorMsg(err.message || 'Gagal memproses data GeoJSON.');
            setLoadedInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const json = await readGeoJsonFile(file);
            processGeoJson(json, file.name);
        } catch (err) {
            setErrorMsg(err.message || 'Gagal membaca berkas GeoJSON.');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const json = await readGeoJsonFile(file);
            processGeoJson(json, file.name);
        } catch (err) {
            setErrorMsg(err.message || 'Gagal memproses berkas yang di-drop.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasteSubmit = (e) => {
        e.preventDefault();
        if (!pasteText.trim()) return;

        try {
            const json = JSON.parse(pasteText.trim());
            processGeoJson(json, 'Pasted GeoJSON');
        } catch (err) {
            setErrorMsg('Format JSON tidak valid! Pastikan menyalin struktur GeoJSON yang lengkap.');
        }
    };

    const handleReset = () => {
        setLoadedInfo(null);
        setErrorMsg(null);
        setPasteText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExportCurrent = () => {
        if (!currentGeometry) return;
        const geom = typeof currentGeometry === 'string' ? JSON.parse(currentGeometry) : currentGeometry;
        const exportFeature = {
            type: 'Feature',
            properties: {
                name: currentName || (isBoundaryMode ? 'Batas Kampus' : 'Objek Lahan'),
                exported_at: new Date().toISOString(),
                software: 'Web GIS UAD - QGIS Export',
            },
            geometry: geom,
        };
        const safeName = (currentName || 'export').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
        downloadGeoJson(exportFeature, `${safeName}.geojson`);
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Header & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        <FileUp className="w-4 h-4" />
                    </span>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 font-display">
                            {isBoundaryMode ? 'Upload File GeoJSON Batas Kampus' : 'Upload File GeoJSON Hasil QGIS'}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400">
                            Impor langsung berkas poligon (.geojson / .json) hasil digitasi QGIS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {currentGeometry && (
                        <button
                            type="button"
                            onClick={handleExportCurrent}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Unduh geometri saat ini sebagai file .geojson untuk dibuka di QGIS"
                        >
                            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Ekspor ke QGIS</span>
                        </button>
                    )}

                    <div className="inline-flex p-0.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('file')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                activeTab === 'file'
                                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Pilih Berkas
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('paste')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                activeTab === 'paste'
                                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Paste JSON
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab 1: File Dropzone */}
            {activeTab === 'file' && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".geojson,.json,application/geo+json,application/json"
                        onChange={handleFileChange}
                        className="hidden"
                        id="geojson-file-upload-input"
                    />

                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
                            dragActive
                                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-4 ring-emerald-500/20'
                                : 'border-gray-200 dark:border-slate-700/80 bg-gray-50/60 dark:bg-slate-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/20'
                        }`}
                    >
                        <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs mb-1">
                                <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-gray-800 dark:text-slate-200">
                                Klik untuk memilih berkas atau drag & drop file GeoJSON QGIS
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500">
                                Mendukung format <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-gray-200 dark:border-slate-800">.geojson</code> atau <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-gray-200 dark:border-slate-800">.json</code> (Sistem Koordinat WGS84 / EPSG:4326)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Paste Raw GeoJSON */}
            {activeTab === 'paste' && (
                <form onSubmit={handlePasteSubmit} className="space-y-2">
                    <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        rows={3}
                        placeholder='Tempel (paste) kode GeoJSON di sini, misal: { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [...] } }'
                        className="form-input text-xs font-mono py-2"
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setPasteText('')}>
                            Bersihkan
                        </Button>
                        <Button type="submit" variant="primary" size="sm" disabled={!pasteText.trim()}>
                            <Code2 className="w-3.5 h-3.5" />
                            Muat Data GeoJSON
                        </Button>
                    </div>
                </form>
            )}

            {/* Error message */}
            {errorMsg && (
                <div className="alert alert-danger animate-fade-in text-xs py-2 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                    <button type="button" onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Loaded Information Preview Card */}
            {loadedInfo && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                <Check className="w-3.5 h-3.5" />
                            </span>
                            <div>
                                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block leading-tight">
                                    Berkas GeoJSON Berhasil Dimuat & Diterapkan ke Peta
                                </span>
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                    Sumber: {loadedInfo.sourceName}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-1 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 transition-colors"
                            title="Reset upload"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 text-[11px]">
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block">Tipe Geometri</span>
                            <span className="font-bold text-gray-800 dark:text-slate-200">{loadedInfo.geometryType}</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block">Luas Otomatis</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatArea(loadedInfo.areaM2)}</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block">Titik Vertex</span>
                            <span className="font-bold text-gray-800 dark:text-slate-200">{loadedInfo.vertexCount} titik</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block">Atribut QGIS</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{loadedInfo.propertiesCount} kolom</span>
                        </div>
                    </div>

                    {/* Auto-filled field badges from QGIS attributes */}
                    {Object.keys(loadedInfo.suggestedFields).length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-emerald-800 dark:text-emerald-300">
                            <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="font-semibold">Atribut terdeteksi otomatis:</span>
                            {Object.entries(loadedInfo.suggestedFields).map(([key, val]) => (
                                <span
                                    key={key}
                                    className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 font-mono text-[10px]"
                                >
                                    {key}: <strong>{String(val)}</strong>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
