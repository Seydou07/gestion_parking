"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuelCard } from '@/types/api';
import { formatSmartCurrency } from '@/lib/utils';
import { Coins } from 'lucide-react';

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
            <DialogContent className="max-w-md max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        Recharger la Carte
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulaire pour ajouter du solde à la carte carburant #{card.numero}.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-inner">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Solde Actuel</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{formatSmartCurrency(card.solde || 0)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Initial</p>
                                <p className="text-sm font-bold text-slate-500">{formatSmartCurrency(card.soldeInitial || 0)}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount" className="text-[10px] font-black uppercase text-slate-400 ml-1">Montant de la Recharge (FCFA) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Ex: 50000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-lg font-black focus:ring-fleet-blue/20 focus:border-fleet-blue"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl flex gap-3 items-start">
                                <Coins className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                                    Une fois confirmée, la recharge sera immédiatement créditée sur le solde de la carte <span className="font-bold">#{card.numero}</span> ({card.fournisseur}).
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                            ANNULER
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !amount}
                            className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-wide"
                        >
                            {isSubmitting ? 'CHARGEMENT...' : 'CONFIRMER LA RECHARGE'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
