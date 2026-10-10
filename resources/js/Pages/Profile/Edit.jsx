import { Head, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { formatDate } from '@/lib/utils';
import { Calendar, Shield, UserCheck, GraduationCap } from 'lucide-react';

const ROLE_META = {
    admin: {
        label: 'Administrator',
        classes: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        icon: Shield,
    },
    pengurus: {
        label: 'Pengurus Lingkungan',
        classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: UserCheck,
    },
    user: {
        label: 'Civitas Academica',
        classes: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: GraduationCap,
    },
};

function getRoleMeta(role) {
    return ROLE_META[role] || ROLE_META.user;
}

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const roleMeta = getRoleMeta(user.role);
    const RoleIcon = roleMeta.icon;

    return (
        <>
            <Head title="Profil Pengguna - Web GIS UAD" />

            <div className="space-y-6 w-full">
                <PageHeader
                    title="Profil Pengguna"
                    description="Kelola informasi akun, keamanan kata sandi, dan preferensi akun Anda"
                />

                {/* Profile Overview Card - Full Width */}
                <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                                    {user.name}
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleMeta.classes}`}>
                                    <RoleIcon className="w-3.5 h-3.5" />
                                    {roleMeta.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {user.created_at && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-gray-100 dark:border-slate-800">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Bergabung sejak: <strong className="text-gray-700 dark:text-slate-300">{formatDate(user.created_at)}</strong></span>
                        </div>
                    )}
                </div>

                {/* Form Cards - Full Width */}
                <div className="space-y-6 w-full">
                    <div className="card p-6 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="w-full"
                        />
                    </div>

                    <div className="card p-6 sm:p-8">
                        <UpdatePasswordForm className="w-full" />
                    </div>

                    <div className="card p-6 sm:p-8 border-red-100 dark:border-red-950/50">
                        <DeleteUserForm className="w-full" />
                    </div>
                </div>
            </div>
        </>
    );
}

