import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ data }) {
    if (!data || data.last_page <= 1) return null;

    const handlePage = (url) => {
        if (url) router.get(url, {}, { preserveScroll: true, preserveState: true });
    };

    const { links = [], current_page, last_page, from, to, total } = data;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-3">
            <p className="text-sm text-gray-500 dark:text-slate-400">
                Menampilkan <span className="font-semibold text-gray-800 dark:text-slate-200">{from}</span>–<span className="font-semibold text-gray-800 dark:text-slate-200">{to}</span> dari <span className="font-semibold text-gray-800 dark:text-slate-200">{total}</span> data
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => handlePage(data.prev_page_url)}
                    disabled={!data.prev_page_url}
                    className="btn btn-secondary btn-sm px-2.5"
                    aria-label="Halaman Sebelumnya"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {links.slice(1, -1).map((link, i) => (
                    <button
                        key={i}
                        onClick={() => handlePage(link.url)}
                        disabled={!link.url}
                        className={cn(
                            'btn btn-sm px-3.5',
                            link.active
                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30'
                                : 'btn-secondary'
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}

                <button
                    onClick={() => handlePage(data.next_page_url)}
                    disabled={!data.next_page_url}
                    className="btn btn-secondary btn-sm px-2.5"
                    aria-label="Halaman Selanjutnya"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
