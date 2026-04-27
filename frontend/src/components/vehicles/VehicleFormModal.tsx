"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VehicleFormData } from '@/types/api';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Car, Shield, Fuel, Gauge, Coins, Calendar, Hash, Palette, AlertCircle } from 'lucide-react';

interface VehicleFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: VehicleFormData) => void;
    initialData?: Partial<VehicleFormData>;
    mode: 'create' | 'edit';
}

export function VehicleFormModal({ open, onOpenChange, onSubmit, initialData, mode }: VehicleFormModalProps) {
    const [formData, setFormData] = useState<VehicleFormData>({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: new Date().getFullYear(),
        kilometrage: 0,
        statut: 'DISPONIBLE',
        prochainControle: '',
        assuranceExpiration: '',
        assuranceNumero: '',
        assuranceCompagnie: '',
        typeCarburant: 'ESSENCE',
        capaciteReservoir: 50,
        numeroChassis: '',
        couleur: '',
        dateAcquisition: '',
        prixAcquisition: 0,
        notes: '',
        transmission: 'MANUELLE',
        derniereVidangeKilometrage: 0,
        frequenceVidange: 5000,
        budgetInitial: 0,
    });

    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        api.settings.get().then(setSettings).catch(console.error);
    }, []);

    useEffect(() => {
        if (initialData && open) {
            // Explicitly map all fields from initialData to ensure everything is filled
            setFormData({
                immatriculation: initialData.immatriculation || '',
                marque: initialData.marque || '',
                modele: initialData.modele || '',
                annee: initialData.annee || new Date().getFullYear(),
                kilometrage: initialData.kilometrage || 0,
                statut: (initialData.statut as any) || 'DISPONIBLE',
                prochainControle: initialData.prochainControle ? initialData.prochainControle.split('T')[0] : '',
                assuranceExpiration: initialData.assuranceExpiration ? initialData.assuranceExpiration.split('T')[0] : '',
                assuranceNumero: initialData.assuranceNumero || '',
                assuranceCompagnie: initialData.assuranceCompagnie || '',
                typeCarburant: (initialData.typeCarburant as any) || 'ESSENCE',
                capaciteReservoir: initialData.capaciteReservoir || 0,
                numeroChassis: initialData.numeroChassis || '',
                couleur: initialData.couleur || '',
                dateAcquisition: initialData.dateAcquisition ? initialData.dateAcquisition.split('T')[0] : '',
                prixAcquisition: initialData.prixAcquisition || 0,
                notes: initialData.notes || '',
                transmission: (initialData.transmission as any) || 'MANUELLE',
                derniereVidangeKilometrage: initialData.derniereVidangeKilometrage || 0,
                frequenceVidange: initialData.frequenceVidange || 5000,
                budgetInitial: (initialData as any).budgetAlloue || 0,
            });
        } else if (open) {
            setFormData({
                immatriculation: '',
                marque: '',
                modele: '',
                annee: new Date().getFullYear(),
                kilometrage: 0,
                statut: 'DISPONIBLE',
                prochainControle: '',
                assuranceExpiration: '',
                assuranceNumero: '',
                assuranceCompagnie: '',
                typeCarburant: 'ESSENCE',
                capaciteReservoir: 50,
                numeroChassis: '',
                couleur: '',
                dateAcquisition: '',
                prixAcquisition: 0,
                notes: '',
                transmission: 'MANUELLE',
                derniereVidangeKilometrage: 0,
                frequenceVidange: 5000,
                budgetInitial: 0,
            });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final sanitization before submission: convert empty strings to null for optional fields
        const submissionData = { ...formData };
        const optionalFields = [
            'numeroChassis', 'couleur', 'notes', 'assuranceNumero', 
            'assuranceCompagnie', 'dateAcquisition', 'prochainControle', 
            'assuranceExpiration'
        ] as const;

        optionalFields.forEach(field => {
            if (submissionData[field] === '') {
                (submissionData as any)[field] = null;
            }
        });

        // Ensure numeric fields are not NaN
        if (typeof submissionData.capaciteReservoir !== 'number') submissionData.capaciteReservoir = undefined;
        if (typeof submissionData.prixAcquisition !== 'number') submissionData.prixAcquisition = undefined;

        onSubmit(submissionData);
        onOpenChange(false);
    };

    const updateField = <K extends keyof VehicleFormData>(field: K, value: VehicleFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const remainingGlobal = settings?.budgetGlobalVehicules || 0;
    const currentAllocation = (initialData as any)?.budgetAlloue || 0;
    const totalAvailableForThisVehicle = remainingGlobal + currentAllocation;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        {mode === 'create' ? 'Nouveau Véhicule' : 'Modifier Véhicule'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulaire pour {mode === 'create' ? 'ajouter un nouveau' : 'modifier un'} véhicule à la flotte.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Section 1: Identité */}
                        <div className="space-y-4">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-fleet-blue flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-fleet-blue"></div>
                                Identité du Véhicule
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="immatriculation" className="text-[10px] font-black uppercase text-slate-400 ml-1">Immatriculation *</Label>
                                    <Input
                                        id="immatriculation"
                                        value={formData.immatriculation}
                                        onChange={(e) => updateField('immatriculation', e.target.value)}
                                        placeholder="Ex: 11 LL 1234"
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold uppercase text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="marque" className="text-[10px] font-black uppercase text-slate-400 ml-1">Marque *</Label>
                                    <Input
                                        id="marque"
                                        value={formData.marque}
                                        onChange={(e) => updateField('marque', e.target.value)}
                                        placeholder="Toyota"
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="modele" className="text-[10px] font-black uppercase text-slate-400 ml-1">Modèle *</Label>
                                    <Input
                                        id="modele"
                                        value={formData.modele}
                                        onChange={(e) => updateField('modele', e.target.value)}
                                        placeholder="Hilux"
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="annee" className="text-[10px] font-black uppercase text-slate-400 ml-1">Année *</Label>
                                    <Input
                                        id="annee"
                                        type="number"
                                        value={formData.annee ?? ''}
                                        onChange={(e) => updateField('annee', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="numeroChassis" className="text-[10px] font-black uppercase text-slate-400 ml-1">N° Châssis</Label>
                                    <Input
                                        id="numeroChassis"
                                        value={formData.numeroChassis}
                                        onChange={(e) => updateField('numeroChassis', e.target.value)}
                                        placeholder="VIN..."
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="couleur" className="text-[10px] font-black uppercase text-slate-400 ml-1">Couleur</Label>
                                    <Input
                                        id="couleur"
                                        value={formData.couleur}
                                        onChange={(e) => updateField('couleur', e.target.value)}
                                        placeholder="Blanc"
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: État & Technique */}
                        <div className="space-y-4 pt-2">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                État & Technique
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="kilometrage" className="text-[10px] font-black uppercase text-slate-400 ml-1">Kilométrage Actuel *</Label>
                                    <Input
                                        id="kilometrage"
                                        type="number"
                                        value={formData.kilometrage ?? ''}
                                        onChange={(e) => updateField('kilometrage', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="typeCarburant" className="text-[10px] font-black uppercase text-slate-400 ml-1">Carburant</Label>
                                    <Select value={formData.typeCarburant} onValueChange={(v) => updateField('typeCarburant', v as any)}>
                                        <SelectTrigger className="h-9 rounded-xl border-slate-200 font-bold text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ESSENCE">Essence</SelectItem>
                                            <SelectItem value="DIESEL">Diesel</SelectItem>
                                            <SelectItem value="ELECTRIQUE">Électrique</SelectItem>
                                            <SelectItem value="HYBRIDE">Hybride</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="capaciteReservoir" className="text-[10px] font-black uppercase text-slate-400 ml-1">Réservoir (L)</Label>
                                    <Input
                                        id="capaciteReservoir"
                                        type="number"
                                        value={formData.capaciteReservoir ?? ''}
                                        onChange={(e) => updateField('capaciteReservoir', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="transmission" className="text-[10px] font-black uppercase text-slate-400 ml-1">Transmission</Label>
                                    <Select value={formData.transmission} onValueChange={(v) => updateField('transmission', v as any)}>
                                        <SelectTrigger className="h-9 rounded-xl border-slate-200 font-bold text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MANUELLE">Manuelle</SelectItem>
                                            <SelectItem value="AUTOMATIQUE">Automatique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section Budget & Maintenance (NEW) */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-fleet-blue flex items-center gap-2">
                                <Coins className="w-3.5 h-3.5" />
                                Allocation Budgétaire & Maintenance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor="budgetInitial" className="text-[10px] font-black uppercase text-slate-400">Dotation Totale (Annuelle)</Label>
                                        <span className="text-[9px] font-bold text-slate-400 italic">Dispo (Pool + Actuel): {new Intl.NumberFormat('fr-FR').format(totalAvailableForThisVehicle)} FCFA</span>
                                    </div>
                                    <Input
                                        id="budgetInitial"
                                        type="number"
                                        value={formData.budgetInitial ?? ''}
                                        onChange={(e) => updateField('budgetInitial', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                        className={cn(
                                            "h-10 px-4 rounded-xl font-black text-sm transition-all",
                                            (formData.budgetInitial || 0) > totalAvailableForThisVehicle 
                                                ? "border-rose-500 bg-rose-50 text-rose-600 focus:ring-rose-200" 
                                                : (mode === 'edit' && (formData.budgetInitial || 0) < ((initialData as any)?.budgetConsomme || 0))
                                                    ? "border-amber-500 bg-amber-50 text-amber-600 focus:ring-amber-200"
                                                    : "border-slate-200 focus:border-fleet-blue"
                                        )}
                                    />
                                    {mode === 'edit' && (initialData as any)?.budgetConsomme > 0 && (
                                        <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1 mt-1 ml-1">
                                            <Coins className="w-3 h-3 text-amber-500" />
                                            Déjà consommé : <span className="text-amber-600">{new Intl.NumberFormat('fr-FR').format((initialData as any).budgetConsomme)} FCFA</span>
                                        </p>
                                    )}
                                    {(formData.budgetInitial || 0) > totalAvailableForThisVehicle && (
                                        <p className="text-[9px] font-bold text-rose-500 flex items-center gap-1 mt-1 ml-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Dépassement de la capacité budgétaire globale !
                                        </p>
                                    )}
                                    {mode === 'edit' && (formData.budgetInitial || 0) < ((initialData as any)?.budgetConsomme || 0) && (
                                        <p className="text-[9px] font-bold text-amber-600 flex items-center gap-1 mt-0.5 ml-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Attention : Le budget total est inférieur à la somme déjà dépensée !
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="frequenceVidange" className="text-[10px] font-black uppercase text-slate-400">Fréquence Vidange (KM)</Label>
                                    <Input
                                        id="frequenceVidange"
                                        type="number"
                                        value={formData.frequenceVidange ?? ''}
                                        onChange={(e) => updateField('frequenceVidange', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                        className="h-10 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Documents */}
                        <div className="space-y-4 pt-2">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                Documents & Conformité
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="prochainControle" className="text-[10px] font-black uppercase text-slate-400 ml-1">Echéance Visite Technique *</Label>
                                    <Input
                                        id="prochainControle"
                                        type="date"
                                        value={formData.prochainControle}
                                        onChange={(e) => updateField('prochainControle', e.target.value)}
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="assuranceExpiration" className="text-[10px] font-black uppercase text-slate-400 ml-1">Echéance Assurance *</Label>
                                    <Input
                                        id="assuranceExpiration"
                                        type="date"
                                        value={formData.assuranceExpiration}
                                        onChange={(e) => updateField('assuranceExpiration', e.target.value)}
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="assuranceNumero" className="text-[10px] font-black uppercase text-slate-400 ml-1">N° Police d'assurance</Label>
                                    <Input
                                        id="assuranceNumero"
                                        value={formData.assuranceNumero}
                                        onChange={(e) => updateField('assuranceNumero', e.target.value)}
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="assuranceCompagnie" className="text-[10px] font-black uppercase text-slate-400 ml-1">Compagnie Assurance</Label>
                                    <Input
                                        id="assuranceCompagnie"
                                        value={formData.assuranceCompagnie}
                                        onChange={(e) => updateField('assuranceCompagnie', e.target.value)}
                                        placeholder="AXA / SONAR"
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 pb-4">
                            <Label htmlFor="notes" className="text-[10px] font-black uppercase text-slate-400 ml-1">Notes Particulières</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Observations diverses..."
                                rows={2}
                                className="resize-none rounded-xl border-slate-200 focus:border-fleet-blue font-medium text-xs shadow-inner"
                            />
                        </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                            ANNULER
                        </Button>
                        <Button type="submit" className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-wide">
                            {mode === 'create' ? 'ENREGISTRER' : 'METTRE À JOUR'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
