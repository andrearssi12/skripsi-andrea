import { cn } from '@/lib/utils';

/**
 * Textarea — Komponen textarea form terpadu.
 *
 * Props:
 *  - label      : string — label di atas textarea
 *  - id         : string — htmlFor label & id textarea
 *  - rows       : number — jumlah baris (default: 4)
 *  - error      : string — pesan error validasi (opsional)
 *  - required   : bool   — menampilkan tanda * merah di label
 *  - helperText : string — teks panduan di bawah textarea (opsional)
 *  - ...rest             — semua props native <textarea>
 */
export default function Textarea({
    label,
    error,
    id,
    rows = 4,
    className,
    required,
    helperText,
    ...rest
}) {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="form-label">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                id={id}
                rows={rows}
                className={cn('form-textarea', error && 'form-input-error', className)}
                {...rest}
            />
            {error && <p className="form-error">{error}</p>}
            {!error && helperText && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 leading-relaxed">
                    {helperText}
                </p>
            )}
        </div>
    );
}
