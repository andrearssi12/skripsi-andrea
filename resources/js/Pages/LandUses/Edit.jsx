import { useState, useMemo } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import LeafletDrawMap from '@/components/map/LeafletDrawMap';
import GeoJsonUploader from '@/components/map/GeoJsonUploader';
import { ArrowLeft, Save, MapPin, Download, Upload, Sparkles } from 'lucide-react';

export default function LandUseEdit({
    landUse,
    campuses = [],
    categories = [],
    parentCandidates = [],
    existingLandUsesGeoJson = { type: 'FeatureCollection', features: [] },
}) {
    const [selectedCampus, setSelectedCampus] = useState(
        campuses.find(c => String(c.id) === String(landUse.campus_id)) || campuses[0]
    );

    const [isGeometryValid, setIsGeometryValid] = useState(true);
    const [activeGeometry, setActiveGeometry] = useState(landUse.geometry);

    const { data, setData, put, processing, errors } = useForm({
        campus_id: String(landUse.campus_id || ''),
        category_id: String(landUse.category_id || ''),
        parent_id: landUse.parent_id ? String(landUse.parent_id) : '',
        code: landUse.code || '',
        name: landUse.name || '',
        area_size: landUse.area_size || '',
        green_status: landUse.green_status || 'Green Area',
        condition: landUse.condition || 'Baik',
        geometry: landUse.geometry ? JSON.stringify(landUse.geometry, null, 2) : '',
        description: landUse.description || '',
    });

    const handleCampusChange = (campusId) => {
        setData('campus_id', campusId);
        const camp = campuses.find(c => String(c.id) === String(campusId));
        setSelectedCampus(camp);
    };

    // Filter reference land uses for currently selected campus, excluding current landUse
    const currentCampusLandUses = useMemo(() => {
        if (!existingLandUsesGeoJson?.features) return { type: 'FeatureCollection', features: [] };
        return {
            type: 'FeatureCollection',
            features: existingLandUsesGeoJson.features.filter(
                f => String(f.properties?.campus_id) === String(data.campus_id) && String(f.properties?.id) !== String(landUse.id)
            ),
        };
    }, [existingLandUsesGeoJson, data.campus_id, landUse.id]);

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

            // If user wishes to update attributes from QGIS
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
            alert('Poligon yang digambar berada di luar batas kampus! Silakan sesuaikan gambar di dalam batas biru.');
            return;
        }
        put(`/land-uses/${landUse.id}`);
    };

    return (
        <>
            <Head title={`Edit Objek: ${landUse.name}`} />

            <div className="max-w-5xl mx-auto space-y-5">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/land-uses" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="page-title text-xl">Edit Objek Penggunaan Lahan</h1>
                            <p className="page-subtitle">Modifikasi poligon langsung di peta atau unggah file GeoJSON dari QGIS</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Kampus Lokasi Objek"
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

                    {/* GeoJSON Upload & Export Section (QGIS) */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-700/80 space-y-3">
                        <GeoJsonUploader
                            onGeoJsonLoaded={handleGeoJsonUploaded}
                            categories={categories}
                            campuses={campuses}
                            currentGeometry={data.geometry}
                            currentName={data.name || landUse.name}
                        />
                    </div>

                    {/* Interactive Map Drawing */}
                    <div className="space-y-2">
                        <label className="form-label flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-slate-200">
                                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                Gambar / Edit Poligon Objek di Atas Peta Kampus
                            </span>
                            <span className="text-[11px] font-normal text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                Hanya di dalam garis batas kampus (garis biru putus-putus)
                            </span>
                        </label>

                        <LeafletDrawMap
                            campusBoundary={selectedCampus?.boundary_geometry}
                            initialGeometry={activeGeometry}
                            categoryColor={selectedCategory?.color || '#10b981'}
                            onGeometryChange={handleGeometryDrawn}
                            existingLandUsesGeoJson={currentCampusLandUses}
                            height="420px"
                        />
                        {errors.geometry && <p className="form-error">{errors.geometry}</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Nama Objek Lahan"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                            <Input
                                label="Kode Objek"
                                id="code"
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
                            label="Parent Object / Induk Objek"
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

                        {/* Collapsible raw GeoJSON */}
                        <details className="text-xs text-gray-500 dark:text-slate-400">
                            <summary className="cursor-pointer font-medium hover:text-gray-700 dark:hover:text-slate-300 select-none">
                                Lihat Raw Data GeoJSON Geometry
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
                                />
                            </div>
                        </details>

                        <Textarea
                            label="Deskripsi & Catatan Objek"
                            id="description"
                            rows={3}
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
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

