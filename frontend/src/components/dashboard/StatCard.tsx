"use client";

import { cn, formatSmartCurrency, formatSmartNumber } from "@/lib/utils";
import { LucideIcon, AlertCircle } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    exactValue?: string | number; // Exact un-abbreviated value to show on tooltip
    icon?: LucideIcon;
    subtitle?: string; // Subtitle is removed visually but kept in interface to avoid breaking dependents
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'info' | 'success' | 'warning' | 'danger' | 'default';
    unit?: string;
    isCurrency?: boolean;
    extraValue?: string | number;
    extraValueClass?: string;
}

const StatCard = ({ title, value, exactValue, icon: Icon, trend, variant = 'default', unit = '', isCurrency = true, extraValue, extraValueClass }: StatCardProps) => {
    const variants = {
        info: { border: "border-blue-500", bg: "bg-blue-50/50 dark:bg-blue-900/10", text: "text-blue-600" },
        success: { border: "border-emerald-500", bg: "bg-emerald-50/50 dark:bg-emerald-900/10", text: "text-emerald-600" },
        warning: { border: "border-amber-500", bg: "bg-amber-50/50 dark:bg-amber-900/10", text: "text-amber-600" },
        danger: { border: "border-rose-500", bg: "bg-rose-50/50 dark:bg-rose-900/10", text: "text-rose-600" },
        default: { border: "border-fleet-blue", bg: "bg-fleet-blue/5 dark:bg-fleet-blue/10", text: "text-fleet-blue" }
    };

    const style = variants[variant];

    const displayValue = typeof value === 'number' 
        ? (isCurrency ? formatSmartCurrency(value) : (formatSmartNumber(value) + (unit ? ` ${unit}` : '')))
        : value;

    return (
        <div className={cn("p-4 rounded-2xl border-l-4 bg-white dark:bg-slate-900 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-center min-h-[100px] relative", style.border)}>
            <div className="z-10 relative">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <p className={cn("text-2xl font-black leading-none", style.text)}>
                            {displayValue}
                        </p>
                        {exactValue && (
                            <div className="relative group inline-flex cursor-help">
                                <AlertCircle className="w-3 h-3 text-slate-300" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl z-50 animate-fade-in text-center">
                                    {exactValue}
                                </div>
                            </div>
                        )}
                    </div>
                    {extraValue !== undefined && (
                        <p className={cn("text-xs font-bold text-slate-400 opacity-80", extraValueClass)}>
                            {extraValue}
                        </p>
                    )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{title}</p>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                            trend.isPositive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
                {Icon && (
                    <Icon className={cn("absolute -right-2 -bottom-4 w-20 h-20 opacity-5", style.text)} />
                )}
            </div>
        </div>
    );
};

export default StatCard;
