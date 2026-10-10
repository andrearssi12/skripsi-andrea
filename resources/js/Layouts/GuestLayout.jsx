import { Link } from '@inertiajs/react';
import { Leaf } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8 relative transition-colors duration-200">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-5 right-5 z-20">
                <ThemeToggle size="md" />
            </div>

            {/* Brand Logo */}
            <div className="mb-6 text-center">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 group-hover:bg-emerald-700 transition-all duration-200">
                        <Leaf className="w-7 h-7 text-white" />
                    </div>
                </Link>
                <h1 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-slate-100 font-display tracking-tight">
                    Web GIS Kawasan Hijau
                </h1>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Universitas Ahmad Dahlan
                </p>
            </div>

            {/* Auth Card Container */}
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl dark:shadow-2xl rounded-3xl p-6 sm:p-8 transition-colors duration-200">
                {children}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-400 dark:text-slate-600">
                &copy; {new Date().getFullYear()} Universitas Ahmad Dahlan — Green Campus Initiative
            </div>
        </div>
    );
}
