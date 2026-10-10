import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
};

const borders = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    info: 'border-l-sky-500',
};

export default function Toast({ toasts = [], onClose }) {
    if (!toasts.length) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 bg-white rounded-xl shadow-modal border-l-4 p-4 animate-fade-in ${borders[toast.type] || borders.info}`}
                >
                    {icons[toast.type]}
                    <p className="text-sm text-gray-800 flex-1 leading-snug">{toast.message}</p>
                    <button
                        onClick={() => onClose(toast.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
