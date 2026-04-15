"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FuelVoucher } from '@/types/api';
import { AlertTriangle, Send } from 'lucide-react';

interface VoucherUsageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    voucher: FuelVoucher | null;
    onConfirm: (id: number, justification: string) => Promise<void>;
}

export function VoucherUsageModal({ open, onOpenChange, voucher, onConfirm }: VoucherUsageModalProps) {
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);

    if (!voucher) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!justification.trim()) return;

        setLoading(true);
        try {
            await onConfirm(voucher.id, justification);
            setJustification('');
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to mark voucher as used:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-rose-600 text-white flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-black tracking-tight leading-none">
                            Utilisation Hors Mission
                        </DialogTitle>
                        <DialogDescription className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            Bon N° {voucher.numero}
                        </DialogDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900 rounded-xl">
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-relaxed text-center italic">
                            "Cette action marquera le bon comme utilisé. Veuillez justifier cette utilisation exceptionnelle (ex: cadeau, dotation admin...)"
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Justification / Motif *</Label>
                        <Textarea
                            required
                            placeholder="Entrez la raison ici..."
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="rounded-xl border-slate-200 focus:border-rose-500 font-medium text-sm min-h-[100px]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            className="h-10 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]"
                        >
                            ANNULER
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || !justification.trim()}
                            className="h-10 rounded-xl px-8 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 dark:shadow-none text-[11px] flex items-center gap-2 uppercase tracking-wide"
                        >
                            <Send className="w-3.5 h-3.5" />
                            {loading ? 'TRAITEMENT...' : 'CONFIRMER L\'UTILISATION'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
