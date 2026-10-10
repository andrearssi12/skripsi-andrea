import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { ClipboardList, Search, Filter, RotateCcw, User, ShieldCheck } from 'lucide-react';

export default function ActivityLogIndex({
    logs,
    users = [],
    modules = [],
    actions = [],
    filters: initialFilters = {},
}) {
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        user_id: initialFilters.user_id || '',
        module: initialFilters.module || '',
        action: initialFilters.action || '',
        date: initialFilters.date || '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get('/activity-logs', filters, { preserveState: true });
    };

    const handleReset = () => {
        const reset = { search: '', user_id: '', module: '', action: '', date: '' };
        setFilters(reset);
        router.get('/activity-logs', {}, { preserveState: true });
    };

    const getActionBadge = (act) => {
        switch (act) {
            case 'create':
            case 'import':
                return 'badge-green';
            case 'update':
                return 'badge-blue';
            case 'delete':
                return 'badge-red';
            case 'login':
            case 'logout':
                return 'badge-amber';
            default:
                return 'badge-slate';
        }
    };

    return (
        <>
            <Head title="Activity Log - Web GIS UAD" />

            <div className="space-y-5">

                <div className="page-header">
                    <div>
                        <h1 className="page-title">Activity Log & Audit Trail</h1>
                        <p className="page-subtitle">Rekam jejak aktivitas pengguna, autentikasi, dan modifikasi data spasial kampus</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Cari keterangan aktivitas..."
                                className="form-input pl-9 py-2 text-xs"
                            />
                        </div>

                        <select
                            value={filters.user_id}
                            onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                            className="form-select py-2 text-xs"
                        >
                            <option value="">Semua Pengguna</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>

                        <select
                            value={filters.module}
                            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                            className="form-select py-2 text-xs"
                        >
                            <option value="">Semua Modul</option>
                            {modules.map((m, i) => (
                                <option key={i} value={m}>{m}</option>
                            ))}
                        </select>

                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="form-select py-2 text-xs"
                        >
                            <option value="">Semua Aksi</option>
                            {actions.map((a, i) => (
                                <option key={i} value={a}>{a}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <Button type="submit" variant="secondary" size="sm" className="flex-1">
                                Filter
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={handleReset} title="Reset">
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {logs.data.length === 0 ? (
                        <EmptyState
                            icon={ClipboardList}
                            title="Belum ada catatan aktivitas"
                            description="Aktivitas penting sistem seperti login, pembuatan, dan pengubahan data akan tercatat di sini."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Waktu</th>
                                        <th>Pengguna</th>
                                        <th>Aksi</th>
                                        <th>Modul</th>
                                        <th>Keterangan Aktivitas</th>
                                        <th>IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="font-semibold text-gray-900 dark:text-slate-100 text-xs">
                                                {log.user ? (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                                                        {log.user.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-slate-500 italic">Sistem</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${getActionBadge(log.action)} text-[10px] uppercase font-mono`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-slate text-[10px] font-mono">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="text-xs text-gray-800 dark:text-slate-300 max-w-md">
                                                {log.description}
                                            </td>
                                            <td className="text-xs text-gray-400 dark:text-slate-500 font-mono">
                                                {log.ip_address || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination data={logs} />
                </div>
            </div>
        </>
    );
}

