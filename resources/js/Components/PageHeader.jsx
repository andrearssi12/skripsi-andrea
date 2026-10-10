import React from "react";

export default function PageHeader({
    title,
    description,
    icon: Icon,
    actions,
}) {
    return (
        <div className="page-header">
            <div>
                <h1 className="page-title flex items-center gap-2">
                    {Icon && (
                        <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>{title}</span>
                </h1>
                {description && <p className="page-subtitle">{description}</p>}
            </div>
            {actions && (
                <div className="flex items-center gap-2">{actions}</div>
            )}
        </div>
    );
}
