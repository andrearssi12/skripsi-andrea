import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
    History, ArrowLeft, Search, CheckCircle2, Trash2,
    Clock, ArrowRight, ShieldAlert, User
} from 'lucide-react';

const ACTION_LABELS = {
    status_changed: { label: 'Perubahan Status', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' },
    deleted:        { label: 'Dihapus Admin',    icon: Trash2, color: 'text-red-600 dark:text-red-400',   bg: 'bg-red-50 dark:bg-red-950/60'   },
};

const STATUS_COLORS = {
    'Menunggu': 'badge-warning',
    'Diproses': 'badge-info',
    'Selesai':  'badge-success',
};

function StatusBadge({ status }) {
    if (!status) return <span className="text-gray-400 dark:text-slate-500 text-xs italic">—</span>;
    return (
        <span className={`badge ${STATUS_COLORS[status] || 'badge-secondary'} text-xs`}>
            {status}
        </span>
    );
}

export default function FeedbackHistory({ histories, filters = {}, isAdmin, canManage = false }) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const isManager = isAdmin || canManage;

    const handleFilter = (params = {}) => {
        router.get('/feedback/history', { search, action, ...params }, { preserveState: true });
    };

    return (
        <>
            <Head title="Riwayat Feedback - Web GIS UAD" />

            <div className="space-y-5">

                {/* Header */}
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <Link href="/feedback" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="page-title">
                                {isManager ? 'Riwayat Semua Feedback' : 'Riwayat Feedback Saya'}
                            </h1>
                            <p className="page-subtitle">
                                {isManager
                                    ? 'Rekam jejak perubahan status dan penghapusan feedback oleh admin/pengurus'
                                    : 'Rekam jejak tindakan yang dilakukan pada laporan yang Anda kirimkan'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Cari judul laporan..."
                                className="form-input pl-9 py-2 text-xs"
                            />
                        </div>
                        <select
                            value={action}
                            onChange={(e) => {
                                setAction(e.target.value);
                                handleFilter({ action: e.target.value });
                            }}
                            className="form-select py-2 text-xs sm:w-48"
                        >
                            <option value="">Semua Aksi</option>
                            <option value="status_changed">Perubahan Status</option>
                            <option value="deleted">Dihapus Admin</option>
                        </select>
                        <button
                            onClick={() => handleFilter()}
                            className="btn btn-secondary btn-sm"
                        >
                            Cari
                        </button>
                    </div>
                </div>

                {/* List */}
                {histories.data.length === 0 ? (
                    <div className="card">
                        <EmptyState
                            icon={History}
                            title="Belum ada riwayat"
                            description="Riwayat akan muncul ketika admin atau pengurus mengubah status atau menghapus laporan Anda."
                        />
                    </div>
                ) : (
                    <div className="card divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden">
                        {histories.data.map((item) => {
                            const meta = ACTION_LABELS[item.action] || ACTION_LABELS.status_changed;
                            const ActionIcon = meta.icon;

                            return (
                                <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    {/* Icon */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                                        <ActionIcon className={`w-4 h-4 ${meta.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        {/* Judul Feedback */}
                                        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
                                            {item.feedback_title}
                                        </p>

                                        {/* Aksi */}
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className={`font-medium ${meta.color}`}>
                                                {meta.label}
                                            </span>

                                            {/* Status change arrow */}
                                            {item.action === 'status_changed' && (
                                                <div className="flex items-center gap-1.5">
                                                    <StatusBadge status={item.old_status} />
                                                    <ArrowRight className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                                                    <StatusBadge status={item.new_status} />
                                                </div>
                                            )}

                                            {item.action === 'deleted' && (
                                                <span className="text-gray-500 dark:text-slate-400 italic">
                                                    (Status terakhir: {item.old_status || '—'})
                                                </span>
                                            )}
                                        </div>

                                        {/* Aktor & Waktu */}
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 dark:text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <ShieldAlert className="w-3 h-3" />
                                                Oleh: <span className="font-medium text-gray-600 dark:text-slate-300 ml-0.5">
                                                    {item.actor?.name || 'Admin'}
                                                </span>
                                                {item.actor?.role && (
                                                    <span className="text-gray-400 dark:text-slate-500">
                                                        ({item.actor.role === 'admin' ? 'Administrator' : 'Pengurus'})
                                                    </span>
                                                )}
                                            </span>

                                            {/* Tampilkan pemilik laporan — hanya untuk manager */}
                                            {isManager && item.user && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Pelapor: <span className="font-medium text-gray-600 dark:text-slate-300 ml-0.5">{item.user.name}</span>
                                                </span>
                                            )}

                                            <span>{formatDate(item.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Status result badge on right */}
                                    {item.action === 'status_changed' && item.new_status === 'Selesai' && (
                                        <div className="flex-shrink-0">
                                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Selesai
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <Pagination data={histories} />
            </div>
        </>
    );
}

