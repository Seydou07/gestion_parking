"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "danger",
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className={cn(
                    "shrink-0 px-6 py-4 text-white flex items-center justify-between sticky top-0 z-50",
                    variant === 'danger' ? 'bg-red-500' : 
                    variant === 'warning' ? 'bg-amber-500' : 
                    'bg-fleet-blue'
                )}>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                        {variant === 'danger' ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        {title}
                    </h2>
                </div>
                
                <div className="p-6">
                    <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        {description}
                    </DialogDescription>
                </div>

                <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex sm:justify-end gap-2 px-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border-slate-200 font-bold text-xs"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === 'danger' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        className={`rounded-xl px-6 font-black text-xs uppercase tracking-wide ${
                            variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 
                            variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20' : 
                            'bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20'
                        }`}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
