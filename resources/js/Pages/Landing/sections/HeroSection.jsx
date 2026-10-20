import React from "react";
import {
    Sparkles,
    Navigation,
    MapPin,
    ChevronRight,
    ArrowDown,
} from "lucide-react";
import { formatArea } from "@/lib/utils";

export default function HeroSection({
    campuses = [],
    selectedCampusId,
    onCampusSelect,
    onOpenSpatialMode,
}) {
    const totalLandUses = campuses.reduce(
        (acc, c) => acc + (c.land_uses_count || 0),
        0,
    );

    return (
        <section
            id="beranda"
            className="pt-14 min-h-screen flex flex-col justify-between"
        >
            {/* Hero Top Banner */}
            <div className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white px-4 sm:px-6 py-14 sm:py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                            Sistem Informasi Geografis & Rekomendasi Spasial
                            Kampus
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-[1.15]">
                        Pemetaan Kawasan Hijau{" "}
                        <br className="hidden sm:inline" />
                        <span className="text-emerald-400">
                            Universitas Ahmad Dahlan
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                        Visualisasi spasial terintegrasi seluruh kampus UAD.
                        Pantau capaian target 30% RTH, analisis layer konservasi
                        & potensi penambahan vegetasi alternatif secara
                        interaktif.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <a
                            href="#peta"
                            className="btn bg-white text-emerald-900 hover:bg-emerald-50 font-bold border-none shadow-md"
                        >
                            <Navigation className="w-4 h-4 text-emerald-700" />{" "}
                            Buka Peta Interaktif
                        </a>
                        {/* <button
                            type="button"
                            onClick={onOpenSpatialMode}
                            className="btn bg-emerald-500/30 text-white border border-emerald-400/40 hover:bg-emerald-500/40 backdrop-blur-md"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-300" />{" "}
                            Simulasi & Rekomendasi Spasial
                        </button> */}
                    </div>

                    {/* Top Global Statistics */}
                    <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
                        {[
                            {
                                label: "Total Kampus",
                                value: campuses.length,
                                sub: "Unit Terdaftar",
                                color: "text-white",
                            },
                            {
                                label: "Total Layer Lahan",
                                value: totalLandUses,
                                sub: "Poligon Spasial",
                                color: "text-emerald-300",
                            },
                            {
                                label: "Standar RTH",
                                value: "30%",
                                sub: "Permen ATR/BPN",
                                color: "text-amber-300",
                            },
                            {
                                label: "Status UI GreenMetric",
                                value: "Aktif",
                                sub: "Monitoring 2026",
                                color: "text-emerald-400",
                            },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10"
                            >
                                <span className="text-[11px] text-emerald-200 block mb-0.5">
                                    {s.label}
                                </span>
                                <span
                                    className={`text-lg sm:text-xl font-bold font-display block leading-tight ${s.color}`}
                                >
                                    {s.value}
                                </span>
                                <span className="text-[10px] text-emerald-300/70">
                                    {s.sub}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Campus Cards Explorer */}
            <div
                id="campus-cards"
                className="flex-1 bg-white dark:bg-slate-900 transition-colors"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                                Jelajahi Kampus
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 dark:text-slate-100">
                                Pilih Kampus — Lihat Layer Spasial & Statistik
                                RTH
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                Klik kampus untuk memuat peta, poligon layer,
                                dan analisis kawasan hijau secara detail.
                            </p>
                        </div>
                        <a
                            href="#peta"
                            className="btn btn-primary btn-sm self-start sm:self-auto"
                        >
                            <Navigation className="w-3.5 h-3.5" /> Buka Peta
                            Penuh
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campuses.map((c) => {
                            const isSelected =
                                String(c.id) === String(selectedCampusId);
                            return (
                                <div
                                    key={c.id}
                                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                                        isSelected
                                            ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/80 ring-2 ring-emerald-400/25 shadow-md"
                                            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-card-hover"
                                    }`}
                                    onClick={() => onCampusSelect(c.id)}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`badge ${isSelected ? "badge-green" : "badge-slate"} font-bold text-[11px]`}
                                            >
                                                {c.code}
                                            </span>
                                            <span
                                                className={`badge ${c.is_achieved ? "badge-green" : "badge-amber"} text-[10px]`}
                                            >
                                                {c.status_text}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {c.name}
                                            </h3>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                                {c.description || c.address}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-[11px]">
                                        <div>
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block">
                                                Luas
                                            </span>
                                            <span className="font-bold text-gray-800 dark:text-slate-200">
                                                {formatArea(c.total_area)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block">
                                                Total Vegetasi
                                            </span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {c.vegetated_percentage ?? c.green_percentage}%
                                            </span>
                                            <span className="text-[9px] text-gray-400 dark:text-slate-500 block">
                                                RTH: {c.green_percentage}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block">
                                                Layer
                                            </span>
                                            <span className="font-bold text-gray-800 dark:text-slate-200">
                                                {c.land_uses_count ?? 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-3 space-y-1">
                                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-700"
                                                title={`RTH: ${c.green_percentage}%`}
                                                style={{
                                                    width: `${Math.min(100, ((c.green_percentage || 0) / 30) * 100)}%`,
                                                }}
                                            />
                                            <div
                                                className="h-full bg-lime-400 transition-all duration-700"
                                                title={`Vegetasi Non-RTH: ${(Math.max(0, (c.vegetated_percentage || 0) - (c.green_percentage || 0))).toFixed(2)}%`}
                                                style={{
                                                    width: `${Math.min(100 - (((c.green_percentage || 0) / 30) * 100), Math.max(0, (((c.vegetated_percentage || 0) - (c.green_percentage || 0)) / 30) * 100))}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[9px] text-gray-400 dark:text-slate-500">
                                            <span>Total: {c.vegetated_percentage ?? c.green_percentage}%</span>
                                            <span>Target: 30%</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            Lihat di Peta
                                        </span>
                                        <a
                                            href="#peta"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCampusSelect(c.id);
                                            }}
                                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
                                        >
                                            Buka Peta{" "}
                                            <ChevronRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Scroll cue */}
                    <div className="flex justify-center pt-6">
                        <a
                            href="#peta"
                            className="flex flex-col items-center gap-1 text-xs text-gray-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors animate-bounce"
                        >
                            <ArrowDown className="w-5 h-5" />
                            <span>Peta Interaktif</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
