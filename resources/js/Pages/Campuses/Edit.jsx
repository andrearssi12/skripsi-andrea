import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import LeafletDrawMap from '@/components/map/LeafletDrawMap';
import GeoJsonUploader from '@/components/map/GeoJsonUploader';
import { ArrowLeft, Save, MapPin, Building2 } from 'lucide-react';

export default function CampusEdit({
    campus,
    otherCampusesGeoJson = { type: 'FeatureCollection', features: [] },
    existingLandUsesGeoJson = { type: 'FeatureCollection', features: [] },
}) {
    const [activeGeometry, setActiveGeometry] = useState(campus.boundary_geometry);

    const { data, setData, put, processing, errors } = useForm({
        code: campus.code || '',
        name: campus.name || '',
        address: campus.address || '',
        total_area: campus.total_area || '',
        boundary_geometry: campus.boundary_geometry ? JSON.stringify(campus.boundary_geometry, null, 2) : '',
        description: campus.description || '',
    });

    const handleBoundaryDrawn = (geometry, areaM2) => {
        if (geometry) {
            setActiveGeometry(geometry);
            setData(prev => ({
                ...prev,
                boundary_geometry: JSON.stringify(geometry),
                total_area: areaM2 > 0 ? String(areaM2) : prev.total_area,
            }));
        } else {
            setActiveGeometry(null);
            setData(prev => ({ ...prev, boundary_geometry: '' }));
        }
    };

    const handleGeoJsonUploaded = ({ geometry, areaM2, suggestedFields }) => {
        setActiveGeometry(geometry);
        setData(prev => {
            const next = {
                ...prev,
                boundary_geometry: JSON.stringify(geometry, null, 2),
                total_area: areaM2 > 0 ? String(areaM2) : prev.total_area,
            };

            if (suggestedFields.name && (!prev.name || prev.name.trim() === '')) {
                next.name = suggestedFields.name;
            }
            if (suggestedFields.code && (!prev.code || prev.code.trim() === '')) {
                next.code = suggestedFields.code;
            }

            return next;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/campuses/${campus.id}`);
    };

    return (
        <>
            <Head title={`Edit Kampus: ${campus.name}`} />

            <div className="max-w-4xl mx-auto space-y-5">

                <div className="flex items-center gap-3">
                    <Link href="/campuses" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="page-title text-xl">Edit Data Kampus</h1>
                        <p className="page-subtitle">Perbarui identitas dan batas perimeter {campus.name}</p>
                    </div>
                </div>

                <div className="card p-6 space-y-6">
                    {/* GeoJSON Boundary Uploader */}
                    <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-700/80 space-y-3">
                        <GeoJsonUploader
                            onGeoJsonLoaded={handleGeoJsonUploaded}
                            currentGeometry={data.boundary_geometry}
                            currentName={data.name || campus.name}
                            isBoundaryMode={true}
                        />
                    </div>

                    {/* Interactive Boundary Editor */}
                    <div className="space-y-2">
                        <label className="form-label flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-slate-200">
                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Gambar / Edit Garis Batas Wilayah Kampus (Perimeter Boundary)
                            </span>
                        </label>

                        <LeafletDrawMap
                            isBoundaryMode={true}
                            initialGeometry={activeGeometry}
                            categoryColor="#1d4ed8"
                            onGeometryChange={handleBoundaryDrawn}
                            existingLandUsesGeoJson={existingLandUsesGeoJson}
                            otherCampusesGeoJson={otherCampusesGeoJson}
                            height="420px"
                        />
                        {errors.boundary_geometry && <p className="form-error">{errors.boundary_geometry}</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Kode Kampus"
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                error={errors.code}
                                required
                            />
                            <Input
                                label="Nama Kampus"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Total Luas Kampus (m²) - Terhitung Otomatis"
                                id="total_area"
                                type="number"
                                step="0.01"
                                value={data.total_area}
                                onChange={(e) => setData('total_area', e.target.value)}
                                error={errors.total_area}
                                required
                            />
                            <Input
                                label="Alamat Kampus"
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                error={errors.address}
                            />
                        </div>

                        {/* Collapsible raw boundary GeoJSON */}
                        <details className="text-xs text-gray-500 dark:text-slate-400">
                            <summary className="cursor-pointer font-medium hover:text-gray-700 dark:hover:text-slate-300 select-none">
                                Lihat Raw Data GeoJSON Batas Kampus
                            </summary>
                            <div className="mt-2">
                                <Textarea
                                    id="boundary_geometry"
                                    rows={4}
                                    value={data.boundary_geometry}
                                    onChange={(e) => {
                                        setData('boundary_geometry', e.target.value);
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
                            label="Deskripsi Kampus"
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            error={errors.description}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <Link href="/campuses" className="btn btn-secondary">
                                Batal
                            </Link>
                            <Button type="submit" variant="primary" isLoading={processing}>
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

