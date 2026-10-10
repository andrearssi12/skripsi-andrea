import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, onClear, placeholder = "Cari...", className = "" }) {
    return (
        <div className={`relative ${className}`}>
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="form-input pl-8 pr-7 py-1.5 text-xs rounded-xl w-full"
            />
            {value && (
                <button
                    type="button"
                    onClick={onClear ? onClear : () => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
