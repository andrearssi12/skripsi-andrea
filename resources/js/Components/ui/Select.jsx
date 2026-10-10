import { cn } from '@/lib/utils';

export default function Select({
    label,
    error,
    id,
    options = [],
    placeholder = 'Pilih...',
    className,
    required,
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
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
