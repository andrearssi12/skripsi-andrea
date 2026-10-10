import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message,
    confirmLabel = 'Hapus',
    confirmVariant = 'danger',
    isLoading = false,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{message}</p>
                <div className="flex gap-3 w-full mt-2">
                    <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button variant={confirmVariant} className="flex-1" onClick={onConfirm} isLoading={isLoading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
