import { cn } from '@/lib/utils';

export default function Input({
    label,
    error,
    id,
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
            <input
                id={id}
                className={cn('form-input', error && 'form-input-error', className)}
                {...rest}
            />
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
