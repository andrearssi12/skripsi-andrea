import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatArea(m2) {
    if (!m2 && m2 !== 0) return '-';
    if (m2 >= 10000) return (m2 / 10000).toFixed(2) + ' ha';
    return m2.toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' m²';
}

export function formatNumber(n) {
    return n?.toLocaleString('id-ID', { maximumFractionDigits: 2 }) ?? '-';
}

export function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function getGreenStatusBadge(status) {
    const map = {
        'Green Area': 'badge-green',
        'Vegetasi Non-RTH': 'badge-lime',
        'Non-Green Area': 'badge-slate',
    };
    return map[status] || 'badge-slate';
}

export function getConditionBadge(cond) {
    const map = { 'Baik': 'badge-green', 'Sedang': 'badge-amber', 'Kurang': 'badge-red' };
    return map[cond] || 'badge-slate';
}

export function getFeedbackStatusBadge(status) {
    const map = { 'Menunggu': 'badge-amber', 'Diproses': 'badge-blue', 'Selesai': 'badge-green' };
    return map[status] || 'badge-slate';
}
