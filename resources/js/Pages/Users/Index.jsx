import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/Components/PageHeader";
import FilterBar from "@/Components/FilterBar";
import DataTable from "@/Components/DataTable";
import { formatDate } from "@/lib/utils";
import {
    Users, Plus, Search, Shield, UserCheck, GraduationCap,
    FileSpreadsheet, Mail, Calendar, Edit, Trash2,
} from "lucide-react";

const ROLE_META = {
    admin: {
        label: "Administrator",
        classes: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
        icon: Shield,
    },
    pengurus: {
        label: "Pengurus Lingkungan",
        classes: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: UserCheck,
    },
    user: {
        label: "Civitas Academica",
        classes: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: GraduationCap,
    },
};

function getRoleMeta(role) {
    return ROLE_META[role] || ROLE_META.user;
}

export default function UserIndex({ users, filters = {}, stats = {} }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    const [search, setSearch] = useState(filters.search || "");
    const [role, setRole] = useState(filters.role || "");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilter = (newSearch = search, newRole = role) => {
        router.get("/users", { search: newSearch, role: newRole }, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilter(search, role);
    };

    const handleRoleChange = (e) => {
        const val = e.target.value;
        setRole(val);
        handleFilter(search, val);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.delete(`/users/${deleteTarget.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Pengguna - Web GIS UAD" />

            <div className="space-y-6">

                <PageHeader
                    title="Manajemen Data Pengguna"
                    description="Kelola akun Administrator, Pengurus Lingkungan Kampus, dan Civitas Academica"
                    actions={
                        <>
                            <Link href="/users/batch">
                                <Button variant="secondary">
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Tambah User Batch</span>
                                </Button>
                            </Link>
                            <Link href="/users/create">
                                <Button variant="primary">
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah User</span>
                                </Button>
                            </Link>
                        </>
                    }
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Pengguna</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{stats.total || 0}</p>
                        </div>
                    </div>

                    <div className="card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Administrator</p>
                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{stats.admin || 0}</p>
                        </div>
                    </div>

                    <div className="card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Pengurus Lingkungan</p>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pengurus || 0}</p>
                        </div>
                    </div>

                    <div className="card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Civitas Academica</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.user || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <FilterBar onSubmit={handleSearchSubmit}>
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau email pengguna..."
                            className="form-input pl-9 py-2 text-sm w-full"
                        />
                    </div>

                    <select
                        value={role}
                        onChange={handleRoleChange}
                        className="form-select py-2 text-sm sm:w-56"
                    >
                        <option value="">Semua Role Pengguna</option>
                        <option value="admin">Administrator</option>
                        <option value="pengurus">Pengurus Lingkungan</option>
                        <option value="user">Civitas Academica</option>
                    </select>

                    <Button type="submit" variant="secondary" size="sm">
                        Cari
                    </Button>
                </FilterBar>

                {/* Table */}
                <div className="card overflow-hidden">
                    <DataTable
                        columns={[
                            { key: "user", label: "Pengguna",
                              render: (row) => {
                                const isSelf = row.id === currentUserId;
                                return (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-gray-700 dark:text-slate-200 text-sm flex-shrink-0">
                                            {row.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-slate-100">
                                                    {row.name}
                                                </span>
                                                {isSelf && (
                                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded-full">
                                                        Anda
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 sm:hidden">
                                                <Mail className="w-3 h-3" />
                                                {row.email}
                                            </span>
                                        </div>
                                    </div>
                                );
                              },
                            },
                            { key: "email", label: "Email",
                              render: (row) => (
                                <span className="font-mono text-xs">{row.email}</span>
                              ),
                            },
                            { key: "role", label: "Role Akses",
                              render: (row) => {
                                const meta = getRoleMeta(row.role);
                                const Icon = meta.icon;
                                return (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.classes}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {meta.label}
                                    </span>
                                );
                              },
                            },
                            { key: "created_at", label: "Tanggal Bergabung",
                              render: (row) => (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    {formatDate(row.created_at)}
                                </div>
                              ),
                            },
                            { key: "actions", label: "Aksi", className: "text-right",
                              render: (row) => {
                                const isSelf = row.id === currentUserId;
                                return (
                                    <div className="flex items-center justify-end gap-1">
                                        <Link
                                            href={`/users/${row.id}/edit`}
                                            className="btn btn-ghost btn-sm p-1.5 text-gray-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400"
                                            title="Edit Pengguna"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(row)}
                                            disabled={isSelf}
                                            className={`btn btn-ghost btn-sm p-1.5 ${isSelf ? "text-gray-300 dark:text-slate-700 cursor-not-allowed" : "text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"}`}
                                            title={isSelf ? "Tidak dapat menghapus akun Anda sendiri" : "Hapus Pengguna"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                              },
                            },
                        ]}
                        rows={users.data}
                        emptyState={
                            <EmptyState
                                icon={Users}
                                title="Tidak ditemukan data pengguna"
                                description="Belum ada data pengguna yang sesuai dengan kata kunci atau filter yang Anda pilih."
                                action={{
                                    label: "Tambah Pengguna Baru",
                                    onClick: () => router.get("/users/create"),
                                }}
                            />
                        }
                    />
                    <Pagination data={users} />
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Data Pengguna"
                message={`Apakah Anda yakin ingin menghapus akun "${deleteTarget?.name}" (${deleteTarget?.email})? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus Pengguna"
                isLoading={isDeleting}
            />
        </>
    );
}
