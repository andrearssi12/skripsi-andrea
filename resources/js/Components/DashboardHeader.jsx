import React from "react";

export default function DashboardHeader({
    campuses = [],
    selectedCampusId,
    onCampusChange,
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="page-title text-2xl font-display">
                    Dashboard Admin Green Campus
                </h1>
                <p className="page-subtitle text-xs">
                    Sistem Monitoring GIS, Simulasi Zonasi, dan Perencanaan
                    Kawasan Hijau UAD
                </p>
            </div>
            {campuses.length > 0 && (
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Wilayah Kampus:
                    <select
                        value={selectedCampusId || ""}
                        onChange={(event) => onCampusChange(event.target.value)}
                        className="form-select text-xs py-2 px-3 rounded-xl font-medium shadow-xs"
                    >
                        <option value="">Semua Kampus</option>
                        {campuses.map((campus) => (
                            <option key={campus.id} value={campus.id}>
                                {campus.name}
                            </option>
                        ))}
                    </select>
                </label>
            )}
        </div>
    );
}
