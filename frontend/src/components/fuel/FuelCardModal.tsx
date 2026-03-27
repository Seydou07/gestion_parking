"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuelCard } from '@/types/api';
import { CreditCard, Save, Droplets } from 'lucide-react';

interface FuelCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<FuelCard>) => void;
    card?: FuelCard | null;
    existingCards?: FuelCard[];
}

export function FuelCardModal({ open, onOpenChange, onSubmit, card, existingCards = [] }: FuelCardModalProps) {
    const [formData, setFormData] = useState<Partial<FuelCard>>({
        numero: '',
        fournisseur: 'TOTAL',
        notes: '',
        solde: 0,
        soldeInitial: 0,
        prixLitre: undefined,
        dateExpiration: new Date().toISOString().split('T')[0],
        statut: 'ACTIVE',
        quantite: 1,
    });

    const getNextCardNumber = (cards: FuelCard[]) => {
        if (!cards.length) return '';
        
        // Find the most recent card or just the one with highest number suffix
        // We look for patterns like SONA001, TOTAL-01, etc.
        const lastCard = [...cards].sort((a, b) => b.id - a.id)[0];
        if (!lastCard) return '';

        const match = lastCard.numero.match(/^(.*?)(\d+)$/);
        if (match) {
            const prefix = match[1];
            const numStr = match[2];
            const nextNum = parseInt(numStr) + 1;
            return `${prefix}${nextNum.toString().padStart(numStr.length, '0')}`;
        }
        
        return lastCard.numero; // Fallback to last number if no numeric suffix
    };

    useEffect(() => {
        if (card) {
            setFormData({
                ...card,
                dateExpiration: card.dateExpiration ? new Date(card.dateExpiration).toISOString().split('T')[0] : ''
            });
        } else if (open) {
            const nextNum = getNextCardNumber(existingCards);
            setFormData({
                numero: nextNum,
                fournisseur: existingCards.length > 0 ? (existingCards[existingCards.length - 1].fournisseur as any) : 'TOTAL',
                notes: '',
                solde: 0,
                soldeInitial: 0,
                prixLitre: undefined,
                dateExpiration: new Date().toISOString().split('T')[0],
                statut: 'ACTIVE',
                quantite: 1,
            });
        }
    }, [card, open, existingCards]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    const updateField = (field: keyof FuelCard, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const litresEstimes = formData.prixLitre && formData.prixLitre > 0 && formData.soldeInitial
        ? Math.round(((formData.soldeInitial || 0) / formData.prixLitre) * 100) / 100
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {card ? 'Modifier la Carte' : 'Nouvelle Carte'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {card ? 'Modifier les détails de la carte carburant.' : 'Ajouter une nouvelle carte carburant.'}
                    </DialogDescription>
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
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Numéro {formData.quantite && formData.quantite > 1 ? '(Préfixe)' : '*'}</Label>
                                <Input
                                    required={!formData.quantite || formData.quantite <= 1}
                                    value={formData.numero}
                                    onChange={(e) => updateField('numero', e.target.value)}
                                    placeholder={formData.quantite && formData.quantite > 1 ? 'Ex: LOT-2024' : 'Numéro physique'}
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-mono font-bold uppercase text-xs"
                                />
                                {formData.quantite && formData.quantite > 1 && (
                                    <p className="text-[9px] text-slate-400 mt-1 italic leading-tight px-1">Générés : {formData.numero || 'CARD'}-1, {formData.numero || 'CARD'}-2...</p>
                                )}
                            </div>
                        </div>

                        {!card && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quantité à créer *</Label>
                                <Input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.quantite || 1}
                                    onChange={(e) => updateField('quantite', Number(e.target.value))}
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Affectation *</Label>
                            <Input
                                value={formData.notes || ''}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Détenteur de la carte..."
                                required
                                className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Montant (FCFA) *</Label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    value={card ? formData.soldeInitial : formData.solde}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (card) updateField('soldeInitial', val);
                                        else {
                                            updateField('soldeInitial', val);
                                            updateField('solde', val);
                                        }
                                    }}
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Prix / Litre (FCFA)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.prixLitre || ''}
                                    onChange={(e) => updateField('prixLitre', e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="Ex: 700"
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                />
                            </div>
                        </div>

                        {/* Calculated liters display */}
                        {litresEstimes && (
                            <div className="flex items-center gap-3 p-3 bg-fleet-blue/5 border border-fleet-blue/10 rounded-xl">
                                <Droplets className="w-5 h-5 text-fleet-blue" />
                                <div>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Litres Estimés</p>
                                    <p className="text-lg font-black text-fleet-blue">{litresEstimes} L</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Statut *</Label>
                                <select
                                    className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-xs ring-offset-white focus-visible:outline-none focus:border-fleet-blue"
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
                                    className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
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
