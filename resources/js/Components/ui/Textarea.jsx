import { cn } from '@/lib/utils';

export default function Textarea({
    label,
    error,
    id,
    rows = 4,
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
            <textarea
                id={id}
                rows={rows}
                className={cn('form-textarea', error && 'form-input-error', className)}
                {...rest}
            />
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
