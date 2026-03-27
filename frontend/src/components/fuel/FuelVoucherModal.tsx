"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuelVoucher } from '@/types/api';
import { Ticket, Save, Calendar, Coins } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface FuelVoucherModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<FuelVoucher>) => void;
}

export function FuelVoucherModal({ open, onOpenChange, onSubmit }: FuelVoucherModalProps) {
    const [formData, setFormData] = useState<Partial<FuelVoucher>>({
        numero: '',
        valeur: 0,
        dateEmission: new Date().toISOString().split('T')[0],
        statut: 'DISPONIBLE',
        quantite: 1
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ numero: '', valeur: 0, dateEmission: new Date().toISOString().split('T')[0], statut: 'DISPONIBLE', quantite: 1 });
        onOpenChange(false);
    };

    const updateField = (field: keyof FuelVoucher, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-white/80" />
                        Nouveau Bon
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Ajouter un nouveau bon d'essence au stock disponible.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Numéro {formData.quantite && formData.quantite > 1 ? '(Préfixe)' : '*'}</Label>
                                <Input
                                    required={!formData.quantite || formData.quantite <= 1}
                                    placeholder={formData.quantite && formData.quantite > 1 ? 'Ex: LOT-2024' : 'Ex: SONA-2024-8842'}
                                    value={formData.numero}
                                    onChange={(e) => updateField('numero', e.target.value)}
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-amber-500 font-mono font-bold uppercase text-xs"
                                />
                                {formData.quantite && formData.quantite > 1 && (
                                    <p className="text-[9px] text-slate-400 mt-1 italic leading-tight px-1">Les numéros seront générés : {formData.numero || 'LOT'}-1, {formData.numero || 'LOT'}-2...</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quantité *</Label>
                                <Input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.quantite || 1}
                                    onChange={(e) => updateField('quantite', Number(e.target.value))}
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-amber-500 font-bold text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valeur Faciale (FCFA) *</Label>
                            <Input
                                type="number"
                                required
                                placeholder="Ex: 10000"
                                min="0"
                                value={formData.valeur || ''}
                                onChange={(e) => updateField('valeur', Number(e.target.value))}
                                className="h-9 px-4 rounded-xl border-slate-200 focus:border-amber-500 font-black text-amber-600 bg-amber-50/20 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date d'émission / d'achat *</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <Input
                                    type="date"
                                    required
                                    value={formData.dateEmission as string}
                                    onChange={(e) => updateField('dateEmission', e.target.value)}
                                    className="h-9 pl-9 pr-4 rounded-xl border-slate-200 focus:border-amber-500 font-bold text-xs"
                                />
                            </div>
                        </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                            ANNULER
                        </Button>
                        <Button type="submit" className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white flex items-center gap-2 uppercase tracking-wide">
                            <Save className="w-3.5 h-3.5" />
                            ENREGISTRER
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
