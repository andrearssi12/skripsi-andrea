import { useState } from 'react';
import { useForm, Head, Link, router } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDate, getFeedbackStatusBadge } from '@/lib/utils';
import { ArrowLeft, MessageSquare, Trash2, CheckCircle2, Clock, Check, User, MapPin } from 'lucide-react';

export default function FeedbackShow({ feedback, isAdmin, canManage = false, isOwner = false }) {
    const { patch, processing } = useForm();
    const isManager = isAdmin || canManage;
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleStatusChange = (newStatus) => {
        router.patch(`/feedback/${feedback.id}/status`, { status: newStatus }, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/feedback/${feedback.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteConfirm(false);
            },
        });
    };

    const mapUrl = feedback.land_use
        ? `/map?campus_id=${feedback.land_use.campus_id}&land_use_id=${feedback.land_use.id}&feedback_id=${feedback.id}`
        : `/map?campus_id=${feedback.land_use?.campus_id || ''}`;

    return (
        <>
            <Head title={`Detail Feedback: ${feedback.title}`} />

            <div className="max-w-3xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/feedback" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="page-title text-xl">Detail Laporan / Feedback</h1>
                            <p className="page-subtitle">ID Laporan #{feedback.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tombol Lihat di Peta & Zoom ke Lokasi */}
                        <Link
                            href={mapUrl}
                            className="btn btn-secondary btn-sm flex items-center gap-1.5 font-bold"
                            title="Buka peta dan zoom ke lokasi laporan ini"
                        >
                            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Lihat di Peta</span>
                        </Link>

                        {isAdmin && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus
                            </Button>
                        )}
                    </div>
                </div>

                <div className="card p-6 space-y-6">
                    {/* Status and Title */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className={`badge ${getFeedbackStatusBadge(feedback.status)} text-xs font-bold`}>
                                Status: {feedback.status}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">{formatDate(feedback.created_at)}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 font-display">{feedback.title}</h2>
                    </div>

                    {/* Sender and Object info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500 dark:text-slate-400 flex-shrink-0" />
                            <div>
                                <span className="text-gray-400 dark:text-slate-500 block">Pelapor:</span>
                                <span className="font-semibold text-gray-800 dark:text-slate-200">
                                    {feedback.user?.name || 'Civitas UAD'}
                                    {(isManager || isOwner) && feedback.user?.email ? ` (${feedback.user.email})` : ''}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <span className="text-gray-400 dark:text-slate-500 block">Objek Terkait:</span>
                                {feedback.land_use ? (
                                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                        <span className="font-semibold text-gray-800 dark:text-slate-200">
                                            {feedback.land_use.name} ({feedback.land_use.campus?.name})
                                        </span>
                                        <Link
                                            href={mapUrl}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            <span>Zoom di Peta</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <span className="font-semibold text-gray-700 dark:text-slate-300">Laporan Umum Kampus</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Isi Laporan / Pesan</h3>
                        <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-gray-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-700/60">
                            {feedback.message}
                        </p>
                    </div>

                    {/* Image Attachment if any */}
                    {feedback.image && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Foto Lampiran</h3>
                            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 max-w-md">
                                <img
                                    src={`/storage/${feedback.image}`}
                                    alt="Foto Lampiran Feedback"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Admin & Pengurus Status Management Action */}
                    {isManager && (
                        <div className="pt-5 border-t border-gray-100 dark:border-slate-800 space-y-3">
                            <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                Perbarui Status Tindak Lanjut
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant={feedback.status === 'Menunggu' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handleStatusChange('Menunggu')}
                                    disabled={feedback.status === 'Menunggu'}
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    Tandai Menunggu
                                </Button>
                                <Button
                                    type="button"
                                    variant={feedback.status === 'Diproses' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handleStatusChange('Diproses')}
                                    disabled={feedback.status === 'Diproses'}
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    Tandai Sedang Diproses
                                </Button>
                                <Button
                                    type="button"
                                    variant={feedback.status === 'Selesai' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handleStatusChange('Selesai')}
                                    disabled={feedback.status === 'Selesai'}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Tandai Selesai
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Hapus Data Feedback"
                message="Apakah Anda yakin ingin menghapus feedback ini secara permanen?"
                confirmLabel="Ya, Hapus Feedback"
                isLoading={isDeleting}
            />
        </>
    );
}

