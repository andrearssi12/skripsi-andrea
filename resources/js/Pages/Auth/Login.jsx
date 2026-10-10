import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Leaf, LogIn, ArrowLeft } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <Head title="Masuk - Web GIS Kawasan Hijau UAD" />

            {/* Navigasi Kembali ke Beranda — Top Left */}
            <div className="fixed top-4 left-4 z-50">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-slate-900/70 dark:hover:bg-slate-800 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700/60 transition-all duration-200 shadow-sm group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>

            {/* Theme Toggle — absolute top-right */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle size="sm" />
            </div>

            <div className="max-w-md w-full space-y-6">
                {/* Header & Logo */}
                <div className="text-center space-y-2">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 items-center justify-center shadow-lg mb-2">
                        <Leaf className="w-9 h-9 text-emerald-300" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
                        Web GIS Kawasan Hijau
                    </h1>
                    <p className="text-xs text-emerald-200/80 font-medium uppercase tracking-wider">
                        Universitas Ahmad Dahlan
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-modal border border-white/20 dark:border-slate-700/60 space-y-5 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 font-display">Masuk ke Sistem</h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Gunakan akun civitas akademika atau administrator</p>
                    </div>

                    {status && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <Input
                            label="Alamat Email"
                            id="email"
                            type="email"
                            placeholder="nama@uad.ac.id"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Kata Sandi"
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                        />

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800"
                                />
                                <span>Ingat saya</span>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-2.5"
                            isLoading={processing}
                        >
                            <LogIn className="w-4 h-4" />
                            Masuk
                        </Button>
                    </form>
                </div>

                {/* Navigasi Kembali ke Beranda */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-200/80 hover:text-white dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali ke Halaman Utama</span>
                    </Link>
                </div>

                {/* Footer copyright */}

                <p className="text-center text-xs text-emerald-200/60 dark:text-slate-500">
                    &copy; {new Date().getFullYear()} Universitas Ahmad Dahlan • Green Campus SIG
                </p>
            </div>
        </div>
    );
}
