import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        // Notify other components (like Leaflet tiles) that theme changed
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
    }, [theme]);

    // Sync across browser tabs and system preference changes
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
                setTheme(e.newValue);
            }
        };

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        window.addEventListener('storage', handleStorage);
        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            window.removeEventListener('storage', handleStorage);
            mediaQuery.removeEventListener('change', handleMediaChange);
        };
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return {
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme,
    };
}
