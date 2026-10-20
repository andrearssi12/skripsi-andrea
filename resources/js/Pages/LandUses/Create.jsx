import { useState, useMemo } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import LeafletDrawMap from '@/Components/map/LeafletDrawMap';
import GeoJsonUploader from '@/Components/map/GeoJsonUploader';
import PageHeader from '@/Components/PageHeader';
import {
    Save, MapPin, Layers, Info, Upload,
    Sparkles, Download, FileCode, CheckCircle2
} from 'lucide-react';

export default function LandUseCreate({
    campuses = [],
    categories = [],
    parentCandidates = [],
    defaultCampusId,
    allLandUsesGeoJson = { type: 'FeatureCollection', features: [] },
}) {
    const initialCampusId = defaultCampusId || (campuses[0]?.id ? String(campuses[0].id) : '');

    const [selectedCampus, setSelectedCampus] = useState(
        campuses.find(c => String(c.id) === String(initialCampusId)) || campuses[0]
    );

    const [isGeometryValid, setIsGeometryValid] = useState(true);
    const [inputMethod, setInputMethod] = useState('both'); // 'upload' | 'draw' | 'both'
    const [activeGeometry, setActiveGeometry] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        campus_id: initialCampusId,
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        parent_id: '',
        code: '',
        name: '',
        area_size: '',
        green_status: 'Green Area',
        condition: 'Baik',
        geometry: '',
        description: '',
    });

    const handleCampusChange = (campusId) => {
        const camp = campuses.find(c => String(c.id) === String(campusId)) || null;
        setSelectedCampus(camp);
        setIsGeometryValid(true);
        setData(prev => ({
            ...prev,
            campus_id: campusId,
            geometry: '', // Reset previous geometry so user draws or uploads within the new campus
            area_size: '',
        }));
        setActiveGeometry(null);
    };

    // Filter reference land uses for the selected campus
    const campusLandUsesGeoJson = useMemo(() => {
        if (!allLandUsesGeoJson?.features) return { type: 'FeatureCollection', features: [] };
        return {
            type: 'FeatureCollection',
            features: allLandUsesGeoJson.features.filter(
                f => String(f.properties?.campus_id) === String(data.campus_id)
            ),
        };
    }, [allLandUsesGeoJson, data.campus_id]);

    const handleGeometryDrawn = (geometry, areaM2, isValid = true) => {
        setIsGeometryValid(isValid);
        if (geometry) {
            setActiveGeometry(geometry);
            setData(prev => ({
                ...prev,
                geometry: JSON.stringify(geometry, null, 2),
                area_size: areaM2 > 0 ? String(areaM2) : prev.area_size,
            }));
        } else {
            setActiveGeometry(null);
            setData(prev => ({ ...prev, geometry: '', area_size: '' }));
        }
    };

    const handleGeoJsonUploaded = ({ geometry, areaM2, suggestedFields }) => {
        setActiveGeometry(geometry);
        setIsGeometryValid(true);

        setData(prev => {
            const next = {
                ...prev,
                geometry: JSON.stringify(geometry, null, 2),
                area_size: areaM2 > 0 ? String(areaM2) : prev.area_size,
            };

            // Auto-fill suggested fields from QGIS attributes if present
            if (suggestedFields.name && (!prev.name || prev.name.trim() === '')) {
                next.name = suggestedFields.name;
            }
            if (suggestedFields.code && (!prev.code || prev.code.trim() === '')) {
                next.code = suggestedFields.code;
            }
            if (suggestedFields.category_id) {
                next.category_id = suggestedFields.category_id;
            }
            if (suggestedFields.green_status) {
                next.green_status = suggestedFields.green_status;
            }
            if (suggestedFields.condition) {
                next.condition = suggestedFields.condition;
            }
            if (suggestedFields.description && (!prev.description || prev.description.trim() === '')) {
                next.description = suggestedFields.description;
            }
            if (suggestedFields.campus_id && suggestedFields.campus_id !== prev.campus_id) {
                const foundCamp = campuses.find(c => String(c.id) === String(suggestedFields.campus_id));
                if (foundCamp) {
                    setSelectedCampus(foundCamp);
                    next.campus_id = suggestedFields.campus_id;
                }
            }

            return next;
        });
    };

    const selectedCategory = categories.find(c => String(c.id) === String(data.category_id));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.geometry) {
            alert('Silakan gambar poligon pada peta atau unggah file GeoJSON QGIS terlebih dahulu.');
            return;
        }
        if (!isGeometryValid) {
            alert('Poligon berada di luar batas wilayah kampus yang dipilih! Silakan sesuaikan gambar di dalam batas garis biru.');
            return;
        }
        post('/land-uses');
    };

    return (
        <>
            <Head title="Tambah Objek Lahan Baru - Web GIS UAD" />

            <div className="max-w-5xl mx-auto space-y-5">

                <PageHeader
                    title="Tambah Objek Penggunaan Lahan"
                    description="Gambar langsung di peta atau unggah file GeoJSON hasil rancangan QGIS"
                    backHref="/land-uses"
                    actions={
                        <Link href="/land-uses/import" className="btn btn-secondary btn-sm hidden sm:inline-flex">
                            <Upload className="w-3.5 h-3.5" />
                            Batch Import GeoJSON
                        </Link>
                    }
                />

                <div className="card p-6 space-y-6">
                    {/* 1. Pilih Kampus & Kategori */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Pilih Kampus Lokasi Objek"
                            id="campus_id"
                            value={data.campus_id}
                            onChange={(e) => handleCampusChange(e.target.value)}
                            error={errors.campus_id}
                            options={campuses.map(c => ({ value: String(c.id), label: `${c.name} (${c.code})` }))}
                            required
                        />
                        <Select
                            label="Kategori Lahan"
                            id="category_id"
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            error={errors.category_id}
                            options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                            required
                        />
                    </div>

                    {/* 2. GeoJSON Upload Section (From QGIS) */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-700/80 space-y-3">
                        <GeoJsonUploader
                            onGeoJsonLoaded={handleGeoJsonUploaded}
                            categories={categories}
                            campuses={campuses}
                            currentGeometry={data.geometry}
                            currentName={data.name || 'objek_lahan_baru'}
                        />
                    </div>

                    {/* 3. Interactive Map Drawing Component */}
                    <div className="space-y-2">
                        <label className="form-label flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-slate-200">
                                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                Visualisasi & Edit Poligon di Peta Kampus
                            </span>
                            <span className="text-[11px] font-normal text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                Batas kampus: {selectedCampus?.name || 'Pilih kampus'}
                            </span>
                        </label>

                        <LeafletDrawMap
                            campusBoundary={selectedCampus?.boundary_geometry}
                            initialGeometry={activeGeometry}
                            categoryColor={selectedCategory?.color || '#10b981'}
                            onGeometryChange={handleGeometryDrawn}
                            existingLandUsesGeoJson={campusLandUsesGeoJson}
                            height="420px"
                        />
                        {errors.geometry && <p className="form-error">{errors.geometry}</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-gray-100 dark:border-slate-800">
                        {/* 4. Atribut Objek */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Nama Objek Lahan"
                                id="name"
                                placeholder="Contoh: Taman Tengah Kampus"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                            <Input
                                label="Kode Objek (Opsional)"
                                id="code"
                                placeholder="Contoh: K4-GRN-01"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                error={errors.code}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Luas Area (m²) - Terhitung Otomatis"
                                id="area_size"
                                type="number"
                                step="0.01"
                                placeholder="Auto dari gambar/file GeoJSON"
                                value={data.area_size}
                                onChange={(e) => setData('area_size', e.target.value)}
                                error={errors.area_size}
                                required
                            />
                            <Select
                                label="Status Kawasan Hijau"
                                id="green_status"
                                value={data.green_status}
                                onChange={(e) => setData('green_status', e.target.value)}
                                error={errors.green_status}
                                options={[
                                    { value: 'Green Area', label: 'Green Area (RTH)' },
                                    { value: 'Vegetasi Non-RTH', label: 'Vegetasi Non-RTH' },
                                    { value: 'Non-Green Area', label: 'Non-Green Area' },
                                ]}
                                required
                            />
                            <Select
                                label="Kondisi Fisik"
                                id="condition"
                                value={data.condition}
                                onChange={(e) => setData('condition', e.target.value)}
                                error={errors.condition}
                                options={[
                                    { value: 'Baik', label: 'Baik' },
                                    { value: 'Sedang', label: 'Sedang' },
                                    { value: 'Kurang', label: 'Kurang' },
                                ]}
                                required
                            />
                        </div>

                        <Select
                            label="Objek Induk / Parent (Opsional - misal: Vegetasi di dalam Parkiran)"
                            id="parent_id"
                            value={data.parent_id}
                            onChange={(e) => setData('parent_id', e.target.value)}
                            error={errors.parent_id}
                            placeholder="Tidak ada (Objek Mandiri)"
                            options={parentCandidates.map(p => ({
                                value: String(p.id),
                                label: `${p.name} (${p.code || 'ID: ' + p.id})`
                            }))}
                        />

                        {/* Collapsible raw GeoJSON (optional display) */}
                        <details className="text-xs text-gray-500 dark:text-slate-400">
                            <summary className="cursor-pointer font-medium hover:text-gray-700 dark:hover:text-slate-300 select-none">
                                Lihat Raw Data GeoJSON Geometry (Terisi Otomatis dari Gambar / File)
                            </summary>
                            <div className="mt-2">
                                <Textarea
                                    id="geometry"
                                    rows={4}
                                    value={data.geometry}
                                    onChange={(e) => {
                                        setData('geometry', e.target.value);
                                        try {
                                            const g = JSON.parse(e.target.value);
                                            setActiveGeometry(g);
                                        } catch (err) {}
                                    }}
                                    className="font-mono text-xs"
                                    placeholder='Koordinat poligon akan muncul di sini otomatis setelah digambar atau diunggah dari file GeoJSON'
                                />
                            </div>
                        </details>

                        <Textarea
                            label="Deskripsi & Catatan Objek"
                            id="description"
                            rows={3}
                            placeholder="Keterangan fungsi, jenis vegetasi atau tanaman, dsb..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            error={errors.description}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <Link href="/land-uses" className="btn btn-secondary">
                                Batal
                            </Link>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                disabled={!data.geometry || !isGeometryValid}
                            >
                                <Save className="w-4 h-4" />
                                Simpan Objek Lahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

