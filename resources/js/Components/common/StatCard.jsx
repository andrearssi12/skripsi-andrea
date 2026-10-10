import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, iconBg = "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400", valueColor = "text-gray-900 dark:text-slate-100" }) {
    return (
        <div className="stat-card">
            <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-medium">
                <span>{title}</span>
                {Icon && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>
            <p className={`text-2xl font-bold font-display ${valueColor}`}>
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-gray-500 dark:text-slate-400">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
