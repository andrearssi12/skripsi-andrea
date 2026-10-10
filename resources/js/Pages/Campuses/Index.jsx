import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/Components/PageHeader";
import FilterBar from "@/Components/FilterBar";
import DataTable from "@/Components/DataTable";
import { formatArea } from "@/lib/utils";
import { Building2, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";

export default function CampusIndex({ campuses, filters = {} }) {
    const [search, setSearch] = useState(filters.search || "");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get("/campuses", { search }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.delete(`/campuses/${deleteTarget.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Kampus - Web GIS UAD" />

            <div className="space-y-5">

                <PageHeader
                    title="Manajemen Data Kampus"
                    description="Kelola informasi lokasi, luas total, dan batas wilayah kampus UAD"
                    actions={
                        <Link href="/campuses/create">
                            <Button variant="primary">
                                <Plus className="w-4 h-4" />
                                Tambah Kampus
                            </Button>
                        </Link>
                    }
                />

                {/* Search Bar */}
                <FilterBar onSubmit={handleSearch}>
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau kode kampus..."
                            className="form-input pl-9 py-2 text-sm w-full"
                        />
                    </div>
                    <Button type="submit" variant="secondary" size="sm">
                        Cari
                    </Button>
                </FilterBar>

                {/* Data Table */}
                <div className="card overflow-hidden">
                    <DataTable
                        columns={[
                            { key: "code", label: "Kode",
                              render: (row) => (
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                    {row.code}
                                </span>
                              ),
                            },
                            { key: "name", label: "Nama Kampus",
                              render: (row) => (
                                <span className="font-bold text-gray-900 dark:text-slate-100">
                                    {row.name}
                                </span>
                              ),
                            },
                            { key: "total_area", label: "Total Luas",
                              render: (row) => (
                                <span className="font-medium">{formatArea(row.total_area)}</span>
                              ),
                            },
                            { key: "land_uses_count", label: "Jumlah Objek Lahan",
                              render: (row) => (
                                <span className="badge badge-slate">{row.land_uses_count || 0} Objek</span>
                              ),
                            },
                            { key: "address", label: "Alamat",
                              render: (row) => (
                                <span className="text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate">
                                    {row.address || "-"}
                                </span>
                              ),
                            },
                            { key: "actions", label: "Aksi", className: "text-right",
                              render: (row) => (
                                <div className="flex items-center justify-end gap-1">
                                    <Link
                                        href={`/campuses/${row.id}`}
                                        className="btn btn-ghost btn-sm p-1.5 text-gray-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                                        title="Detail"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={`/campuses/${row.id}/edit`}
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
                        rows={campuses.data}
                        emptyState={
                            <EmptyState
                                icon={Building2}
                                title="Belum ada data kampus"
                                description="Tambahkan data kampus baru untuk memulai pemetaan spasial."
                                action={{
                                    label: "Tambah Kampus Pertama",
                                    onClick: () => router.get("/campuses/create"),
                                }}
                            />
                        }
                    />
                    <Pagination data={campuses} />
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Data Kampus"
                message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Seluruh data spasial yang tertaut akan terpengaruh.`}
                confirmLabel="Ya, Hapus Kampus"
                isLoading={isDeleting}
            />
        </>
    );
}

