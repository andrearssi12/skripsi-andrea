import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Button from "@/components/ui/Button";

import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/Components/PageHeader";
import FeedbackCard from "@/Components/FeedbackCard";
import {
    MessageSquare,
    Plus,
    Search,
    Users,
    User,
    History,
} from "lucide-react";

export default function FeedbackIndex({
    feedback,
    filters = {},
    counts = {},
    isAdmin,
    canManage = false,
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [scope, setScope] = useState(filters.scope || "all");
    const isManager = isAdmin || canManage;

    const handleFilter = (params = {}) => {
        router.get(
            "/feedback",
            { search, status, scope, ...params },
            { preserveState: true },
        );
    };

    const handleScopeChange = (newScope) => {
        setScope(newScope);
        router.get(
            "/feedback",
            { search, status, scope: newScope },
            { preserveState: true },
        );
    };

    const handleQuickStatus = (e, fbId, newStatus) => {
        e.preventDefault();
        e.stopPropagation();
        router.patch(
            `/feedback/${fbId}/status`,
            { status: newStatus },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head
                title={
                    isManager
                        ? "Manajemen Feedback - Web GIS UAD"
                        : "Feedback Saya - Web GIS UAD"
                }
            />

            <div className="space-y-5">

                <PageHeader
                    title={
                        isManager
                            ? "Manajemen Laporan & Feedback Civitas"
                            : "Laporan & Feedback Saya"
                    }
                    description={
                        isManager
                            ? "Tinjau dan tindak lanjuti aspirasi civitas akademika terkait kondisi kawasan hijau kampus"
                            : "Daftar laporan yang pernah Anda kirimkan terkait kondisi kawasan kampus"
                    }
                    actions={
                        <>
                            <Link href="/feedback/history">
                                <Button variant="secondary" size="sm">
                                    <History className="w-4 h-4" />
                                    Riwayat
                                </Button>
                            </Link>
                            <Link href="/feedback/create">
                                <Button variant="primary">
                                    <Plus className="w-4 h-4" />
                                    Kirim Feedback Baru
                                </Button>
                            </Link>
                        </>
                    }
                />

                {/* Scope Tabs — hanya untuk Admin/Pengurus */}
                {isManager && (
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
                        <button
                            onClick={() => handleScopeChange("all")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                scope === "all"
                                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
                                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Semua Laporan
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    scope === "all"
                                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                                        : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                                }`}
                            >
                                {counts.all ?? "—"}
                            </span>
                        </button>
                        <button
                            onClick={() => handleScopeChange("my")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                scope === "my"
                                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
                                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                            }`}
                        >
                            <User className="w-4 h-4" />
                            Laporan Saya
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    scope === "my"
                                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                                        : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                                }`}
                            >
                                {counts.my ?? "—"}
                            </span>
                        </button>
                    </div>
                )}

                {/* Filters */}
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
                                placeholder="Cari judul atau isi feedback..."
                                className="form-input pl-9 py-2 text-xs"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilter({ status: e.target.value });
                            }}
                            className="form-select py-2 text-xs sm:w-48"
                        >
                            <option value="">Semua Status</option>
                            <option value="Menunggu">Menunggu</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                        </select>

                        <Button type="submit" variant="secondary" size="sm">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Cards Grid */}
                {feedback.data.length === 0 ? (
                    <div className="card">
                        <EmptyState
                            icon={MessageSquare}
                            title={
                                scope === "my"
                                    ? "Anda belum memiliki laporan"
                                    : "Belum ada feedback"
                            }
                            description={
                                scope === "my"
                                    ? "Anda belum pernah mengirimkan laporan atau feedback."
                                    : "Kirimkan laporan kondisi kawasan atau usulan penataan hijau kampus."
                            }
                            action={{
                                label: "Kirim Feedback",
                                onClick: () => router.get("/feedback/create"),
                            }}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {feedback.data.map((fb) => (
                            <FeedbackCard
                                key={fb.id}
                                feedback={fb}
                                isManager={isManager}
                                onQuickStatus={handleQuickStatus}
                            />
                        ))}
                    </div>
                )}

                <Pagination data={feedback} />
            </div>
        </>
    );
}

