import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import PageHeader from '@/Components/PageHeader';
import DrawingMap from '@/Components/map/DrawingMap';
import { formatArea } from '@/lib/utils';
import {
    Compass, Save, CheckCircle2, Sparkles,
    Edit3, Info, Layers
} from 'lucide-react';

const PILLAR_OPTIONS = [
    { value: 'conservation', label: 'Zona Konservasi Prioritas (Wajib Dipertahankan)' },
    { value: 'rth_conversion', label: 'Konversi Menjadi RTH Baru (Ground Level)' },
    { value: 'revitalization', label: 'Revitalisasi & Intensifikasi Kualitas Vegetasi' },
    { value: 'green_roof', label: 'Green Roof / Vertical Garden Bangunan' },
    { value: 'canopy_tree', label: 'Pohon Peneduh / Buffer Kanopi Area Terbuka' },
    { value: 'green_corridor', label: 'Koridor Hijau & Jalur Pedestrian Kampus' },
];

export default function SpatialPlansCreate({
    campuses = [],
    selectedCampusId,
    campusAnalysis = null,
    recommendationItems = [],
}) {
    const [selectedCampus, setSelectedCampus] = useState(
        campuses.find(c => c.id === selectedCampusId) || campuses[0] || null
    );

    const [inputMode, setInputMode] = useState('custom_draw'); // 'custom_draw' | 'from_recommendation'
    const [selectedRecIndex, setSelectedRecIndex] = useState('');
    const [activeGeometry, setActiveGeometry] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        campus_id: selectedCampus?.id || '',
        land_use_id: '',
        title: '',
        pillar_type: 'rth_conversion',
        description: '',
        target_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 2}`,
        area_size: 0,
        potential_gain_percent: 0,
        status: 'draft',
        notes: '',
        geometry: null,
    });

    // When campus changes, update selection and URL to reload recommendation items
    const handleCampusChange = (cId) => {
        const c = campuses.find(item => String(item.id) === String(cId));
        if (c) {
            setSelectedCampus(c);
            setData('campus_id', c.id);
            router.get(route('spatial-plans.create'), { campus_id: c.id }, { preserveState: true });
        }
    };

    // Callback when geometry changes on DrawingMap
    const handleGeometryChange = (geometry, calculatedArea) => {
        setActiveGeometry(geometry);
        setData(prev => {
            const campusArea = selectedCampus?.total_area || 0;
            const gain = (campusArea > 0 && calculatedArea > 0)
                ? Math.round((calculatedArea / campusArea) * 10000) / 100
                : 0;

            return {
                ...prev,
                geometry,
                area_size: calculatedArea,
                potential_gain_percent: gain,
            };
        });
    };

    // Handle selection from system recommendation dropdown
    const handleSelectRecommendation = (e) => {
        const indexStr = e.target.value;
        setSelectedRecIndex(indexStr);

        if (indexStr === '') return;

        const rec = recommendationItems[parseInt(indexStr, 10)];
        if (!rec) return;

        // Find associated land use geometry if any
        let geom = null;
        if (selectedCampus?.land_uses) {
            const lu = selectedCampus.land_uses.find(l => l.id === rec.id);
            if (lu?.geometry) {
                geom = typeof lu.geometry === 'string' ? JSON.parse(lu.geometry) : lu.geometry;
            }
        }

        setActiveGeometry(geom);

        const campusArea = selectedCampus?.total_area || 0;
        const gain = rec.potential_gain_percent || (campusArea > 0 && rec.area_size > 0
            ? Math.round((rec.area_size / campusArea) * 10000) / 100
            : 0);

        setData(prev => ({
            ...prev,
            land_use_id: rec.id || '',
            title: rec.action_title || `Rencana ${rec.name}`,
            pillar_type: rec.pillar_type || prev.pillar_type,
            description: rec.action_benefit || rec.action_description || rec.description || '',
            area_size: rec.area_size || 0,
            potential_gain_percent: gain,
            geometry: geom,
        }));
    };

    const handleSubmit = (targetStatus) => {
        if (targetStatus) {
            setData('status', targetStatus);
            data.status = targetStatus;
        }
        post(route('spatial-plans.store'));
    };

    return (
        <>
            <Head title="Buat Rencana Spasial Baru - Web GIS UAD" />

            <div className="space-y-5">
                {/* Header */}
                <PageHeader
                    title="Buat Rencana Pengembangan Spasial Baru"
                    description="Gambar polygon rencana baru di peta atau ambil dari rekomendasi AI sistem lalu edit luasan"
                    backHref={route('spatial-plans.index')}
                    actions={
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={processing}
                                onClick={() => handleSubmit('draft')}
                            >
                                <Save className="w-4 h-4" />
                                <span>Simpan Draft</span>
                            </Button>

                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={processing}
                                onClick={() => handleSubmit('approved')}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Simpan & ACC</span>
                            </Button>
                        </>
                    }
                />

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Form (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="card p-5 space-y-4">
                            <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-slate-800">
                                <Compass className="w-4 h-4 text-emerald-600" />
                                <span>Konfigurasi & Metadata Rencana</span>
                            </h2>

                            {/* Pilih Kampus */}
                            <div>
                                <Select
                                    label="Lokasi Kampus"
                                    id="campus_id"
                                    value={data.campus_id}
                                    onChange={(e) => handleCampusChange(e.target.value)}
                                    placeholder={false}
                                    className="text-xs py-2"
                                    error={errors.campus_id}
                                >
                                    {campuses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </Select>

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

                            {/* Pilihan Metode Geometri */}
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-gray-200/60 dark:border-slate-700/60">
                                <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 block">
                                    Metode Penentuan Geometri Lahan:
                                </span>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInputMode('custom_draw');
                                            setData('land_use_id', '');
                                        }}
                                        className={`p-2 rounded-lg border text-left font-medium transition-all ${
                                            inputMode === 'custom_draw'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <Edit3 className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                                        <span>Gambar Bebas di Peta</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setInputMode('from_recommendation')}
                                        className={`p-2 rounded-lg border text-left font-medium transition-all ${
                                            inputMode === 'from_recommendation'
                                                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-800 dark:text-sky-300 font-bold'
                                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5 mb-1 text-sky-600" />
                                        <span>Ambil Rekomendasi AI</span>
                                    </button>
                                </div>

                                {/* Dropdown Rekomendasi Sistem jika mode recommendation aktif */}
                                {inputMode === 'from_recommendation' && (
                                    <div className="pt-2 space-y-1">
                                        <Select
                                            label={`Pilih Objek Rekomendasi Sistem (${recommendationItems.length} opsi tersedia):`}
                                            id="rec_select"
                                            value={selectedRecIndex}
                                            onChange={handleSelectRecommendation}
                                            placeholder="-- Pilih dari Rekomendasi AI --"
                                            className="text-xs py-2 border-sky-300 dark:border-sky-800"
                                            helperText="Geometri objek ini akan dimuat otomatis ke peta di sebelah kanan. Anda dapat mengedit batas luasan polygon sesuai kebutuhan."
                                        >
                                            {recommendationItems.map((rec, idx) => (
                                                <option key={idx} value={idx}>
                                                    [{rec.group_label}] {rec.name} ({formatArea(rec.area_size)})
                                                </option>
                                            ))}
                                        </Select>
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
                                placeholder="Contoh: Konversi Plaza Parkir Timur Menjadi Taman Kanopi"
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
                                    placeholder="2026-2028"
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
                                placeholder="Jelaskan tujuan pengembangan, jenis vegetasi yang akan ditanam, atau instalasi yang direncanakan..."
                                className="text-xs py-2 resize-none"
                                error={errors.description}
                            />

                            {/* Catatan Internal */}
                            <Input
                                label="Catatan Administrator (Opsional)"
                                id="notes"
                                type="text"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Catatan anggaran, izin pimpinan, dll..."
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
                                    <span>Peta Gambar & Penyesuaian Geometri</span>
                                </h2>
                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                    Kampus: <strong>{selectedCampus?.name}</strong>
                                </span>
                            </div>

                            {/* DrawingMap Component */}
                            <DrawingMap
                                campus={selectedCampus}
                                landUses={selectedCampus?.land_uses || []}
                                initialGeometry={activeGeometry}
                                onGeometryChange={handleGeometryChange}
                                height="540px"
                            />

                            {/* Bottom note */}
                            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                                <div>
                                    <p className="font-semibold">Kemudahan Fleksibilitas Editor:</p>
                                    <p className="text-[11px] opacity-90 leading-relaxed">
                                        Anda dapat menggambar polygon baru secara bebas, atau memilih rekomendasi sistem lalu menggeser titik-titik polygon di peta untuk memotong atau memperluas cakupan area rencana. Luas area akan terkalkulasi secara instan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
