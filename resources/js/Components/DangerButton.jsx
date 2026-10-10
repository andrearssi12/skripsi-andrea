import Button from '@/Components/ui/Button';

export default function DangerButton({
    className = '',
    disabled,
    children,
    type = 'button',
    ...props
}) {
    return (
        <Button
            type={type}
            variant="danger"
            className={className}
            disabled={disabled}
            {...props}
        >
            {children}
        </Button>
    );
}

