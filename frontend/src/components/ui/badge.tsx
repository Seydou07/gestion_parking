import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'info' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-fleet-blue text-white hover:bg-fleet-blue/80",
        secondary: "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-100/80",
        destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-100/80",
        outline: "text-slate-900 border-slate-200",
        success: "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80",
        info: "border-transparent bg-sky-100 text-sky-700 hover:bg-sky-100/80",
        warning: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100/80",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 uppercase tracking-tighter",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
