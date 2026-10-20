import { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import Button from "@/Components/ui/Button";
import Input from "@/Components/ui/Input";
import Select from "@/Components/ui/Select";
import Textarea from "@/Components/ui/Textarea";
import PageHeader from "@/Components/PageHeader";
import FormActions from "@/Components/ui/FormActions";
import { Send, Upload, Image as ImageIcon, X } from "lucide-react";

export default function FeedbackCreate({ landUses = [], selectedLandUseId }) {
    const { data, setData, post, processing, errors } = useForm({
        land_use_id: selectedLandUseId ? String(selectedLandUseId) : "",
        title: "",
        message: "",
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData("image", null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/feedback");
    };

    return (
        <>
            <Head title="Kirim Feedback & Laporan - Web GIS UAD" />

            <div className="max-w-2xl mx-auto space-y-5">
                <PageHeader
                    title="Kirim Laporan / Feedback Kawasan"
                    description="Sampaikan saran, keluhan, atau kondisi area hijau di kampus UAD"
                    backHref="/feedback"
                />

                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select
                            label="Objek Terkait (Opsional)"
                            id="land_use_id"
                            value={data.land_use_id}
                            onChange={(e) =>
                                setData("land_use_id", e.target.value)
                            }
                            error={errors.land_use_id}
                            placeholder="Laporan Umum (Tidak terikat objek tertentu)"
                            options={landUses.map((lu) => ({
                                value: String(lu.id),
                                label: `${lu.name} (${lu.campus?.name || ""})`,
                            }))}
                        />

                        <Input
                            label="Judul Laporan / Topik"
                            id="title"
                            placeholder="Contoh: Tanaman di Taman Tengah mulai mengering"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            error={errors.title}
                            required
                        />

                        <Textarea
                            label="Isi Pesan / Keterangan Kondisi"
                            id="message"
                            rows={5}
                            placeholder="Jelaskan detail pengamatan Anda mengenai kondisi kawasan, lokasi spesifik, atau usulan perbaikan..."
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            error={errors.message}
                            required
                        />

                        {/* Image Upload */}
                        <div>
                            <label className="form-label">
                                Foto Kondisi Kawasan (Maksimal 2 MB - Opsional)
                            </label>
                            {!imagePreview ? (
                                <label className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-2" />
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        Klik untuk unggah foto
                                    </span>
                                    <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                                        JPG, PNG, atau WEBP
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 w-fit max-w-xs">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-44 w-auto object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {errors.image && (
                                <p className="form-error">{errors.image}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <Link
                                href="/feedback"
                                className="btn btn-secondary"
                            >
                                Batal
                            </Link>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                            >
                                <Send className="w-4 h-4" />
                                Kirim Laporan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
