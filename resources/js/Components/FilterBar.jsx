import React from "react";

export default function FilterBar({ children, onSubmit, className = "" }) {
    return (
        <div className={`card p-4 ${className}`}>
            <form
                onSubmit={onSubmit}
                className="flex flex-col sm:flex-row gap-3"
            >
                {children}
            </form>
        </div>
    );
}
