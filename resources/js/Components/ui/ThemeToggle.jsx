import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', variant = 'icon', size = 'md' }) {
    const { isDark, toggleTheme } = useTheme();

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-10 h-10 text-base',
    }[size] || 'w-9 h-9';

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-4.5 h-4.5',
        lg: 'w-5 h-5',
    }[size] || 'w-4.5 h-4.5';

    if (variant === 'button') {
        return (
            <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-sm'
                        : 'bg-white hover:bg-gray-100 text-slate-700 border-gray-200 shadow-sm'
                } ${className}`}
                aria-label="Ganti tema tampilan"
                title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
                {isDark ? (
                    <>
                        <Sun className={`${iconSizes} text-amber-400 animate-spin-slow`} />
                        <span>Mode Terang</span>
                    </>
                ) : (
                    <>
                        <Moon className={`${iconSizes} text-slate-600`} />
                        <span>Mode Gelap</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ${sizeClasses} ${
                isDark
                    ? 'bg-slate-800/90 text-amber-300 border border-slate-700/80 hover:bg-slate-700 shadow-sm shadow-slate-950/40 hover:text-amber-200'
                    : 'bg-white/90 text-slate-700 border border-gray-200 hover:bg-gray-100/90 shadow-sm shadow-black/5 hover:text-slate-900'
            } ${className}`}
            aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <Sun
                    className={`${iconSizes} absolute transition-all duration-300 ${
                        isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
                    }`}
                />
                <Moon
                    className={`${iconSizes} absolute transition-all duration-300 ${
                        isDark ? 'opacity-0 rotate-90 scale-50 pointer-events-none' : 'opacity-100 rotate-0 scale-100'
                    }`}
                />
            </div>
        </button>
    );
}
