import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import PageHeader from '@/Components/PageHeader';
import DrawingMap from '@/Components/map/DrawingMap';
import { formatArea } from '@/lib/utils';
import {
    Compass, Save, Info, Building2, Layers, ShieldCheck
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
    campusAnalysis = null,
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
                <PageHeader
                    title={`Edit Rencana Spasial #${plan.id}`}
                    description="Sesuaikan data rencana, luasan, titik batas polygon, dan status pelaksanaan"
                    backHref={route('spatial-plans.index')}
                    actions={
                        <>
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
                        </>
                    }
                />

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
                            <Select
                                label="Status Rencana"
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                placeholder={false}
                                className="text-xs py-2"
                                error={errors.status}
                            >
                                <option value="draft">Draft (Hanya Terlihat Oleh Admin)</option>
                                <option value="approved">Approved (Disetujui & Tampil ke Civitas / Peta)</option>
                                <option value="implemented">Implemented (Pembangunan Telah Selesai)</option>
                            </Select>

                            {/* Lokasi Kampus */}
                            <div>
                                <label className="form-label text-xs">Lokasi Kampus</label>
                                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    <span>{selectedCampus?.name}</span>
                                </div>

                                {campusAnalysis && (
                                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-[11px] space-y-1">
                                        <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                                            <span>RTH Saat Ini: {campusAnalysis.green_percentage}%</span>
                                            <span className={`badge text-[9px] ${campusAnalysis.is_achieved ? 'badge-green' : 'badge-amber'}`}>
                                                {campusAnalysis.is_achieved ? 'Target 30% Terpenuhi' : `Defisit ${campusAnalysis.gap_percentage}%`}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-gray-600 dark:text-slate-300 flex justify-between">
                                            <span>Target 30%: {formatArea(campusAnalysis.target_area)}</span>
                                            <span>Defisit: {campusAnalysis.is_achieved ? '0 m²' : formatArea(campusAnalysis.gap_area_size)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Judul Rencana */}
                            <Input
                                label="Judul / Nama Rencana"
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="text-xs py-2"
                                error={errors.title}
                            />

                            {/* Pilar Zonasi */}
                            <Select
                                label="Pilar Pengembangan Spasial"
                                id="pillar_type"
                                value={data.pillar_type}
                                onChange={(e) => setData('pillar_type', e.target.value)}
                                placeholder={false}
                                options={PILLAR_OPTIONS}
                                className="text-xs py-2"
                                error={errors.pillar_type}
                            />

                            {/* Target Tahun & Luas Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Target Pelaksanaan"
                                    id="target_year"
                                    type="text"
                                    value={data.target_year}
                                    onChange={(e) => setData('target_year', e.target.value)}
                                    className="text-xs py-2"
                                    error={errors.target_year}
                                />

                                <Input
                                    label="Luas Area"
                                    id="area_size"
                                    type="number"
                                    step="0.01"
                                    suffix="m²"
                                    value={data.area_size}
                                    onChange={(e) => setData('area_size', parseFloat(e.target.value) || 0)}
                                    className="text-xs py-2 font-mono"
                                    error={errors.area_size}
                                />
                            </div>

                            {/* Potensi Kenaikan / Proteksi RTH */}
                            <Input
                                label={
                                    data.pillar_type === 'conservation'
                                        ? 'Proporsi Proteksi RTH Kampus'
                                        : 'Potensi Kontribusi Kenaikan RTH Kampus'
                                }
                                id="potential_gain_percent"
                                type="number"
                                step="0.01"
                                suffix="%"
                                value={data.potential_gain_percent}
                                onChange={(e) => setData('potential_gain_percent', parseFloat(e.target.value) || 0)}
                                className="text-xs py-2 font-mono"
                                error={errors.potential_gain_percent}
                                helperText={
                                    data.pillar_type !== 'conservation' &&
                                    campusAnalysis &&
                                    !campusAnalysis.is_achieved &&
                                    campusAnalysis.gap_area_size > 0 &&
                                    data.area_size > 0
                                        ? (data.area_size / campusAnalysis.gap_area_size) >= 1
                                            ? `🎯 Rencana seluas ${formatArea(data.area_size)} ini berpotensi menutup 100% defisit RTH kampus (target 30% terpenuhi).`
                                            : `🎯 Rencana seluas ${formatArea(data.area_size)} ini berpotensi menutup ${((data.area_size / campusAnalysis.gap_area_size) * 100).toFixed(1)}% defisit RTH kampus.`
                                        : undefined
                                }
                            />

                            {/* Deskripsi */}
                            <Textarea
                                label="Deskripsi & Rencana Tindakan"
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="text-xs py-2 resize-none"
                                error={errors.description}
                            />

                            {/* Catatan Internal */}
                            <Input
                                label="Catatan Administrator"
                                id="notes"
                                type="text"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="text-xs py-2"
                            />
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
