import { useState, useEffect } from 'react';
import { X, MessageSquare, Calendar, User, ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

const STATUS_CONFIG = {
    'Selesai': {
        label: 'Selesai Ditindaklanjuti',
        badge: 'badge-green',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    'Resolved': {
        label: 'Selesai Ditindaklanjuti',
        badge: 'badge-green',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    'Diproses': {
        label: 'Sedang Ditindaklanjuti',
        badge: 'badge-sky',
        iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
    },
    'Reviewed': {
        label: 'Sedang Ditindaklanjuti',
        badge: 'badge-sky',
        iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
    },
    'Pending': {
        label: 'Menunggu Review',
        badge: 'badge-amber',
        iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    },
};

export default function FeedbackPopup({ feedback, onClose, onSelectLandUse = null }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reset index when active feedback object changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [feedback?.id]);

    if (!feedback) return null;

    const feedbacksList = feedback.feedbacks && feedback.feedbacks.length > 0 ? feedback.feedbacks : [feedback];
    const currentItem = feedbacksList[currentIndex] || feedback;
    const statusInfo = STATUS_CONFIG[currentItem.status] || STATUS_CONFIG['Pending'];

    return (
        <div className="absolute top-4 right-4 z-[1050] w-80 sm:w-96 animate-fade-in max-h-[calc(100vh-140px)] flex flex-col pointer-events-auto">
            <div className="card shadow-modal border border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col overflow-hidden rounded-2xl">
                {/* Header */}
                <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${statusInfo.iconBg}`}>
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                                    Laporan Civitas Kampus
                                </span>
                                {feedbacksList.length > 1 && (
                                    <span className="badge badge-amber text-[9px] font-bold py-0 px-1.5">
                                        {feedbacksList.length} Laporan
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-tight line-clamp-1" title={currentItem.title}>
                                {currentItem.title}
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                                {currentItem.land_use_name || 'Laporan Umum'} {currentItem.campus_name ? `• ${currentItem.campus_name}` : ''}
                            </p>
                        </div>
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

                {/* Multi-feedback Navigation Switcher */}
                {feedbacksList.length > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/60 text-xs">
                        <span className="font-semibold text-amber-800 dark:text-amber-300 text-[11px]">
                            Laporan ke-{currentIndex + 1} dari {feedbacksList.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                                title="Laporan Sebelumnya"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 px-1.5">
                                {currentIndex + 1} / {feedbacksList.length}
                            </span>
                            <button
                                type="button"
                                disabled={currentIndex === feedbacksList.length - 1}
                                onClick={() => setCurrentIndex(i => Math.min(feedbacksList.length - 1, i + 1))}
                                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                                title="Laporan Berikutnya"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Body (scrollable) */}
                <div className="px-4 py-3 space-y-3 overflow-y-auto max-h-[50vh] text-xs">
                    {/* Key Attributes */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-500 dark:text-slate-400 flex-shrink-0">Status Tiket</span>
                            <span className={`badge ${statusInfo.badge} text-[11px]`}>
                                {statusInfo.label}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-500 dark:text-slate-400 flex-shrink-0">Pelapor</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200 truncate flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                {currentItem.user_name || 'Civitas UAD'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-500 dark:text-slate-400 flex-shrink-0">Waktu Lapor</span>
                            <span className="text-gray-700 dark:text-slate-300 flex items-center gap-1 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {currentItem.created_at || 'Baru saja'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-500 dark:text-slate-400 flex-shrink-0">Titik Objek</span>
                            <span className="text-gray-800 dark:text-slate-200 font-semibold truncate flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                {currentItem.land_use_name || 'Kawasan Kampus'}
                            </span>
                        </div>
                    </div>

                    {/* Image Attachment Preview */}
                    {currentItem.image_url && (
                        <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Foto Bukti / Kondisi
                            </span>
                            <a
                                href={currentItem.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 group relative shadow-xs"
                                title="Klik untuk membuka foto ukuran penuh"
                            >
                                <img
                                    src={currentItem.image_url}
                                    alt={currentItem.title}
                                    className="w-full max-h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                    <ExternalLink className="w-3.5 h-3.5" /> Lihat Ukuran Penuh
                                </div>
                            </a>
                        </div>
                    )}

                    {/* Message Aspirasi */}
                    <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                            Isi Masukan / Usulan
                        </span>
                        <div className="p-3 rounded-xl bg-gray-50/90 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 text-xs text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {currentItem.message}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center gap-2">
                    {onSelectLandUse && currentItem.land_use_id && (
                        <button
                            type="button"
                            onClick={() => onSelectLandUse(currentItem.land_use_id)}
                            className="btn btn-secondary btn-sm w-full sm:w-auto flex-1 flex items-center justify-center gap-1 text-[11px] font-bold"
                        >
                            <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Detail Lahan</span>
                        </button>
                    )}
                    {currentItem.id && (
                        <Link
                            href={`/feedback/${currentItem.id}`}
                            className="btn btn-primary btn-sm w-full sm:w-auto flex-1 flex items-center justify-center gap-1 text-[11px] font-bold shadow-xs"
                        >
                            <span>Buka Laporan</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
