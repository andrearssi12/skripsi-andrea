import { Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import { Save } from 'lucide-react';

/**
 * FormActions — Baris tombol aksi form terpadu (Batal + Submit).
 *
 * Menampilkan divider atas + tombol Batal (link) + tombol Submit (button) dalam
 * layout flex justify-end yang konsisten di seluruh halaman form.
 *
 * Props:
 *  - cancelHref    : string    — URL untuk tombol Batal (Link)
 *  - cancelLabel   : string    — teks tombol Batal (default: "Batal")
 *  - submitLabel   : string    — teks tombol Submit (default: "Simpan")
 *  - submitIcon    : LucideIcon — ikon tombol submit (default: Save)
 *  - submitVariant : string    — variant Button ("primary", "secondary", dll.) (default: "primary")
 *  - isLoading     : bool      — status loading (dari `processing` Inertia)
 *  - disabled      : bool      — nonaktifkan tombol submit
 *  - className     : string    — class tambahan untuk wrapper div
 *  - children      : ReactNode — tombol tambahan di antara Batal dan Submit (opsional)
 */
export default function FormActions({
    cancelHref,
    cancelLabel = 'Batal',
    submitLabel = 'Simpan',
    submitIcon: SubmitIcon = Save,
    submitVariant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
    children,
}) {
    return (
        <div className={`flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 ${className}`}>
            {cancelHref && (
                <Link href={cancelHref} className="btn btn-secondary">
                    {cancelLabel}
                </Link>
            )}
            {children}
            <Button
                type="submit"
                variant={submitVariant}
                isLoading={isLoading}
                disabled={disabled || isLoading}
            >
                <SubmitIcon className="w-4 h-4" />
                <span>{submitLabel}</span>
            </Button>
        </div>
    );
}
