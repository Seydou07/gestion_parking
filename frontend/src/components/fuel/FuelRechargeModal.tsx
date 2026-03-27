"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuelCard } from '@/types/api';
import { formatSmartCurrency } from '@/lib/utils';
import { Coins } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogDescription } from '@/components/ui/dialog';

interface FuelRechargeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    card: FuelCard | null;
    onSuccess: () => void;
}

export function FuelRechargeModal({ open, onOpenChange, card, onSuccess }: FuelRechargeModalProps) {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!card || !amount) return;

        setIsSubmitting(true);
        try {
            const { api } = await import('@/lib/api');
            await api.fuel.rechargeCard(card.id, parseFloat(amount));
            onSuccess();
            onOpenChange(false);
            setAmount('');
        } catch (error) {
            console.error('Failed to recharge card:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!card) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Coins className="w-24 h-24 rotate-12" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white mb-2">Recharger la Carte</DialogTitle>
                        <DialogDescription className="text-emerald-50 text-xs font-bold uppercase tracking-widest opacity-80">
                            Carte N° {card.numero} — {card.fournisseur}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900">
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Solde Actuel</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{formatSmartCurrency(card.solde || 0)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Budget Initial</p>
                                <p className="text-sm font-bold text-slate-500">{formatSmartCurrency(card.soldeInitial || 0)}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-xs font-black uppercase text-slate-500 tracking-widest ml-1">Montant de la Recharge (FCFA)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Ex: 50000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-black focus:ring-emerald-500/20"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-3 sm:gap-0 pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-500">
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !amount}
                            className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wide shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
                        >
                            {isSubmitting ? 'Chargement...' : 'Confirmer la Recharge'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
