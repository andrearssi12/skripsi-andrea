import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ArrowLeft, Save, UserPlus, Shield, UserCheck, GraduationCap, Info } from 'lucide-react';

export default function UserCreate({ roles = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/users');
    };

    const selectedRoleMeta = roles.find(r => r.value === data.role);

    return (
        <>
            <Head title="Tambah Pengguna Baru - Web GIS UAD" />

            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/users"
                        className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="page-title text-xl">Tambah Pengguna Baru</h1>
                        <p className="page-subtitle">
                            Buat akun baru untuk Administrator, Pengurus Lingkungan Kampus, atau Civitas Academica
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Nama Lengkap"
                                id="name"
                                placeholder="Contoh: Budi Santoso, M.Kom."
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />

                            <Input
                                label="Alamat Email"
                                id="email"
                                type="email"
                                placeholder="Contoh: budi.santoso@uad.ac.id"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />

                            <Input
                                label="Kata Sandi (Password)"
                                id="password"
                                type="password"
                                placeholder="Minimal 8 karakter"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                            />

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-gray-800 dark:text-slate-200" htmlFor="role">
                                    Role / Hak Akses Pengguna
                                </label>
                                <Select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    error={errors.role}
                                    options={roles.map(r => ({
                                        value: r.value,
                                        label: r.label,
                                    }))}
                                    required
                                />
                            </div>

                            {/* Role Explanation Banner */}
                            {selectedRoleMeta && (
                                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {data.role === 'admin' ? (
                                            <Shield className="w-4 h-4" />
                                        ) : data.role === 'pengurus' ? (
                                            <UserCheck className="w-4 h-4" />
                                        ) : (
                                            <GraduationCap className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-bold text-blue-900 dark:text-blue-200">
                                            Wewenang Role: {selectedRoleMeta.label}
                                        </p>
                                        <p className="text-blue-700/90 dark:text-blue-300/80 mt-0.5 leading-relaxed">
                                            {selectedRoleMeta.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 dark:border-slate-800">
                            <Link href="/users" className="btn btn-secondary">
                                Batal
                            </Link>
                            <Button type="submit" variant="primary" isLoading={processing}>
                                <Save className="w-4 h-4" />
                                <span>Simpan Pengguna</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

