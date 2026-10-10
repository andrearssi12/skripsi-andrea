import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import Select from '@/components/ui/Select';
import { readGeoJsonFile } from '@/lib/geojsonParser';
import { formatArea } from '@/lib/utils';
import {
    ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle,
    HelpCircle, Sparkles, Layers, ListFilter, X
} from 'lucide-react';

export default function LandUseImport({ campuses = [], categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        campus_id: campuses[0]?.id ? String(campuses[0].id) : '',
        default_category_id: categories[0]?.id ? String(categories[0].id) : '',
        default_green_status: 'Green Area',
        file: null,
    });

    const [fileName, setFileName] = useState('');
    const [previewInfo, setPreviewInfo] = useState(null);
    const [previewError, setPreviewError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('file', file);
        setFileName(file.name);
        setPreviewError(null);

        try {
            const json = await readGeoJsonFile(file);
            const features = json.type === 'FeatureCollection'
                ? json.features || []
                : (json.type === 'Feature' ? [json] : []);

            const polygonFeatures = features.filter(
                f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
            );

            setPreviewInfo({
                totalFeatures: features.length,
                polygonCount: polygonFeatures.length,
                items: polygonFeatures.slice(0, 10).map((f, i) => {
                    const p = f.properties || {};
                    return {
                        name: p.name || p.Nama || p.NAMA || `Objek #${i + 1}`,
                        category: p.category || p.kategori || p.Kategori || 'Default',
                        code: p.code || p.Kode || p.KODE || '-',
                        green_status: p.green_status || p.status || 'Default',
                    };
                }),
            });
        } catch (err) {
            setPreviewError('File berhasil dipilih, namun pratinjau klien tidak dapat menampilkan struktur data. Server tetap akan memproses file.');
            setPreviewInfo(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/land-uses/import');
    };

    return (
        <>
            <Head title="Import Data Spasial GeoJSON - Web GIS UAD" />

            <div className="max-w-3xl mx-auto space-y-6">

                <div className="flex items-center gap-3">
                    <Link href="/land-uses" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="page-title text-xl">Import Batch Data Spasial GeoJSON</h1>
                        <p className="page-subtitle">Unggah berkas GeoJSON hasil digitasi QGIS untuk menambahkan banyak objek sekaligus</p>
                    </div>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Kampus Tujuan"
                                id="campus_id"
                                value={data.campus_id}
                                onChange={(e) => setData('campus_id', e.target.value)}
                                error={errors.campus_id}
                                options={campuses.map(c => ({ value: String(c.id), label: c.name }))}
                                required
                            />
                            <Select
                                label="Kategori Default"
                                id="default_category_id"
                                value={data.default_category_id}
                                onChange={(e) => setData('default_category_id', e.target.value)}
                                error={errors.default_category_id}
                                options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                                required
                            />
                            <Select
                                label="Zonasi Hijau Default"
                                id="default_green_status"
                                value={data.default_green_status}
                                onChange={(e) => setData('default_green_status', e.target.value)}
                                error={errors.default_green_status}
                                options={[
                                    { value: 'Green Area', label: 'Green Area (RTH)' },
                                    { value: 'Vegetasi Non-RTH', label: 'Vegetasi Non-RTH' },
                                    { value: 'Non-Green Area', label: 'Non-Green Area' },
                                ]}
                                required
                            />
                        </div>

                        {/* File Upload Box */}
                        <div>
                            <label className="form-label">Berkas GeoJSON (.geojson atau .json)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-gray-50/50 dark:bg-slate-800/30">
                                <div className="space-y-2 text-center">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="flex text-sm text-gray-600 dark:text-slate-400 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none">
                                            <span>Pilih berkas GeoJSON</span>
                                            <input
                                                id="file-upload"
                                                name="file"
                                                type="file"
                                                accept=".geojson,.json"
                                                className="sr-only"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Maksimal ukuran berkas: 10 MB</p>
                                    {fileName && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-semibold mt-2">
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>{fileName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {errors.file && <p className="form-error">{errors.file}</p>}
                        </div>

                        {/* Preview error if client failed to parse */}
                        {previewError && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Catatan Pratinjau Berkas</p>
                                    <p className="mt-0.5 text-amber-700 dark:text-amber-300">{previewError}</p>
                                </div>
                            </div>
                        )}

                        {/* Preview summary if available */}
                        {previewInfo && (
                            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3 animate-fade-in text-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="font-bold text-emerald-900 dark:text-emerald-200">
                                            Pratinjau Berkas: Terdeteksi {previewInfo.polygonCount} Poligon Siap Diimpor
                                        </span>
                                    </div>
                                    <span className="badge badge-green text-[10px]">
                                        {previewInfo.totalFeatures} Total Feature
                                    </span>
                                </div>

                                <div className="divide-y divide-emerald-200/60 dark:divide-emerald-800/60 max-h-40 overflow-y-auto pr-1">
                                    {previewInfo.items.map((item, idx) => (
                                        <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                                            <span className="font-medium text-gray-800 dark:text-slate-200 truncate mr-2">
                                                {idx + 1}. {item.name}
                                            </span>
                                            <span className="text-gray-500 dark:text-slate-400 flex-shrink-0">
                                                {item.category} • {item.green_status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Guidelines Banner */}
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 space-y-2">
                            <div className="flex items-center gap-2 font-bold">
                                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Petunjuk Format Data Spasial QGIS</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                                <li>Pastikan tipe geometri berupa <strong>Polygon</strong> atau <strong>MultiPolygon</strong> dalam sistem koordinat <strong>WGS84 (EPSG:4326)</strong>.</li>
                                <li>Sistem membaca atribut otomatis: nama (<code className="bg-white/80 dark:bg-slate-800/80 px-1 py-0.5 rounded font-mono">name</code> / <code className="bg-white/80 dark:bg-slate-800/80 px-1 py-0.5 rounded font-mono">Nama</code>), kode, kategori, dan zonasi hijau.</li>
                                <li>Luas area (m²) akan otomatis dihitung dari geometri jika atribut luas tidak disertakan dalam file GeoJSON.</li>
                            </ul>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <Link href="/land-uses" className="btn btn-secondary">
                                Batal
                            </Link>
                            <Button type="submit" variant="primary" isLoading={processing} disabled={!data.file}>
                                <Upload className="w-4 h-4" />
                                Proses Import GeoJSON
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

