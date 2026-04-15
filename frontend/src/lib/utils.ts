import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

export function formatCurrency(amount: number) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
    }).format(amount);
}

export function formatCompactNumber(number: number) {
    return new Intl.NumberFormat('fr-FR', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
}

export function formatSmartNumber(value: number) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    if (value >= 100000) {
        return formatCompactNumber(value);
    }
    return value.toLocaleString('fr-FR');
}

export function formatSmartCurrency(amount: number) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0 FCFA';
    return formatSmartNumber(amount) + ' FCFA';
}
