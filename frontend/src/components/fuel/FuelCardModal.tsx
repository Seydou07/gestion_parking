"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuelCard } from '@/types/api';
import { CreditCard, Save } from 'lucide-react';

interface FuelCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<FuelCard>) => void;
}

export function FuelCardModal({ open, onOpenChange, onSubmit }: FuelCardModalProps) {
    const [formData, setFormData] = useState<Partial<FuelCard>>({
        numero: '',
        fournisseur: 'TOTAL',
        affectation: '',
        soldeActuel: 0,
        plafondMensuel: 0,
        dateExpiration: new Date().toISOString().split('T')[0],
        statut: 'ACTIF',
        typeCarburant: 'DIESEL'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            numero: '', fournisseur: 'TOTAL', affectation: '', soldeActuel: 0,
            plafondMensuel: 0, dateExpiration: new Date().toISOString().split('T')[0],
            statut: 'ACTIF', typeCarburant: 'DIESEL'
        });
        onOpenChange(false);
    };

    const updateField = (field: keyof FuelCard, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Nouvelle Carte
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fournisseur *</Label>
                                <select
                                    className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-xs ring-offset-white focus-visible:outline-none focus:border-fleet-blue"
                                    value={formData.fournisseur}
                                    onChange={(e) => updateField('fournisseur', e.target.value)}
                                    required
                                >
                                    <option value="TOTAL">TOTAL</option>
                                    <option value="SHELL">SHELL</option>
                                    <option value="ORYX">ORYX</option>
                                    <option value="PETROFA">PETROFA</option>
                                    <option value="CORLAY">CORLAY</option>
                                    <option value="AUTRE">AUTRE</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Numéro *</Label>
                                <Input
                                    required
                                    value={formData.numero}
                                    onChange={(e) => updateField('numero', e.target.value)}
                                    placeholder="Numéro physique"
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-mono font-bold uppercase text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Affectation *</Label>
                            <Input
                                value={formData.affectation || ''}
                                onChange={(e) => updateField('affectation', e.target.value)}
                                placeholder="Détenteur de la carte..."
                                required
                                className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5 col-span-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type Carburant</Label>
                                <select
                                    className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-xs ring-offset-white focus-visible:outline-none focus:border-fleet-blue"
                                    value={formData.typeCarburant}
                                    onChange={(e) => updateField('typeCarburant', e.target.value)}
                                >
                                    <option value="DIESEL">Diesel</option>
                                    <option value="ESSENCE">Essence</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Solde Initial (FCFA) *</Label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.soldeActuel || ''}
                                    onChange={(e) => updateField('soldeActuel', Number(e.target.value))}
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-black text-emerald-600 bg-emerald-50/20 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Plafond (FCFA) *</Label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.plafondMensuel || ''}
                                    onChange={(e) => updateField('plafondMensuel', Number(e.target.value))}
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date d'éxpiration *</Label>
                            <Input
                                type="date"
                                required
                                value={formData.dateExpiration}
                                onChange={(e) => updateField('dateExpiration', e.target.value)}
                                className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                            />
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
