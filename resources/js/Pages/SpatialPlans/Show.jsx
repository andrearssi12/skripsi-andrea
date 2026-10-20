import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatArea, formatDate } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Compass, ArrowLeft, MapPin, Building2, CheckCircle2,
    Clock, ShieldCheck, Edit3, Trash2, Calendar, Target,
    Sparkles, UserCheck, Layers
} from 'lucide-react';

const PILLAR_LABELS = {
    conservation: { label: 'Konservasi Prioritas', color: 'badge-green', desc: 'Area hijau bernilai tinggi yang wajib dilindungi dari alih fungsi terbangun.' },
    revitalization: { label: 'Revitalisasi Vegetasi', color: 'badge-amber', desc: 'Area hijau yang membutuhkan peremajaan, penyulaman tanaman, atau perbaikan kondisi fisik.' },
    rth_conversion: { label: 'Konversi RTH Baru', color: 'badge-emerald', desc: 'Lahan terbuka / perkerasan yang dialihfungsikan menjadi ruang terbuka hijau bervegetasi.' },
    green_roof: { label: 'Green Roof / Vertical', color: 'badge-info', desc: 'Pemanfaatan atap atau fasad dinding gedung kampus untuk taman atap dan vegetasi vertikal.' },
    canopy_tree: { label: 'Pohon Peneduh / Koridor', color: 'badge-lime', desc: 'Penanaman pohon berkanopi lebar untuk menurunkan suhu mikro dan menyerap polusi.' },
    green_corridor: { label: 'Koridor Hijau Kampus', color: 'badge-teal', desc: 'Jalur hijau pejalan kaki terhubung antar fasilitas kampus.' },
};

export default function SpatialPlansShow({
    plan,
    planGeoJson = null,
    campusBoundary = null,
    campusAnalysis = null,
    isAdmin = false,
}) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const pillarMeta = PILLAR_LABELS[plan.pillar_type] || { label: plan.pillar_type, color: 'badge-secondary', desc: '' };
    const isApproved = plan.status === 'approved';
    const isDraft = plan.status === 'draft';
    const isImplemented = plan.status === 'implemented';

    // Preview Map initialization
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [-7.8332, 110.3831],
            zoom: 17,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 22,
            maxNativeZoom: 19,
        }).addTo(map);

        // Campus boundary
        if (campusBoundary) {
            L.geoJSON(campusBoundary, {
                style: {
                    color: '#6366f1',
                    weight: 2,
                    dashArray: '5, 5',
                    fillColor: '#818cf8',
                    fillOpacity: 0.05,
                },
            }).addTo(map);
        }

        // Plan Polygon
        if (planGeoJson) {
            const planLayer = L.geoJSON(planGeoJson, {
                style: {
                    color: '#0284c7',
                    weight: 3.5,
                    dashArray: '5, 5',
                    fillColor: '#38bdf8',
                    fillOpacity: 0.5,
                },
                onEachFeature: (feature, layer) => {
                    layer.bindTooltip(`<b>${plan.title}</b><br>${formatArea(plan.area_size)}`, {
                        sticky: true,
                        className: 'leaflet-tooltip-custom',
                    });
                },
            }).addTo(map);

            const bounds = planLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 });
            }
        }

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [planGeoJson, campusBoundary, plan]);

    const handleToggleApprove = (targetStatus = null) => {
        router.post(route('spatial-plans.approve', plan.id), targetStatus ? { status: targetStatus } : {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('spatial-plans.destroy', plan.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteConfirm(false);
            },
        });
    };

    return (
        <>
            <Head title={`Detail Rencana: ${plan.title} - Web GIS UAD`} />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('spatial-plans.index')} className="btn btn-ghost btn-sm p-2 text-gray-500">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`badge ${pillarMeta.color} text-xs font-semibold`}>
                                    {pillarMeta.label}
                                </span>
                                {isApproved && (
                                    <span className="badge badge-success text-[11px] flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Disetujui Pimpinan</span>
                                    </span>
                                )}
                                {isDraft && (
                                    <span className="badge badge-warning text-[11px] flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Draft Internal</span>
                                    </span>
                                )}
                                {isImplemented && (
                                    <span className="badge badge-info text-[11px] flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        <span>Telah Terimplementasi</span>
                                    </span>
                                )}
                            </div>
                            <h1 className="page-title text-xl mt-1">{plan.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`/map?campus_id=${plan.campus_id}`}
                            className="btn btn-secondary btn-sm flex items-center gap-1.5 font-bold"
                        >
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span>Buka di Peta WebGIS</span>
                        </Link>

                        {isAdmin && (
                            <>
                                {isDraft && (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleToggleApprove('approved')}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>ACC / Setujui Rencana</span>
                                    </Button>
                                )}

                                {isApproved && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleToggleApprove('implemented')}
                                            className="border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50"
                                        >
                                            <ShieldCheck className="w-4 h-4 text-sky-600" />
                                            <span>Tandai Terimplementasi</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleToggleApprove('draft')}
                                        >
                                            <span>Kembalikan ke Draft</span>
                                        </Button>
                                    </>
                                )}

                                {isImplemented && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleToggleApprove('approved')}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Kembalikan ke Status Approved</span>
                                    </Button>
                                )}

                                <Link href={route('spatial-plans.edit', plan.id)}>
                                    <Button variant="secondary" size="sm">
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </Button>
                                </Link>

                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setDeleteConfirm(true)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* 2-Column Details: Info + Preview Map */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Info Column (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="card p-4 text-center">
                                <span className="text-[11px] text-gray-500 dark:text-slate-400 block font-medium">Luas Rencana</span>
                                <span className="text-base font-bold text-gray-900 dark:text-slate-100 mt-0.5 block font-mono">
                                    {formatArea(plan.area_size)}
                                </span>
                            </div>

                            <div className="card p-4 text-center">
                                <span className="text-[11px] text-gray-500 dark:text-slate-400 block font-medium">Target Pelaksanaan</span>
                                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                    {plan.target_year || '—'}
                                </span>
                            </div>

                            <div className="card p-4 text-center">
                                <span className="text-[11px] text-gray-500 dark:text-slate-400 block font-medium">
                                    {plan.pillar_type === 'conservation' ? 'Proteksi RTH' : 'Potensi Tambahan RTH'}
                                </span>
                                <span className="text-base font-bold text-sky-600 dark:text-sky-400 mt-0.5 block font-mono">
                                    {plan.pillar_type === 'conservation'
                                        ? `${plan.potential_gain_percent || 0}% Kampus`
                                        : `+${plan.potential_gain_percent || 0}%`}
                                </span>
                            </div>
                        </div>

                        {/* Campus RTH Target & Deficit Context */}
                        {campusAnalysis && (
                            <div className="card p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/50 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Konteks Target 30% RTH Kampus ({plan.campus?.name})
                                    </span>
                                    <span className={`badge text-[10px] ${campusAnalysis.is_achieved ? 'badge-green' : 'badge-amber'}`}>
                                        {campusAnalysis.is_achieved ? 'Target 30% Terpenuhi' : `Defisit ${campusAnalysis.gap_percentage}%`}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 block">RTH Kampus Saat Ini</span>
                                        <span className="font-bold text-gray-900 dark:text-slate-100">{campusAnalysis.green_percentage}%</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400 block">({formatArea(campusAnalysis.green_area_size)})</span>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 block">Target Minimum 30%</span>
                                        <span className="font-bold text-gray-900 dark:text-slate-100">30.0%</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400 block">({formatArea(campusAnalysis.target_area)})</span>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 block">Defisit RTH</span>
                                        <span className={`font-bold ${campusAnalysis.is_achieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {campusAnalysis.is_achieved ? '0 m²' : formatArea(campusAnalysis.gap_area_size)}
                                        </span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400 block">
                                            {campusAnalysis.is_achieved ? 'Standar terpenuhi' : `Kurang ${campusAnalysis.gap_percentage}%`}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed">
                                    {plan.pillar_type === 'conservation' ? (
                                        <>Rencana konservasi ini memproteksi <strong>{formatArea(plan.area_size)}</strong> kawasan hijau ({plan.potential_gain_percent}% luas kampus) agar tidak terjadi degradasi atau alih fungsi ke area terbangun.</>
                                    ) : !campusAnalysis.is_achieved && campusAnalysis.gap_area_size > 0 ? (
                                        (plan.area_size / campusAnalysis.gap_area_size) >= 1 ? (
                                            <>Dengan luasan <strong>{formatArea(plan.area_size)}</strong> (+{plan.potential_gain_percent}%), rencana ini berpotensi <strong>menutup 100% defisit RTH kampus</strong> (target 30% langsung tercapai).</>
                                        ) : (
                                            <>Dengan luasan <strong>{formatArea(plan.area_size)}</strong> (+{plan.potential_gain_percent}%), rencana ini berpotensi menutup <strong>{((plan.area_size / campusAnalysis.gap_area_size) * 100).toFixed(1)}%</strong> dari total defisit RTH kampus.</>
                                        )
                                    ) : (
                                        <>Rencana ini berkontribusi menambah <strong>{formatArea(plan.area_size)}</strong> (+{plan.potential_gain_percent}%) kawasan hijau untuk memperkuat ketahanan ekologis kampus.</>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Description & Action Plan */}
                        <div className="card p-6 space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Deskripsi & Rencana Aksi
                                </h3>
                                <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-gray-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-700/60">
                                    {plan.description || 'Tidak ada deskripsi detail tambahan untuk rencana ini.'}
                                </p>
                            </div>

                            {pillarMeta.desc && (
                                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                                    <span className="font-bold flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                        Fokus Pilar: {pillarMeta.label}
                                    </span>
                                    <p className="opacity-90">{pillarMeta.desc}</p>
                                </div>
                            )}

                            {/* Location & Object info */}
                            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-gray-400 dark:text-slate-500 block">Lokasi Kampus:</span>
                                    <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                        {plan.campus?.name}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-gray-400 dark:text-slate-500 block">Objek Terkait:</span>
                                    <span className="font-semibold text-gray-800 dark:text-slate-200 block mt-0.5">
                                        {plan.land_use ? plan.land_use.name : 'Area Rencana Mandiri'}
                                    </span>
                                </div>
                            </div>

                            {/* Approval metadata */}
                            {plan.approved_by_user && (
                                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700 text-xs flex items-center gap-2.5">
                                    <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <div>
                                        <span className="text-gray-400 dark:text-slate-500">Disetujui oleh:</span>{' '}
                                        <strong className="text-gray-800 dark:text-slate-200">{plan.approved_by_user.name}</strong>
                                        {plan.approved_at && (
                                            <span className="text-gray-400 dark:text-slate-500 ml-1">
                                                pada {formatDate(plan.approved_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {isAdmin && plan.notes && (
                                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                                    <span className="font-bold block mb-1">Catatan Internal Administrator:</span>
                                    <p>{plan.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Preview Map Column (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-xs text-gray-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Peta Lokasi & Geometri Rencana</span>
                                </h3>
                                <span className="text-[11px] text-gray-400">
                                    {planGeoJson ? 'Polygon Terdefinisi' : 'Belum Ada Geometri'}
                                </span>
                            </div>

                            <div
                                ref={mapContainerRef}
                                style={{ height: '360px' }}
                                className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-inner"
                            />

                            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded bg-sky-400/50 border border-sky-500 border-dashed" />
                                    <span>Polygon Rencana Masa Depan</span>
                                </div>
                                <Link
                                    href={`/map?campus_id=${plan.campus_id}`}
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                                >
                                    Buka Peta Penuh →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Hapus Rencana Spasial"
                message={`Apakah Anda yakin ingin menghapus rencana "${plan.title}"?`}
                confirmLabel="Ya, Hapus Rencana"
                isLoading={isDeleting}
            />
        </>
    );
}

