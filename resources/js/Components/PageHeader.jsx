import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

/**
 * PageHeader — Komponen header halaman terpadu.
 *
 * Props:
 *  - title       : string  — judul halaman
 *  - description : string  — subjudul / keterangan singkat (opsional)
 *  - icon        : LucideIcon — ikon di sebelah kiri judul (opsional)
 *  - backHref    : string  — URL tombol kembali (opsional, muncul di kiri)
 *  - backLabel   : string  — label tooltip tombol kembali (default: "Kembali")
 *  - actions     : ReactNode — tombol-tombol aksi di kanan (opsional)
 */
export default function PageHeader({
    title,
    description,
    icon: Icon,
    backHref,
    backLabel = "Kembali",
    actions,
}) {
    return (
        <div className="page-header">
            <div className="flex items-center gap-3">
                {backHref && (
                    <Link
                        href={backHref}
                        className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400"
                        title={backLabel}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                )}
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        {Icon && (
                            <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span>{title}</span>
                    </h1>
                    {description && <p className="page-subtitle">{description}</p>}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-2">{actions}</div>
            )}
        </div>
    );
}
