import React from "react";
import { Link } from "@inertiajs/react";
import { Leaf, Sparkles, Shield, MessageSquare } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function LandingNav({ user, onOpenSpatialMode }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                <a href="#beranda" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                        <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block">
                        <span className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-tight block">
                            GIS Kawasan Hijau
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 leading-none">
                            Universitas Ahmad Dahlan
                        </span>
                    </div>
                </a>

                <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    <a
                        href="#beranda"
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        Beranda
                    </a>
                    <a
                        href="#peta"
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        Peta Interaktif
                    </a>
                    {/* <button
                        type="button"
                        onClick={onOpenSpatialMode}
                        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold"
                    >
                        <Sparkles className="w-3 h-3" />
                        <span>Analisis & Simulasi Spasial</span>
                    </button> */}
                    <a
                        href="#analisis"
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        Statistik RTH
                    </a>
                    <a
                        href="#feedback"
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        Feedback Civitas
                    </a>
                </nav>

                <div className="flex items-center gap-2.5">
                    <ThemeToggle size="sm" />

                    {user ? (
                        <>
                            <Link
                                href={
                                    user.role === "admin"
                                        ? "/dashboard"
                                        : "/feedback"
                                }
                                className="btn btn-primary btn-sm"
                            >
                                {user.role === "admin" ? (
                                    <>
                                        <Shield className="w-3.5 h-3.5" /> Admin
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare className="w-3.5 h-3.5" />{" "}
                                        Feedback
                                    </>
                                )}
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 font-medium hidden sm:inline"
                            >
                                Keluar
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="btn btn-secondary btn-sm hidden sm:inline-flex"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/login"
                                className="btn btn-primary btn-sm"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                    Kirim Laporan
                                </span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
