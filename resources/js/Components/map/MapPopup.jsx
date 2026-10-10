import { useState } from 'react';
import { X, MessageSquare, Calendar, User, ExternalLink, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { router, usePage, Link } from '@inertiajs/react';
import { formatArea } from '@/lib/utils';

const statusColor = {
    'Green Area': 'badge-green',
    'Vegetasi Non-RTH': 'badge-lime',
    'Non-Green Area': 'badge-slate',
};

const conditionColor = {
    'Baik': 'badge-green',
    'Sedang': 'badge-amber',
    'Kurang': 'badge-red',
};

const FEEDBACK_STATUS = {
    'Selesai': { label: 'Selesai', badge: 'badge-green' },
    'Resolved': { label: 'Selesai', badge: 'badge-green' },
    'Diproses': { label: 'Diproses', badge: 'badge-sky' },
    'Reviewed': { label: 'Diproses', badge: 'badge-sky' },
    'Pending': { label: 'Menunggu', badge: 'badge-amber' },
};

export default function MapPopup({ feature, onClose }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);

    if (!feature) return null;

    const feedbacks = feature.feedbacks || [];
    const feedbacksCount = feedbacks.length;

    const handleFeedback = () => {
        if (!user) {
            router.get('/login');
            return;
        }
        router.get('/feedback/create', { land_use_id: feature.id });
    };

    return (
        <div className="absolute top-4 right-4 z-[1050] w-80 sm:w-96 max-h-[calc(100vh-130px)] flex flex-col animate-fade-in pointer-events-auto">
            <div className="card shadow-modal border border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col overflow-hidden rounded-2xl">
                {/* Header */}
                <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: feature.category_color || '#64748b' }}
                            />
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">
                                {feature.category_name || 'Detail Lahan'}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-tight truncate" title={feature.name}>
                            {feature.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{feature.campus_name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors ml-2 flex-shrink-0 p-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-slate-700/60"
                        title="Tutup Popup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="px-4 py-3 space-y-3 overflow-y-auto max-h-[calc(100vh-230px)] text-xs">
                    {/* Key Attributes */}
                    <div className="space-y-2 pb-1 border-b border-gray-100 dark:border-slate-800">
                        <Row label="Luas Area" value={
                            <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{formatArea(feature.area_size)}</span>
                        } />
                        <Row label="Status RTH" value={
                            <span className={`badge ${statusColor[feature.green_status] || 'badge-slate'} text-[11px]`}>
                                {feature.green_status}
                            </span>
                        } />
                        <Row label="Kondisi" value={
                            <span className={`badge ${conditionColor[feature.condition] || 'badge-slate'} text-[11px]`}>
                                {feature.condition}
                            </span>
                        } />
                        {feature.parent_name && (
                            <Row label="Bagian dari" value={
                                <span className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{feature.parent_name}</span>
                            } />
                        )}
                    </div>

                    {/* Spatial Recommendation Directive (if present) */}
                    {(feature.zone_type || feature.intervention_title) && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                <span>{feature.zone_type === 'conservation' ? '🛡️ Zona Konservasi' : '🌿 Arahan Spasial'}</span>
                            </div>
                            <p className="text-[11px] font-semibold text-gray-800 dark:text-slate-200 leading-tight">
                                {feature.intervention_title || (feature.zone_type === 'conservation' ? 'Wajib Dipertahankan' : '')}
                            </p>
                            {feature.action_description && (
                                <p className="text-[10px] text-gray-600 dark:text-slate-300 leading-relaxed">
                                    {feature.action_description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Deskripsi */}
                    {feature.description && (
                        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed bg-gray-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            {feature.description}
                        </p>
                    )}

                    {/* ── SECTION: LAPORAN & FEEDBACK CIVITAS PADA LAYER INI ── */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>Laporan Civitas di Area Ini</span>
                            </span>
                            <span className={`badge ${feedbacksCount > 0 ? 'badge-amber font-bold' : 'badge-slate'} text-[10px]`}>
                                {feedbacksCount} Laporan
                            </span>
                        </div>

                        {feedbacksCount === 0 ? (
                            <div className="p-3 text-center rounded-xl bg-gray-50/70 dark:bg-slate-800/40 border border-dashed border-gray-200 dark:border-slate-700/60 space-y-1">
                                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                    Belum ada laporan dari civitas pada objek lahan ini.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                {feedbacks.map((fb) => {
                                    const st = FEEDBACK_STATUS[fb.status] || { label: fb.status || 'Menunggu', badge: 'badge-amber' };
                                    const isExpanded = expandedFeedbackId === fb.id;

                                    return (
                                        <div
                                            key={fb.id}
                                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200/80 dark:border-slate-700/60 space-y-1.5 transition-all"
                                        >
                                            {/* Header per feedback */}
                                            <div className="flex items-start justify-between gap-1.5">
                                                <h4 className="font-bold text-xs text-gray-900 dark:text-slate-100 leading-snug line-clamp-1 flex-1" title={fb.title}>
                                                    {fb.title}
                                                </h4>
                                                <span className={`badge ${st.badge} text-[9px] flex-shrink-0 py-0.5 px-1.5`}>
                                                    {st.label}
                                                </span>
                                            </div>

                                            {/* Reporter & Date */}
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1 truncate">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    {fb.user_name || 'Civitas UAD'}
                                                </span>
                                                <span className="flex items-center gap-1 flex-shrink-0">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    {fb.created_at}
                                                </span>
                                            </div>

                                            {/* Message text */}
                                            <div className="text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                                                <p className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}>
                                                    {fb.message}
                                                </p>
                                                {fb.message && fb.message.length > 90 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedFeedbackId(isExpanded ? null : fb.id)}
                                                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline mt-1 inline-block"
                                                    >
                                                        {isExpanded ? 'Sembunyikan ↑' : 'Selengkapnya ↓'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Photo Attachment preview if any */}
                                            {fb.image_url && (
                                                <a
                                                    href={fb.image_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline pt-0.5"
                                                >
                                                    <ImageIcon className="w-3 h-3" />
                                                    <span>Lihat Foto Bukti Terlampir</span>
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            )}

                                            {/* Direct Link to Ticket */}
                                            <div className="pt-1 flex justify-end">
                                                <Link
                                                    href={`/feedback/${fb.id}`}
                                                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                                                >
                                                    <span>Buka Tiket Laporan</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer action */}
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleFeedback}
                        className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-1.5 font-bold"
                    >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Kirim Masukan untuk Objek Ini</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400 flex-shrink-0">{label}</span>
            <div className="flex-1 text-right">{value}</div>
        </div>
    );
}
