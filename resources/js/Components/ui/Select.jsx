import { cn } from '@/lib/utils';

/**
 * Select — Komponen select form terpadu.
 *
 * Props:
 *  - label       : string        — label di atas select
 *  - id          : string        — htmlFor label & id select
 *  - options     : Array         — array { value, label } untuk opsi otomatis (opsional)
 *  - placeholder : string|false  — teks opsi kosong pertama. Set false/null untuk menonaktifkan
 *  - error       : string        — pesan error validasi (opsional)
 *  - required    : bool          — menampilkan tanda * merah di label
 *  - helperText  : string        — teks panduan di bawah select (opsional)
 *  - children    : ReactNode     — <option> manual (bisa dipakai alternatif/tambahan dari options)
 *  - ...rest                     — semua props native <select>
 */
export default function Select({
    label,
    error,
    id,
    options = [],
    placeholder = 'Pilih...',
    className,
    required,
    helperText,
    children,
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
            <select
                id={id}
                className={cn('form-select', error && 'form-input-error', className)}
                {...rest}
            >
                {/* Opsi placeholder kosong, bisa dinonaktifkan dengan placeholder={false} */}
                {placeholder !== false && placeholder !== null && (
                    <option value="">{placeholder}</option>
                )}
                {/* Opsi dari prop `options` array */}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
                {/* Opsi manual melalui children */}
                {children}
            </select>
            {error && <p className="form-error">{error}</p>}
            {!error && helperText && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 leading-relaxed">
                    {helperText}
                </p>
            )}
        </div>
    );
}
