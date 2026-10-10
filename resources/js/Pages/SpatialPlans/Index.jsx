import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Button from "@/components/ui/Button";

import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FilterTabs from "@/components/common/FilterTabs";
import { formatArea, formatDate } from "@/lib/utils";
import {
    Compass,
    Plus,
    Search,
    Building2,
    MapPin,
    CheckCircle2,
    Clock,
    ShieldCheck,
    Trash2,
    Edit3,
    Eye,
    ArrowRight,
    Sparkles,
    Filter,
} from "lucide-react";

const PILLAR_LABELS = {
    conservation: { label: "Konservasi Prioritas", color: "badge-green" },
    revitalization: { label: "Revitalisasi Vegetasi", color: "badge-amber" },
    rth_conversion: { label: "Konversi RTH Baru", color: "badge-emerald" },
    green_roof: { label: "Green Roof / Vertical", color: "badge-info" },
    canopy_tree: { label: "Pohon Peneduh / Koridor", color: "badge-lime" },
    green_corridor: { label: "Koridor Hijau Kampus", color: "badge-teal" },
};

export default function SpatialPlansIndex({
    plans = { data: [] },
    counts = {},
    campuses = [],
    filters = {},
    isAdmin = false,
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [campusId, setCampusId] = useState(filters.campus_id || "");
    const [statusTab, setStatusTab] = useState(filters.status || "all");
    const [deletePlan, setDeletePlan] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilter = (params = {}) => {
        const nextStatus =
            "status" in params
                ? params.status
                : statusTab !== "all"
                  ? statusTab
                  : undefined;
        const nextCampus =
            "campus_id" in params ? params.campus_id : campusId || undefined;
        const nextSearch =
            "search" in params ? params.search : search || undefined;

        router.get(
            route("spatial-plans.index"),
            {
                search: nextSearch,
                campus_id: nextCampus,
                status: nextStatus,
            },
            { preserveState: true },
        );
    };

    const handleToggleApprove = (e, planId, targetStatus = null) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(
            route("spatial-plans.approve", planId),
            targetStatus ? { status: targetStatus } : {},
            { preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (!deletePlan) return;
        setIsDeleting(true);
        router.delete(route("spatial-plans.destroy", deletePlan.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeletePlan(null);
            },
        });
    };

    return (
        <>
            <Head title="Rencana Pengembangan Spasial - Web GIS UAD" />

            <div className="space-y-6">

                {/* Header Section */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title flex items-center gap-2">
                            <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <span>Rencana Pengembangan Kawasan Hijau</span>
                        </h1>
                        <p className="page-subtitle">
                            {isAdmin
                                ? "Rancang, gambar polygon interaktif, sesuaikan luasan rekomendasi sistem, dan setujui (ACC) rencana masa depan"
                                : "Daftar rencana tata ruang hijau resmi kampus yang telah disetujui untuk pengembangan masa depan"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/map">
                            <Button variant="secondary" size="sm">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span>Lihat di Peta WebGIS</span>
                            </Button>
                        </Link>

                        {isAdmin && (
                            <Link href={route("spatial-plans.create")}>
                                <Button variant="primary" size="sm">
                                    <Plus className="w-4 h-4" />
                                    <span>Buat Rencana Baru</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Status Tabs for Admin */}
                {isAdmin && (
                    <FilterTabs
                        className="w-fit text-xs font-semibold"
                        items={[
                            {
                                key: "all",
                                label: "Semua Rencana",
                                count: counts.all ?? 0,
                            },
                            {
                                key: "approved",
                                label: "Disetujui (Publik)",
                                count: counts.approved ?? 0,
                            },
                            {
                                key: "draft",
                                label: "Draft Internal",
                                count: counts.draft ?? 0,
                            },
                            {
                                key: "implemented",
                                label: "Terimplementasi",
                                count: counts.implemented ?? 0,
                            },
                        ]}
                        value={statusTab}
                        onChange={(key) => {
                            setStatusTab(key);
                            handleFilter({
                                status: key !== "all" ? key : undefined,
                            });
                        }}
                    />
                )}

                {/* Filters Form */}
                <div className="card p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleFilter();
                        }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul, pilar rencana, atau deskripsi..."
                                className="form-input pl-9 py-2 text-xs"
                            />
                        </div>

                        <select
                            value={campusId}
                            onChange={(e) => {
                                setCampusId(e.target.value);
                                handleFilter({
                                    campus_id: e.target.value || undefined,
                                });
                            }}
                            className="form-select py-2 text-xs sm:w-56"
                        >
                            <option value="">Semua Kampus</option>
                            {campuses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <Button type="submit" variant="secondary" size="sm">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Plans Grid */}
                {plans.data.length === 0 ? (
                    <div className="card">
                        <EmptyState
                            icon={Compass}
                            title="Belum ada rencana spasial"
                            description={
                                isAdmin
                                    ? "Belum ada rencana spasial yang dibuat atau sesuai dengan filter saat ini. Anda dapat menggambar polygon baru atau mengambil rekomendasi AI."
                                    : "Belum ada rencana spasial yang disetujui (ACC) oleh pihak kampus untuk ditampilkan."
                            }
                            action={
                                isAdmin
                                    ? {
                                          label: "Buat Rencana Pertama",
                                          onClick: () =>
                                              router.get(
                                                  route("spatial-plans.create"),
                                              ),
                                      }
                                    : undefined
                            }
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {plans.data.map((plan) => {
                            const pillarMeta = PILLAR_LABELS[
                                plan.pillar_type
                            ] || {
                                label: plan.pillar_type,
                                color: "badge-secondary",
                            };
                            const isApproved = plan.status === "approved";
                            const isDraft = plan.status === "draft";
                            const isImplemented = plan.status === "implemented";

                            return (
                                <div
                                    key={plan.id}
                                    className="card p-5 hover:border-emerald-300 dark:hover:border-slate-700 hover:shadow-card-hover transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        {/* Badges row */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span
                                                className={`badge ${pillarMeta.color} text-[11px]`}
                                            >
                                                {pillarMeta.label}
                                            </span>

                                            <div className="flex items-center gap-1.5">
                                                {isApproved && (
                                                    <span className="badge badge-success text-[10px] flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Disetujui</span>
                                                    </span>
                                                )}
                                                {isDraft && (
                                                    <span className="badge badge-warning text-[10px] flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Draft</span>
                                                    </span>
                                                )}
                                                {isImplemented && (
                                                    <span className="badge badge-info text-[10px] flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        <span>Terlaksana</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <Link
                                            href={route(
                                                "spatial-plans.show",
                                                plan.id,
                                            )}
                                            className="block group"
                                        >
                                            <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {plan.title}
                                            </h3>
                                        </Link>

                                        {/* Description */}
                                        {plan.description && (
                                            <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {plan.description}
                                            </p>
                                        )}

                                        {/* Metadata */}
                                        <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-800/60 text-xs space-y-1 text-gray-600 dark:text-slate-400">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>
                                                        {plan.campus?.name}
                                                    </span>
                                                </span>
                                                <span className="font-semibold text-gray-800 dark:text-slate-200">
                                                    {formatArea(plan.area_size)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px]">
                                                <span>Target Pelaksanaan:</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    {plan.target_year ||
                                                        "Belum diatur"}
                                                </span>
                                            </div>

                                            {plan.potential_gain_percent >
                                                0 && (
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span>
                                                        Potensi Kenaikan RTH:
                                                    </span>
                                                    <span className="font-bold text-sky-600 dark:text-sky-400">
                                                        +
                                                        {
                                                            plan.potential_gain_percent
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action footer */}
                                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/map?campus_id=${plan.campus_id}`}
                                                className="btn btn-ghost btn-sm px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-1"
                                                title="Lihat di Peta WebGIS"
                                            >
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">
                                                    Peta
                                                </span>
                                            </Link>

                                            <Link
                                                href={route(
                                                    "spatial-plans.show",
                                                    plan.id,
                                                )}
                                                className="btn btn-ghost btn-sm px-2 py-1 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-1"
                                                title="Buka Detail Rencana"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Detail</span>
                                            </Link>
                                        </div>

                                        {/* Admin specific action buttons */}
                                        {isAdmin && (
                                            <div className="flex items-center gap-1">
                                                {/* Status Action Buttons */}
                                                {isDraft && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleToggleApprove(
                                                                e,
                                                                plan.id,
                                                                "approved",
                                                            )
                                                        }
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-emerald-600 hover:text-white"
                                                        title="Klik untuk menyetujui (ACC) dan publikasikan"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>ACC</span>
                                                    </button>
                                                )}

                                                {isApproved && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={(e) =>
                                                                handleToggleApprove(
                                                                    e,
                                                                    plan.id,
                                                                    "implemented",
                                                                )
                                                            }
                                                            className="px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white border border-sky-200 dark:border-sky-800"
                                                            title="Tandai rencana telah selesai dibangun / terimplementasi fisik"
                                                        >
                                                            <ShieldCheck className="w-3 h-3" />
                                                            <span>Selesai</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) =>
                                                                handleToggleApprove(
                                                                    e,
                                                                    plan.id,
                                                                    "draft",
                                                                )
                                                            }
                                                            className="px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600"
                                                            title="Batalkan ACC dan kembalikan ke draft"
                                                        >
                                                            <span>
                                                                Batal ACC
                                                            </span>
                                                        </button>
                                                    </>
                                                )}

                                                {isImplemented && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleToggleApprove(
                                                                e,
                                                                plan.id,
                                                                "approved",
                                                            )
                                                        }
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 hover:bg-emerald-600 hover:text-white"
                                                        title="Kembalikan status menjadi Approved (dalam perencanaan aktif)"
                                                    >
                                                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                                                        <span>Terlaksana</span>
                                                    </button>
                                                )}

                                                {/* Edit */}
                                                <Link
                                                    href={route(
                                                        "spatial-plans.edit",
                                                        plan.id,
                                                    )}
                                                    className="btn btn-ghost btn-sm p-1.5 text-gray-500 hover:text-emerald-600"
                                                    title="Edit Rencana & Gambar Geometri"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Link>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeletePlan(plan)
                                                    }
                                                    className="btn btn-ghost btn-sm p-1.5 text-gray-500 hover:text-red-600"
                                                    title="Hapus Rencana"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Pagination data={plans} />
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deletePlan)}
                onClose={() => setDeletePlan(null)}
                onConfirm={handleDelete}
                title="Hapus Rencana Spasial"
                message={`Apakah Anda yakin ingin menghapus rencana "${deletePlan?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus Rencana"
                isLoading={isDeleting}
            />
        </>
    );
}

