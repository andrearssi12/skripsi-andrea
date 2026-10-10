import Button from '@/Components/ui/Button';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    type = 'submit',
    ...props
}) {
    return (
        <Button
            type={type}
            variant="primary"
            className={className}
            disabled={disabled}
            {...props}
        >
            {children}
        </Button>
    );
}

