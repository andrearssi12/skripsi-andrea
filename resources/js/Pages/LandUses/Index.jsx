import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/Components/PageHeader";
import DataTable from "@/Components/DataTable";
import { formatArea, getConditionBadge, getGreenStatusBadge } from "@/lib/utils";
import { TreePine, Plus, Search, Download, Upload, RotateCcw, Eye, Edit, Trash2 } from "lucide-react";

export default function LandUseIndex({
    landUses,
    campuses = [],
    categories = [],
    filters: initialFilters = {},
}) {
    const [filters, setFilters] = useState({
        search: initialFilters.search || "",
        campus_id: initialFilters.campus_id || "",
        category_id: initialFilters.category_id || "",
        green_status: initialFilters.green_status || "",
        condition: initialFilters.condition || "",
    });

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get("/land-uses", filters, { preserveState: true });
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
        router.get("/land-uses", {}, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.delete(`/land-uses/${deleteTarget.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Data Penggunaan Lahan - Web GIS UAD" />

            <div className="space-y-5">

                <PageHeader
                    title="Data Penggunaan Lahan (Spasial)"
                    description="Kelola seluruh poligon objek kampus, zonasi hijau, dan atribut luas"
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
                            { key: "actions", label: "Aksi", className: "text-right",
                              render: (row) => (
                                <div className="flex items-center justify-end gap-1">
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
                                        onClick={() => setDeleteTarget(row)}
                                        className="btn btn-ghost btn-sm p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                              ),
                            },
                        ]}
                        rows={landUses.data}
                        emptyState={
                            <EmptyState
                                icon={TreePine}
                                title="Tidak ada data objek lahan"
                                description="Gunakan tombol Tambah Objek atau Import GeoJSON untuk memasukkan data spasial."
                                action={{
                                    label: "Tambah Objek Lahan",
                                    onClick: () => router.get("/land-uses/create"),
                                }}
                            />
                        }
                    />
                    <Pagination data={landUses} />
                </div>
            </div>

            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Objek Lahan"
                message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Objek ini tidak akan ditampilkan lagi pada peta interaktif.`}
                confirmLabel="Hapus Objek"
                isLoading={isDeleting}
            />
        </>
    );
}
