import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { ArrowLeft, Save } from 'lucide-react';

export default function CategoryEdit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        color: category.color || '#10b981',
        icon: category.icon || '',
        description: category.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/land-use-categories/${category.id}`);
    };

    return (
        <>
            <Head title={`Edit Kategori: ${category.name}`} />

            <div className="max-w-xl mx-auto space-y-5">

                <div className="flex items-center gap-3">
                    <Link href="/land-use-categories" className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="page-title text-xl">Edit Kategori Lahan</h1>
                        <p className="page-subtitle">Perbarui nama dan kode warna {category.name}</p>
                    </div>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nama Kategori"
                            id="name"
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
                                    className="form-input flex-1"
                                />
                            </div>
                            {errors.color && <p className="form-error">{errors.color}</p>}
                        </div>

                        <Textarea
                            label="Deskripsi Kategori"
                            id="description"
                            rows={3}
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
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

