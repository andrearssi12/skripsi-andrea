import { cn } from '@/lib/utils';

/**
 * Input — Komponen input form terpadu.
 *
 * Props:
 *  - label      : string   — label di atas input
 *  - id         : string   — htmlFor label & id input
 *  - error      : string   — pesan error validasi (opsional)
 *  - required   : bool     — menampilkan tanda * merah di label
 *  - helperText : string   — teks panduan di bawah input (opsional)
 *  - suffix     : string   — teks satuan di kanan input, misal "m²" atau "%" (opsional)
 *  - ...rest               — semua props native <input> (type, value, onChange, placeholder, dsb.)
 */
export default function Input({
    label,
    error,
    id,
    className,
    required,
    helperText,
    suffix,
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
            {suffix ? (
                <div className="relative">
                    <input
                        id={id}
                        className={cn('form-input pr-10', error && 'form-input-error', className)}
                        {...rest}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500 pointer-events-none select-none">
                        {suffix}
                    </span>
                </div>
            ) : (
                <input
                    id={id}
                    className={cn('form-input', error && 'form-input-error', className)}
                    {...rest}
                />
            )}
            {error && <p className="form-error">{error}</p>}
            {!error && helperText && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 leading-relaxed">
                    {helperText}
                </p>
            )}
        </div>
    );
}
