import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
    outline: 'btn border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
};

const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(function Button(
    {
        variant = 'primary',
        size = 'md',
        isLoading = false,
        children,
        className,
        disabled,
        type = 'button',
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            className={cn('btn', variants[variant] || variants.primary, sizes[size], className)}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
});

export default Button;

