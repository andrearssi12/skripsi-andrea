import { useForm, Head } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import ColorPicker from '@/Components/ui/ColorPicker';
import FormActions from '@/Components/ui/FormActions';
import PageHeader from '@/Components/PageHeader';

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
                <PageHeader
                    title="Tambah Kategori Lahan"
                    description="Tentukan nama dan warna polygon peta"
                    backHref="/land-use-categories"
                />

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

                        <ColorPicker
                            label="Warna Polygon (Hex)"
                            id="color"
                            value={data.color}
                            onChange={(hex) => setData('color', hex)}
                            error={errors.color}
                            required
                        />

                        <Textarea
                            label="Deskripsi Kategori (Opsional)"
                            id="description"
                            rows={3}
                            placeholder="Keterangan singkat fungsi kategori lahan..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            error={errors.description}
                        />

                        <FormActions
                            cancelHref="/land-use-categories"
                            submitLabel="Simpan Kategori"
                            isLoading={processing}
                        />
                    </form>
                </div>
            </div>
        </>
    );
}
