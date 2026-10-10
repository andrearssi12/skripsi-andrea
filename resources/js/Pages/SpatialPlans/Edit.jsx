import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import DrawingMap from '@/components/map/DrawingMap';
import { formatArea } from '@/lib/utils';
import {
    Compass, ArrowLeft, Save, CheckCircle2, Sparkles,
    Edit3, Info, Building2, Layers, Clock, ShieldCheck
} from 'lucide-react';

const PILLAR_OPTIONS = [
    { value: 'conservation', label: 'Zona Konservasi Prioritas (Wajib Dipertahankan)' },
    { value: 'rth_conversion', label: 'Konversi Menjadi RTH Baru (Ground Level)' },
    { value: 'revitalization', label: 'Revitalisasi & Intensifikasi Kualitas Vegetasi' },
    { value: 'green_roof', label: 'Green Roof / Vertical Garden Bangunan' },
    { value: 'canopy_tree', label: 'Pohon Peneduh / Buffer Kanopi Area Terbuka' },
    { value: 'green_corridor', label: 'Koridor Hijau & Jalur Pedestrian Kampus' },
];

export default function SpatialPlansEdit({
    plan,
    effectiveGeometry,
    campuses = [],
    recommendationItems = [],
}) {
    const selectedCampus = campuses.find(c => c.id === plan.campus_id) || campuses[0] || null;

    const [activeGeometry, setActiveGeometry] = useState(effectiveGeometry);

    const { data, setData, patch, processing, errors } = useForm({
        campus_id: plan.campus_id,
        land_use_id: plan.land_use_id || '',
        title: plan.title || '',
        pillar_type: plan.pillar_type || 'rth_conversion',
        description: plan.description || '',
        target_year: plan.target_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 2}`,
        area_size: plan.area_size || 0,
        potential_gain_percent: plan.potential_gain_percent || 0,
        status: plan.status || 'draft',
        notes: plan.notes || '',
        geometry: effectiveGeometry,
    });

    const handleGeometryChange = (geometry, calculatedArea) => {
        setActiveGeometry(geometry);
        setData(prev => {
            const campusArea = selectedCampus?.total_area || 0;
            const gain = (campusArea > 0 && calculatedArea > 0)
                ? Math.round((calculatedArea / campusArea) * 10000) / 100
                : prev.potential_gain_percent;

            return {
                ...prev,
                geometry,
                area_size: calculatedArea,
                potential_gain_percent: gain,
            };
        });
    };

    const handleSubmit = (targetStatus) => {
        if (targetStatus) {
            setData('status', targetStatus);
            data.status = targetStatus;
        }
        patch(route('spatial-plans.update', plan.id));
    };

    return (
        <>
            <Head title={`Edit Rencana: ${plan.title} - Web GIS UAD`} />

            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <Link href={route('spatial-plans.index')} className="btn btn-ghost btn-sm p-2 text-gray-500">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="page-title text-xl">Edit Rencana Spasial #{plan.id}</h1>
                            <p className="page-subtitle">Sesuaikan data rencana, luasan, titik batas polygon, dan status pelaksanaan</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Simpan sesuai dropdown yang dipilih */}
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={processing}
                            onClick={() => handleSubmit()}
                        >
                            <Save className="w-4 h-4" />
                            <span>Simpan Perubahan</span>
                        </Button>

                        {/* Quick action buttons if admin wants quick status jump */}
                        {data.status !== 'implemented' && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={processing}
                                onClick={() => handleSubmit('implemented')}
                                className="border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50"
                            >
                                <ShieldCheck className="w-4 h-4 text-sky-600" />
                                <span>Tandai Terimplementasi</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Form (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="card p-5 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                                <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <Compass className="w-4 h-4 text-emerald-600" />
                                    <span>Informasi Rencana</span>
                                </h2>
                                <span className={`badge text-xs ${
                                    data.status === 'approved' ? 'badge-success' : data.status === 'implemented' ? 'badge-info' : 'badge-warning'
                                }`}>
                                    Status: {data.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Status Selector */}
                            <div>
                                <label className="form-label text-xs">Status Rencana</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="form-select text-xs py-2"
                                >
                                    <option value="draft">Draft (Hanya Terlihat Oleh Admin)</option>
                                    <option value="approved">Approved (Disetujui & Tampil ke Civitas / Peta)</option>
                                    <option value="implemented">Implemented (Pembangunan Telah Selesai)</option>
                                </select>
                                {errors.status && <p className="form-error">{errors.status}</p>}
                            </div>

                            {/* Lokasi Kampus */}
                            <div>
                                <label className="form-label text-xs">Lokasi Kampus</label>
                                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    <span>{selectedCampus?.name}</span>
                                </div>
                            </div>

                            {/* Judul Rencana */}
                            <div>
                                <label className="form-label text-xs">Judul / Nama Rencana</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="form-input text-xs py-2"
                                />
                                {errors.title && <p className="form-error">{errors.title}</p>}
                            </div>

                            {/* Pilar Zonasi */}
                            <div>
                                <label className="form-label text-xs">Pilar Pengembangan Spasial</label>
                                <select
                                    value={data.pillar_type}
                                    onChange={(e) => setData('pillar_type', e.target.value)}
                                    className="form-select text-xs py-2"
                                >
                                    {PILLAR_OPTIONS.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                                {errors.pillar_type && <p className="form-error">{errors.pillar_type}</p>}
                            </div>

                            {/* Target Tahun & Luas Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label text-xs">Target Pelaksanaan</label>
                                    <input
                                        type="text"
                                        value={data.target_year}
                                        onChange={(e) => setData('target_year', e.target.value)}
                                        className="form-input text-xs py-2"
                                    />
                                    {errors.target_year && <p className="form-error">{errors.target_year}</p>}
                                </div>

                                <div>
                                    <label className="form-label text-xs">Luas Area (m²)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.area_size}
                                        onChange={(e) => setData('area_size', parseFloat(e.target.value) || 0)}
                                        className="form-input text-xs py-2 font-mono"
                                    />
                                    {errors.area_size && <p className="form-error">{errors.area_size}</p>}
                                </div>
                            </div>

                            {/* Potensi Kenaikan RTH */}
                            <div>
                                <label className="form-label text-xs">Potensi Kontribusi Kenaikan RTH Kampus (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.potential_gain_percent}
                                    onChange={(e) => setData('potential_gain_percent', parseFloat(e.target.value) || 0)}
                                    className="form-input text-xs py-2 font-mono"
                                />
                                {errors.potential_gain_percent && <p className="form-error">{errors.potential_gain_percent}</p>}
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="form-label text-xs">Deskripsi & Rencana Tindakan</label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="form-input text-xs py-2 resize-none"
                                />
                                {errors.description && <p className="form-error">{errors.description}</p>}
                            </div>

                            {/* Catatan Internal */}
                            <div>
                                <label className="form-label text-xs">Catatan Administrator</label>
                                <input
                                    type="text"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="form-input text-xs py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Drawing Map (7 cols) */}
                    <div className="lg:col-span-7 space-y-3">
                        <div className="card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-emerald-600" />
                                    <span>Peta Editor Geometri</span>
                                </h2>
                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                    Kampus: <strong>{selectedCampus?.name}</strong>
                                </span>
                            </div>

                            {/* DrawingMap Component with initial effective geometry */}
                            <DrawingMap
                                campus={selectedCampus}
                                landUses={selectedCampus?.land_uses || []}
                                initialGeometry={activeGeometry}
                                onGeometryChange={handleGeometryChange}
                                height="540px"
                            />

                            {/* Helper Note */}
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-gray-700 dark:text-slate-300">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                                <p className="text-[11px] leading-relaxed">
                                    Gunakan tombol toolbar Leaflet di pojok kiri atas peta untuk mengedit titik vertex polygon atau menggambar polygon baru jika ingin mengubah bentuk area rencana.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

