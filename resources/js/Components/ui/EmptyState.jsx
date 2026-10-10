import { Inbox } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    compact = false,
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center ${compact ? "py-12 text-xs" : "py-16"} px-4 text-center`}
        >
            <div
                className={`${compact ? "w-8 h-8 mb-2 border-0 bg-transparent" : "w-16 h-16 mb-4 rounded-3xl bg-gray-100 dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60"} flex items-center justify-center shadow-xs`}
            >
                <Icon
                    className={`${compact ? "w-8 h-8 text-gray-200 dark:text-slate-700" : "w-8 h-8 text-gray-400 dark:text-slate-500"}`}
                />
            </div>
            <h3
                className={`${compact ? "text-xs text-gray-400 dark:text-slate-500" : "text-base text-gray-800 dark:text-slate-200"} font-bold mb-1 font-display`}
            >
                {title}
            </h3>
            {description && (
                <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs leading-relaxed mb-4">
                    {description}
                </p>
            )}
            {action && (
                <Button variant="primary" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
