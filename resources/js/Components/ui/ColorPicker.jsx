/**
 * ColorPicker — Komponen pemilihan warna terpadu.
 *
 * Menggabungkan:
 *  - Tombol color swatch (<input type="color">) untuk pemilih warna visual
 *  - Input teks hex code (#10b981) yang tersinkron dua arah
 *  - Label, error message, dan helper text standar
 *
 * Props:
 *  - label      : string — label di atas picker
 *  - id         : string — id untuk input teks hex
 *  - value      : string — nilai hex saat ini (misal "#10b981")
 *  - onChange   : fn     — callback (hexString) => void ketika warna berubah
 *  - error      : string — pesan error validasi (opsional)
 *  - required   : bool   — menampilkan tanda * merah di label
 *  - helperText : string — teks panduan di bawah picker (opsional)
 */
export default function ColorPicker({
    label,
    id,
    value = '#10b981',
    onChange,
    error,
    required,
    helperText,
}) {
    const handleColorChange = (e) => {
        onChange?.(e.target.value);
    };

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="form-label">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="flex items-center gap-3">
                {/* Color swatch button */}
                <input
                    type="color"
                    value={value}
                    onChange={handleColorChange}
                    title="Pilih warna"
                    className="w-12 h-10 p-1 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer bg-transparent flex-shrink-0"
                />
                {/* Hex text input */}
                <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={handleColorChange}
                    placeholder="#10b981"
                    maxLength={7}
                    className={`form-input flex-1 font-mono${error ? ' form-input-error' : ''}`}
                />
            </div>
            {error && <p className="form-error">{error}</p>}
            {!error && helperText && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 leading-relaxed">
                    {helperText}
                </p>
            )}
        </div>
    );
}
