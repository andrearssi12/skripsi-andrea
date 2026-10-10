import { useState } from 'react';
import { Search, Filter, X, RotateCcw, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

export default function MapSearch({
    filters = {},
    onFilterChange,
    categories = [],
    campuses = [],
    selectedCampusId,
    onCampusChange,
    feedbackCount = 0,
    showFeedback = false,
    onToggleFeedback = null,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSearch = (e) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleCategory = (e) => {
        onFilterChange({ ...filters, category_id: e.target.value });
    };

    const handleGreenStatus = (e) => {
        onFilterChange({ ...filters, green_status: e.target.value });
    };

    const handleReset = () => {
        onFilterChange({ search: '', category_id: '', green_status: '' });
    };

    const hasActiveFilters = Boolean(filters.search || filters.category_id || filters.green_status);
    const selectedCampus = campuses.find(c => String(c.id) === String(selectedCampusId));

    return (
        <div className="absolute top-4 left-4 z-[1000] max-w-md w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-200">
            {/* Collapsible Header */}
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 dark:bg-slate-800/80 cursor-pointer select-none hover:bg-gray-100/80 dark:hover:bg-slate-800 transition-colors border-b border-gray-100/60 dark:border-slate-800"
            >
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                        {selectedCampus ? selectedCampus.name : 'Pilih & Filter Kampus'}
                    </span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Filter Aktif" />
                    )}
                </div>
                <button
                    type="button"
                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5 rounded"
                >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
                <div className="p-3.5 space-y-2.5 text-xs animate-fade-in">
                    {/* Campus Selector */}
                    {campuses.length > 0 && onCampusChange && (
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
                                Kampus Aktif:
                            </label>
                            <select
                                value={selectedCampusId ?? ''}
                                onChange={(e) => onCampusChange?.(Number(e.target.value))}
                                className="form-select py-1.5 text-xs w-full rounded-xl font-medium"
                            >
                                {campuses.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={filters.search || ''}
                            onChange={handleSearch}
                            placeholder="Cari objek (Taman, Gedung, Parkiran)..."
                            className="form-input pl-8 pr-7 py-1.5 text-xs rounded-xl w-full"
                        />
                        {filters.search && (
                            <button
                                type="button"
                                onClick={() => onFilterChange({ ...filters, search: '' })}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter dropdowns */}
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={filters.green_status || ''}
                            onChange={handleGreenStatus}
                            className="form-select py-1.5 text-xs rounded-xl"
                        >
                            <option value="">Semua Zonasi</option>
                            <option value="Green Area">Green Area (RTH)</option>
                            <option value="Vegetasi Non-RTH">Vegetasi Non-RTH</option>
                            <option value="Non-Green Area">Non-Green Area</option>
                        </select>

                        <select
                            value={filters.category_id || ''}
                            onChange={handleCategory}
                            className="form-select py-1.5 text-xs rounded-xl"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Button & Optional Feedback Toggle */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-800">
                        {feedbackCount > 0 && onToggleFeedback ? (
                            <button
                                type="button"
                                onClick={onToggleFeedback}
                                className={`text-[11px] font-semibold flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                                    showFeedback
                                        ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                                }`}
                                title="Tampilkan/sembunyikan pin feedback pada peta"
                            >
                                <span>💬</span>
                                <span>Pin Laporan ({feedbackCount})</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${showFeedback ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            </button>
                        ) : <div />}

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
