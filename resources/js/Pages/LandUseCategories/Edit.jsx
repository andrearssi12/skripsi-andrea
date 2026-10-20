import { useForm, Head } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import ColorPicker from '@/Components/ui/ColorPicker';
import FormActions from '@/Components/ui/FormActions';
import PageHeader from '@/Components/PageHeader';

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
                <PageHeader
                    title="Edit Kategori Lahan"
                    description={`Perbarui nama dan kode warna ${category.name}`}
                    backHref="/land-use-categories"
                />

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

                        <ColorPicker
                            label="Warna Polygon (Hex)"
                            id="color"
                            value={data.color}
                            onChange={(hex) => setData('color', hex)}
                            error={errors.color}
                            required
                        />

                        <Textarea
                            label="Deskripsi Kategori"
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            error={errors.description}
                        />

                        <FormActions
                            cancelHref="/land-use-categories"
                            submitLabel="Simpan Perubahan"
                            isLoading={processing}
                        />
                    </form>
                </div>
            </div>
        </>
    );
}
