import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Button from "@/Components/ui/Button";
import Pagination from "@/Components/ui/Pagination";
import ConfirmDialog from "@/Components/ui/ConfirmDialog";
import EmptyState from "@/Components/ui/EmptyState";
import PageHeader from "@/Components/PageHeader";
import DataTable from "@/Components/DataTable";
import FilterTabs from "@/Components/common/FilterTabs";
import { formatArea, formatDate, getConditionBadge, getGreenStatusBadge } from "@/lib/utils";
import { TreePine, Plus, Search, Upload, RotateCcw, Eye, Edit, Trash2, Archive, RotateCw } from "lucide-react";

export default function LandUseIndex({
    landUses,
    campuses = [],
    categories = [],
    counts = {},
    filters: initialFilters = {},
}) {
    const [statusTab, setStatusTab] = useState(initialFilters.status || "active");
    const [filters, setFilters] = useState({
        search: initialFilters.search || "",
        campus_id: initialFilters.campus_id || "",
        category_id: initialFilters.category_id || "",
        green_status: initialFilters.green_status || "",
        condition: initialFilters.condition || "",
    });

    const [archiveTarget, setArchiveTarget] = useState(null);
    const [restoreTarget, setRestoreTarget] = useState(null);
    const [forceDeleteTarget, setForceDeleteTarget] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get("/land-uses", { ...filters, status: statusTab }, { preserveState: true });
    };

    const handleTabChange = (newStatus) => {
        setStatusTab(newStatus);
        router.get("/land-uses", { ...filters, status: newStatus }, { preserveState: true });
    };

    const handleReset = () => {
        const resetFilters = {
            search: "",
            campus_id: "",
            category_id: "",
            green_status: "",
            condition: "",
        };
        setFilters(resetFilters);
        router.get("/land-uses", { status: statusTab }, { preserveState: true });
    };

    const handleArchive = () => {
        if (!archiveTarget) return;
        setActionLoading(true);
        router.delete(`/land-uses/${archiveTarget.id}`, {
            onFinish: () => {
                setActionLoading(false);
                setArchiveTarget(null);
            },
        });
    };

    const handleRestore = () => {
        if (!restoreTarget) return;
        setActionLoading(true);
        router.post(`/land-uses/${restoreTarget.id}/restore`, {}, {
            onFinish: () => {
                setActionLoading(false);
                setRestoreTarget(null);
            },
        });
    };

    const handleForceDelete = () => {
        if (!forceDeleteTarget) return;
        setActionLoading(true);
        router.delete(`/land-uses/${forceDeleteTarget.id}/force-delete`, {
            onFinish: () => {
                setActionLoading(false);
                setForceDeleteTarget(null);
            },
        });
    };

    const isArchivedTab = statusTab === "archived";

    const statusTabs = [
        {
            key: "active",
            label: "Aset Aktif",
            count: counts.active ?? 0,
            activeClass: "bg-emerald-600 text-white",
        },
        {
            key: "archived",
            label: "Arsip & Riwayat",
            count: counts.archived ?? 0,
            activeClass: "bg-amber-600 text-white",
        },
    ];

    return (
        <>
            <Head title="Data Penggunaan Lahan - Web GIS UAD" />

            <div className="space-y-5">
                <PageHeader
                    title="Data Penggunaan Lahan (Spasial)"
                    description="Kelola seluruh poligon objek kampus, zonasi hijau, atribut luas, dan riwayat arsip"
                    actions={
                        <>
                            <Link href="/land-uses/import">
                                <Button variant="secondary">
                                    <Upload className="w-4 h-4" />
                                    Import GeoJSON
                                </Button>
                            </Link>
                            <Link href="/land-uses/create">
                                <Button variant="primary">
                                    <Plus className="w-4 h-4" />
                                    Tambah Objek Lahan
                                </Button>
                            </Link>
                        </>
                    }
                />

                {/* Status Tabs (Aset Aktif vs Arsip & Riwayat) */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <FilterTabs
                        items={statusTabs}
                        value={statusTab}
                        onChange={handleTabChange}
                        className="w-full sm:w-auto"
                    />

                    {isArchivedTab && (
                        <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                            <Archive className="w-4 h-4" />
                            <span>Menampilkan aset-aset lahan yang telah diarsipkan. Anda dapat memulihkannya kembali kapan saja.</span>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="card p-4 space-y-3">
                    <form
                        onSubmit={handleFilterSubmit}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
                    >
                        <div className="relative lg:col-span-2">
                            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Cari nama atau kode objek..."
                                className="form-input pl-9 py-2 text-xs"
                            />
                        </div>

                        <select
                            value={filters.campus_id}
                            onChange={(e) => setFilters({ ...filters, campus_id: e.target.value })}
                            className="form-select py-2 text-xs"
                        >
                            <option value="">Semua Kampus</option>
                            {campuses.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            value={filters.category_id}
                            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                            className="form-select py-2 text-xs"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            value={filters.green_status}
                            onChange={(e) => setFilters({ ...filters, green_status: e.target.value })}
                            className="form-select py-2 text-xs"
                        >
                            <option value="">Semua Zonasi</option>
                            <option value="Green Area">Green Area (RTH)</option>
                            <option value="Vegetasi Non-RTH">Vegetasi Non-RTH</option>
                            <option value="Non-Green Area">Non-Green Area</option>
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
                    <DataTable
                        columns={[
                            { key: "code", label: "Kode",
                              render: (row) => (
                                <span className="font-semibold text-xs text-gray-500 dark:text-slate-400 font-mono">
                                    {row.code || "-"}
                                </span>
                              ),
                            },
                            { key: "name", label: "Nama Objek",
                              render: (row) => (
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-slate-100 leading-snug">
                                        {row.name}
                                    </div>
                                    {row.parent && (
                                        <span className="text-[11px] text-gray-400 dark:text-slate-500">
                                            Bagian dari: {row.parent.name}
                                        </span>
                                    )}
                                </div>
                              ),
                            },
                            { key: "category", label: "Kategori",
                              render: (row) => (
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: row.category?.color || "#64748b" }}
                                    />
                                    {row.category?.name || "-"}
                                </span>
                              ),
                            },
                            { key: "campus", label: "Kampus",
                              render: (row) => (
                                <span className="text-xs text-gray-600 dark:text-slate-400 truncate max-w-[140px]">
                                    {row.campus?.name || "-"}
                                </span>
                              ),
                            },
                            { key: "area_size", label: "Luas",
                              render: (row) => (
                                <span className="font-semibold text-gray-800 dark:text-slate-200">
                                    {formatArea(row.area_size)}
                                </span>
                              ),
                            },
                            { key: "green_status", label: "Status Zonasi",
                              render: (row) => (
                                <span className={`badge ${getGreenStatusBadge(row.green_status)} text-xs`}>
                                    {row.green_status}
                                </span>
                              ),
                            },
                            { key: "condition", label: "Kondisi",
                              render: (row) => (
                                <span className={`badge ${getConditionBadge(row.condition)} text-xs`}>
                                    {row.condition}
                                </span>
                              ),
                            },
                            ...(isArchivedTab ? [
                                {
                                    key: "deleted_at",
                                    label: "Waktu Diarsipkan",
                                    render: (row) => (
                                        <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                            {formatDate(row.deleted_at)}
                                        </span>
                                    ),
                                }
                            ] : []),
                            { key: "actions", label: "Aksi", className: "text-right",
                              render: (row) => (
                                <div className="flex items-center justify-end gap-1">
                                    {!isArchivedTab ? (
                                        <>
                                            <Link
                                                href={`/land-uses/${row.id}`}
                                                className="btn btn-ghost btn-sm p-1.5 text-gray-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                                                title="Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/land-uses/${row.id}/edit`}
                                                className="btn btn-ghost btn-sm p-1.5 text-gray-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setArchiveTarget(row)}
                                                className="btn btn-ghost btn-sm p-1.5 text-gray-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400"
                                                title="Arsipkan"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setRestoreTarget(row)}
                                                className="btn btn-ghost btn-sm p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                                                title="Pulihkan dari Arsip"
                                            >
                                                <RotateCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForceDeleteTarget(row)}
                                                className="btn btn-ghost btn-sm p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                title="Hapus Permanen"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                              ),
                            },
                        ]}
                        rows={landUses.data}
                        emptyState={
                            <EmptyState
                                icon={TreePine}
                                title={isArchivedTab ? "Belum ada aset lahan yang diarsipkan" : "Tidak ada data objek lahan"}
                                description={
                                    isArchivedTab
                                        ? "Semua data penggunaan lahan masih aktif dan belum ada yang masuk ke arsip riwayat."
                                        : "Gunakan tombol Tambah Objek atau Import GeoJSON untuk memasukkan data spasial."
                                }
                                action={
                                    !isArchivedTab
                                        ? {
                                              label: "Tambah Objek Lahan",
                                              onClick: () => router.get("/land-uses/create"),
                                          }
                                        : undefined
                                }
                            />
                        }
                    />
                    <Pagination data={landUses} />
                </div>
            </div>

            {/* Modal Konfirmasi Arsip */}
            <ConfirmDialog
                isOpen={Boolean(archiveTarget)}
                onClose={() => setArchiveTarget(null)}
                onConfirm={handleArchive}
                title="Arsipkan Objek Lahan"
                message={`Apakah Anda yakin ingin mengarsipkan aset "${archiveTarget?.name}"? Objek ini akan dipindahkan ke tab Arsip & Riwayat dan tidak ditampilkan di peta aktif.`}
                confirmLabel="Arsipkan"
                confirmVariant="danger"
                isLoading={actionLoading}
            />

            {/* Modal Konfirmasi Pulihkan */}
            <ConfirmDialog
                isOpen={Boolean(restoreTarget)}
                onClose={() => setRestoreTarget(null)}
                onConfirm={handleRestore}
                title="Pulihkan Objek Lahan"
                message={`Apakah Anda ingin mengaktifkan kembali aset "${restoreTarget?.name}" ke peta spasial kampus?`}
                confirmLabel="Pulihkan Aset"
                confirmVariant="primary"
                isLoading={actionLoading}
            />

            {/* Modal Konfirmasi Hapus Permanen */}
            <ConfirmDialog
                isOpen={Boolean(forceDeleteTarget)}
                onClose={() => setForceDeleteTarget(null)}
                onConfirm={handleForceDelete}
                title="Hapus Permanen Objek Lahan"
                message={`PERINGATAN: Tindakan ini tidak dapat dibatalkan. Objek "${forceDeleteTarget?.name}" akan dihapus permanen dari basis data.`}
                confirmLabel="Hapus Permanen"
                confirmVariant="danger"
                isLoading={actionLoading}
            />
        </>
    );
}
