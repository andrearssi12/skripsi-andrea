import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Sparkles, Shield, Trees, Zap } from 'lucide-react';

export default function MapLegend({ categories = [], mapMode = 'standard' }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="absolute bottom-6 left-6 z-[1000] max-w-xs w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-200">
            {/* Header */}
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 dark:bg-slate-800/80 cursor-pointer select-none hover:bg-gray-100/80 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {mapMode === 'spatial_analysis' ? (
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    ) : (
                        <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                        {mapMode === 'spatial_analysis' ? 'Legenda Zonasi Spasial' : 'Legenda Kategori Peta'}
                    </span>
                </div>
                <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                    {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Content */}
            {!isCollapsed && (
                <div className="p-3.5 space-y-3 max-h-64 overflow-y-auto text-xs">
                    {mapMode === 'spatial_analysis' ? (
                        /* Legenda Analisis & Rekomendasi Spasial */
                        <div className="space-y-2.5">
                            <p className="font-semibold text-gray-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                                Zonasi Rekomendasi
                            </p>

                            <div className="space-y-2 text-[11px]">
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-400 shadow-xs flex-shrink-0" />
                                    <div>
                                        <span className="font-bold text-gray-800 dark:text-slate-200 block leading-tight">1. Proteksi RTH Eksisting</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400">Wajib Dijaga (Dilarang Alih Fungsi)</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-teal-500 border border-teal-700 border-dashed shadow-xs flex-shrink-0" />
                                    <div>
                                        <span className="font-bold text-teal-700 dark:text-teal-400 block leading-tight">2. Kandidat RTH Baru</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400">Lahan Terbuka Siap Dikonversi</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-700 border-dashed shadow-xs flex-shrink-0" />
                                    <div>
                                        <span className="font-bold text-amber-700 dark:text-amber-400 block leading-tight">3. Revitalisasi RTH</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400">Peremajaan Vegetasi Sedang/Kurang</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-sky-400 border border-sky-600 border-dashed shadow-xs flex-shrink-0" />
                                    <div>
                                        <span className="font-bold text-gray-800 dark:text-slate-200 block leading-tight">4. Kompensasi Atap & Peneduh</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400">Green Roof, Wall & Planter Box</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-sky-600 border border-sky-400 shadow-xs flex-shrink-0 animate-pulse" />
                                    <div>
                                        <span className="font-bold text-sky-600 dark:text-sky-400 block leading-tight">⚡ Layer Tersimulasi</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400">Prediksi Konversi Aktif</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-slate-300 dark:bg-slate-700 border border-slate-400 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-gray-600 dark:text-slate-400 block leading-tight">Zona Bangunan Permanen</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Legenda Standar */
                        categories.length > 0 ? (
                            <div>
                                <p className="font-semibold text-gray-500 dark:text-slate-400 text-[11px] uppercase tracking-wider mb-2">Kategori Penggunaan</p>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center gap-2">
                                            <span
                                                className="w-3.5 h-3.5 rounded-md flex-shrink-0 shadow-xs border border-white dark:border-slate-700"
                                                style={{ backgroundColor: cat.color || '#64748b' }}
                                            />
                                            <span className="text-gray-700 dark:text-slate-200 font-medium truncate">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 dark:text-slate-500 italic">Belum ada kategori lahan</p>
                        )
                    )}

                    {/* Batas Kampus */}
                    <div className="pt-2.5 border-t border-gray-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-2.5 border-2 border-blue-600 dark:border-blue-400 border-dashed bg-blue-100/50 dark:bg-blue-900/30 flex-shrink-0 rounded-xs" />
                            <span className="text-gray-700 dark:text-slate-200 font-medium">Garis Batas Kampus</span>
                        </div>

                        {/* Titik Laporan Civitas */}
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs flex-shrink-0">
                                💬
                            </span>
                            <div>
                                <span className="text-gray-700 dark:text-slate-200 font-medium block leading-tight">Laporan Civitas</span>
                                <span className="text-[10px] text-gray-500 dark:text-slate-400">Titik feedback di lokasi lahan</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
