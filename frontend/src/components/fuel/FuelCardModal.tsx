"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuelCard } from '@/types/api';
import { CreditCard, Save, Droplets, MapPin, UserCheck, Settings2 } from 'lucide-react';

interface FuelCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<FuelCard>) => void;
    card?: FuelCard | null;
    existingCards?: FuelCard[];
}

export function FuelCardModal({ open, onOpenChange, onSubmit, card, existingCards = [] }: FuelCardModalProps) {
    const defaultState: Partial<FuelCard> = {
        numero: '',
        fournisseur: '',
        notes: '',
        solde: 0,
        soldeInitial: 0,
        dateExpiration: new Date(new Date().getFullYear() + 2, 11, 31).toISOString().split('T')[0],
        statut: 'ACTIVE',
        quantite: 1,
        prixDiesel: 0, // Vidange complète
        prixSuper: 0,  // Vidange complète
    };

    const [formData, setFormData] = useState<Partial<FuelCard>>(defaultState);

    // Reset logic when modal opens/closes
    useEffect(() => {
        if (open) {
            if (card) {
                // Modification d'une carte existante
                setFormData({
                    ...card,
                    dateExpiration: card.dateExpiration ? new Date(card.dateExpiration).toISOString().split('T')[0] : '',
                    prixDiesel: (card as any).prixDiesel || 0,
                    prixSuper: (card as any).prixSuper || 0,
                });
            } else {
                // Création d'une NOUVELLE carte : On vide TOUT
                setFormData({
                    ...defaultState,
                    numero: '',       // Désactivation du pré-remplissage du numéro
                    fournisseur: '',  // Désactivation du pré-remplissage de la station
                    notes: '',        // Détenteur vide
                    solde: 0,
                    soldeInitial: 0
                });
            }
        }
    }, [open, card]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const litresDiesel = formData.soldeInitial && formData.prixDiesel && formData.prixDiesel > 0 
        ? Math.round((formData.soldeInitial / (formData.prixDiesel as number)) * 10) / 10 : 0;
    
    const litresSuper = formData.soldeInitial && formData.prixSuper && formData.prixSuper > 0
        ? Math.round((formData.soldeInitial / (formData.prixSuper as number)) * 10) / 10 : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[95vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {card ? 'Modifier la Carte' : 'Nouvelle Carte'}
                    </DialogTitle>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        
                        {/* Section Identification */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Station Service / Fournisseur *</Label>
                                <Input
                                    required
                                    value={formData.fournisseur || ''}
                                    onChange={(e) => updateField('fournisseur', e.target.value)}
                                    placeholder="Nom de la Station"
                                    className="h-10 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Numéro de Carte *</Label>
                                    <Input
                                        required
                                        value={formData.numero || ''}
                                        onChange={(e) => updateField('numero', e.target.value)}
                                        placeholder="N° physique"
                                        className="h-10 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-mono font-bold uppercase text-sm"
                                    />
                                </div>
                                {!card && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quantité (Lot) *</Label>
                                        <Input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.quantite || 1}
                                            onChange={(e) => updateField('quantite', Number(e.target.value))}
                                            className="h-10 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Détenteur de la Carte *</Label>
                                <Input
                                    value={formData.notes || ''}
                                    onChange={(e) => updateField('notes', e.target.value)}
                                    placeholder="Ex: Nom du chauffeur"
                                    required
                                    className="h-10 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-sm"
                                />
                            </div>
                        </div>

                        {/* Section Configuration Financière */}
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings2 className="w-5 h-5 text-fleet-blue" />
                                <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Prix du Litre & Chargement</span>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Montant à Charger (FCFA) *</Label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    value={card ? formData.soldeInitial : formData.solde}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        updateField('soldeInitial', val);
                                        if (!card) updateField('solde', val);
                                    }}
                                    className="h-12 px-5 rounded-xl border-slate-200 focus:border-fleet-blue font-black text-lg text-fleet-blue"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-emerald-600 ml-1">Prix DIESEL / L *</Label>
                                    <Input
                                        type="number"
                                        required
                                        placeholder="0"
                                        value={formData.prixDiesel || ''}
                                        onChange={(e) => updateField('prixDiesel', Number(e.target.value))}
                                        className="h-10 px-4 rounded-xl border-emerald-100 text-sm font-black text-emerald-700"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-amber-600 ml-1">Prix SUPER / L *</Label>
                                    <Input
                                        type="number"
                                        required
                                        placeholder="0"
                                        value={formData.prixSuper || ''}
                                        onChange={(e) => updateField('prixSuper', Number(e.target.value))}
                                        className="h-10 px-4 rounded-xl border-amber-100 text-sm font-black text-amber-700"
                                    />
                                </div>
                            </div>

                            {/* Indicateurs de Conversion */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Droplets className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Total Diesel</p>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{litresDiesel} L</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Droplets className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Total Super</p>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{litresSuper} L</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Validité */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Statut *</Label>
                                <select
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-sm focus:border-fleet-blue"
                                    value={formData.statut}
                                    onChange={(e) => updateField('statut', e.target.value)}
                                    required
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="EN_MISSION">EN MISSION</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="EXPIREE">EXPIREE</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Expiration *</Label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.dateExpiration}
                                    onChange={(e) => updateField('dateExpiration', e.target.value)}
                                    className="h-10 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t border-slate-100 flex gap-3 px-6 bg-slate-50/50">
                        <Button type="button" variant="outline" className="h-10 rounded-xl font-bold text-[11px] px-6" onClick={() => onOpenChange(false)}>ANNULER</Button>
                        <Button type="submit" className="h-10 rounded-xl bg-fleet-blue text-white font-bold text-[11px] px-10 tracking-widest flex items-center gap-2 shadow-lg shadow-fleet-blue/20 transition-transform active:scale-95">
                            <Save className="w-4 h-4" /> ENREGISTRER LA CARTE
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
