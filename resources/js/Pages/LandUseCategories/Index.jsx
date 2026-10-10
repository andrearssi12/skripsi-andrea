import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import DataTable from '@/Components/DataTable';
import { Layers, Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function CategoryIndex({ categories, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/land-use-categories', { search }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.delete(`/land-use-categories/${deleteTarget.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Kategori Lahan - Web GIS UAD" />

            <div className="space-y-5">

                <div className="page-header">
                    <div>
                        <h1 className="page-title">Kategori Penggunaan Lahan</h1>
                        <p className="page-subtitle">Kelola klasifikasi dan skema warna poligon peta spasial</p>
                    </div>
                    <Link href="/land-use-categories/create">
                        <Button variant="primary">
                            <Plus className="w-4 h-4" />
                            Tambah Kategori
                        </Button>
                    </Link>
                </div>

                <div className="card p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama kategori..."
                                className="form-input pl-9 py-2 text-sm w-full"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Cari</Button>
                    </form>
                </div>

                <div className="card overflow-hidden">
                    <DataTable
                        columns={[
                            { key: "color", label: "Warna",
                              render: (row) => (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-5 h-5 rounded-md border border-gray-300 dark:border-slate-600 shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: row.color }}
                                    />
                                    <span className="text-xs font-mono text-gray-500 dark:text-slate-400">{row.color}</span>
                                </div>
                              ),
                            },
                            { key: "name", label: "Nama Kategori",
                              cellClassName: "font-bold text-gray-900 dark:text-slate-100",
                              render: (row) => row.name,
                            },
                            { key: "land_uses_count", label: "Jumlah Objek",
                              render: (row) => (
                                <span className="badge badge-slate">{row.land_uses_count || 0} Objek</span>
                              ),
                            },
                            { key: "description", label: "Deskripsi",
                              cellClassName: "text-xs text-gray-500 dark:text-slate-400 max-w-sm truncate",
                              render: (row) => row.description || '-',
                            },
                            { key: "actions", label: "Aksi", className: "text-right",
                              render: (row) => (
                                <div className="flex items-center justify-end gap-1">
                                    <Link
                                        href={`/land-use-categories/${row.id}/edit`}
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
                        rows={categories.data}
                        emptyState={
                            <EmptyState
                                icon={Layers}
                                title="Belum ada kategori"
                                description="Buat kategori pertama untuk mengelompokkan objek lahan pada peta."
                                action={{
                                    label: 'Tambah Kategori',
                                    onClick: () => router.get('/land-use-categories/create'),
                                }}
                            />
                        }
                    />
                    <Pagination data={categories} />
                </div>
            </div>

            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Kategori Lahan"
                message={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"? Kategori yang sedang digunakan tidak dapat dihapus.`}
                confirmLabel="Hapus Kategori"
                isLoading={isDeleting}
            />
        </>
    );
}
