import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { ArrowLeft, Save } from 'lucide-react';

export default function CategoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        color: '#10b981',
        icon: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/land-use-categories');
    };

    return (
        <>
            <Head title="Tambah Kategori Lahan" />

            <div className="max-w-xl mx-auto space-y-5">

                <div className="flex items-center gap-3">
                    <Link href="/land-use-categories" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="page-title text-xl">Tambah Kategori Lahan</h1>
                        <p className="page-subtitle">Tentukan nama dan warna polygon peta</p>
                    </div>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nama Kategori"
                            id="name"
                            placeholder="Contoh: Rooftop Garden"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />

                        <div>
                            <label className="form-label">Warna Polygon (Hex)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-12 h-10 p-1 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    placeholder="#10b981"
                                    className="form-input flex-1"
                                />
                            </div>
                            {errors.color && <p className="form-error">{errors.color}</p>}
                        </div>

                        <Textarea
                            label="Deskripsi Kategori (Opsional)"
                            id="description"
                            rows={3}
                            placeholder="Keterangan singkat fungsi kategori lahan..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            error={errors.description}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <Link href="/land-use-categories" className="btn btn-secondary">
                                Batal
                            </Link>
                            <Button type="submit" variant="primary" isLoading={processing}>
                                <Save className="w-4 h-4" />
                                Simpan Kategori
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

