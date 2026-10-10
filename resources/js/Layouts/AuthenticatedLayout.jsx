import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Map, Building2, Layers, TreePine, MessageSquare,
    ClipboardList, LogOut, Menu, X, Leaf, User, Download, Upload,
    ChevronRight, Home, Globe, Users, Compass
} from 'lucide-react';
import Toast from '@/components/ui/Toast';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useToast } from '@/hooks/useToast';

function NavLink({ href, icon: Icon, label, active }) {
    return (
        <Link
            href={href}
            className={`sidebar-link ${active ? 'active' : ''}`}
        >
            <Icon className="icon" />
            <span>{label}</span>
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';
    const isPengurus = user?.role === 'pengurus';
    const { toasts, addToast, removeToast } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const currentPath = window.location.pathname;
    const isActive = (path) => currentPath.startsWith(path);

    // Flash notifications
    useEffect(() => {
        if (flash?.success) addToast(flash.success, 'success');
        if (flash?.error) addToast(flash.error, 'error');
        if (flash?.message) addToast(flash.message, 'info');
    }, [flash]);

    const adminNav = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard Admin' },
        { href: '/map', icon: Map, label: 'Peta WebGIS' },
        { href: '/campuses', icon: Building2, label: 'Data Kampus' },
        { href: '/land-use-categories', icon: Layers, label: 'Kategori Lahan' },
        { href: '/land-uses', icon: TreePine, label: 'Data Lahan (Spasial)' },
        { href: '/spatial-plans', icon: Compass, label: 'Rencana Spasial' },
        { href: '/feedback', icon: MessageSquare, label: 'Feedback Civitas' },
        { href: '/users', icon: Users, label: 'Manajemen User' },
        { href: '/activity-logs', icon: ClipboardList, label: 'Activity Log' },
    ];

    const pengurusNav = [
        { href: '/feedback', icon: MessageSquare, label: 'Laporan Civitas' },
        { href: '/map', icon: Map, label: 'Peta WebGIS' },
        { href: '/spatial-plans', icon: Compass, label: 'Rencana Spasial' },
    ];

    const userNav = [
        { href: '/feedback', icon: MessageSquare, label: 'Feedback & Laporan' },
        { href: '/map', icon: Map, label: 'Peta Kawasan Hijau' },
        { href: '/spatial-plans', icon: Compass, label: 'Rencana Spasial' },
    ];

    const navItems = isAdmin ? adminNav : isPengurus ? pengurusNav : userNav;

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-colors duration-200">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-gray-100 dark:border-slate-800">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-emerald-700 transition-colors">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-tight font-display">Web GIS Kawasan Hijau</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Universitas Ahmad Dahlan</p>
                    </div>
                </Link>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <Link
                    href="/"
                    className="sidebar-link mb-2"
                >
                    <Globe className="icon" />
                    <span>Halaman Utama (Landing)</span>
                </Link>

                {navItems.map(item => (
                    <NavLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        active={isActive(item.href)}
                    />
                ))}

                {isAdmin && (
                    <div className="pt-4 mt-2 border-t border-gray-100 dark:border-slate-800">
                        <p className="px-4 text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Import / Export</p>
                        <Link href="/land-uses/import" className="sidebar-link">
                            <Upload className="icon" />
                            <span>Import GeoJSON (QGIS)</span>
                        </Link>
                        <a
                            href="/export/geojson"
                            className="sidebar-link"
                            target="_blank"
                        >
                            <Download className="icon" />
                            <span>Export GeoJSON</span>
                        </a>
                        <a
                            href="/export/csv"
                            className="sidebar-link"
                            target="_blank"
                        >
                            <Download className="icon" />
                            <span>Export CSV</span>
                        </a>
                    </div>
                )}
            </nav>

            {/* Theme Toggle & User Profile & Logout */}
            <div className="px-3 py-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60">
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Tema Tampilan</span>
                    <ThemeToggle size="sm" />
                </div>

                <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{user?.name}</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                            {user?.role === 'pengurus' ? 'Pengurus Lingkungan' : user?.role === 'admin' ? 'Administrator' : 'Civitas Academica'}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                </Link>

                <button
                    onClick={handleLogout}
                    className="sidebar-link text-gray-500 dark:text-slate-400 w-full hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                    <LogOut className="icon" />
                    <span>Keluar</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30 shadow-sm">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative w-64 flex flex-col shadow-2xl z-50">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Workspace */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile topbar */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20 transition-colors">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-600 dark:text-slate-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-gray-900 dark:text-slate-100">Web GIS UAD</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle size="sm" />
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                            <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        </div>
                    </div>
                </header>

                {/* Desktop page header */}
                {header && (
                    <div className="hidden lg:block px-6 pt-6">
                        {header}
                    </div>
                )}

                {/* Content */}
                <main className="flex-1 px-4 sm:px-6 py-6">
                    {children}
                </main>
            </div>

            {/* Toast Container */}
            <Toast toasts={toasts} onClose={removeToast} />
        </div>
    );
}
