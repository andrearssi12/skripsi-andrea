import { cn } from '@/lib/utils';

export default function Badge({ variant = 'slate', children, className }) {
    const variantMap = {
        green: 'badge-green',
        lime: 'badge-lime',
        slate: 'badge-slate',
        amber: 'badge-amber',
        red: 'badge-red',
        blue: 'badge-blue',
    };

    return (
        <span className={cn('badge', variantMap[variant] || 'badge-slate', className)}>
            {children}
        </span>
    );
}
