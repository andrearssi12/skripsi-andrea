import { useForm, Head, usePage } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import PageHeader from '@/Components/PageHeader';
import FormActions from '@/Components/ui/FormActions';
import { Shield, UserCheck, GraduationCap, AlertTriangle } from 'lucide-react';

export default function UserEdit({ user, roles = [] }) {
    const { auth } = usePage().props;
    const isSelf = auth?.user?.id === user.id;

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    const selectedRoleMeta = roles.find(r => r.value === data.role);

    return (
        <>
            <Head title={`Edit Pengguna: ${user.name} - Web GIS UAD`} />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <PageHeader
                    title="Edit Data Pengguna"
                    description="Perbarui identitas, hak akses role, atau atur ulang kata sandi pengguna"
                    backHref="/users"
                />

                {isSelf && (
                    <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span>
                            Anda sedang mengedit akun Administrator Anda sendiri. Demi keamanan, role Anda tidak dapat diturunkan.
                        </span>
                    </div>
                )}

                {/* Form Card */}
                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Nama Lengkap"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />

                            <Input
                                label="Alamat Email"
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />

                            <div>
                                <Input
                                    label="Kata Sandi Baru (Opsional)"
                                    id="password"
                                    type="password"
                                    placeholder="Biarkan kosong jika tidak ingin mengganti password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    helperText="Hanya diisi jika pengguna meminta pergantian kata sandi (minimal 8 karakter)."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-gray-800 dark:text-slate-200" htmlFor="role">
                                    Role / Hak Akses Pengguna
                                </label>
                                <Select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    error={errors.role}
                                    disabled={isSelf}
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
                        <FormActions
                            cancelHref="/users"
                            submitLabel="Simpan Perubahan"
                            isLoading={processing}
                            className="pt-5"
                        />
                    </form>
                </div>
            </div>
        </>
    );
}
