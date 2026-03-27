"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Maintenance, MaintenanceFormData } from '@/types/api';
import { useVehicles, useBudgets, useFuelCards, useFuelVouchers } from '@/hooks/useFleetStore';
import { AlertTriangle, Wrench, Calendar, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { cn, formatSmartCurrency } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MaintenanceFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: MaintenanceFormData) => void;
    initialData?: Maintenance;
    mode: 'create' | 'edit';
    preselectedVehicleId?: number;
    preselectedType?: Maintenance['type'];
}

const typeOptions = [
    { value: 'VIDANGE', label: 'Vidange' },
    { value: 'REPARATION', label: 'Réparation' },
    { value: 'PANNE', label: 'Panne' },
    { value: 'VISITE_TECHNIQUE', label: 'Visite Technique' },
    { value: 'ASSURANCE', label: 'Assurance' },
    { value: 'AUTRE', label: 'Autre' },
];

export function MaintenanceFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
    preselectedVehicleId,
    preselectedType,
}: MaintenanceFormModalProps) {
    const { vehicles } = useVehicles();
    const { getBudgetVehicule } = useBudgets();
    const { cards: fuelCards } = useFuelCards();
    const { vouchers: fuelVouchers } = useFuelVouchers();
    const [formData, setFormData] = useState<MaintenanceFormData>({
        vehiculeId: 0,
        type: 'VIDANGE',
        dateDebut: new Date().toISOString().split('T')[0],
        description: '',
        montant: 0,
        statut: 'EN_ATTENTE',
        modePaiement: 'ESPECES',
        mainDoeuvre: 0,
        sourceMainDoeuvre: 'VEHICLE_BUDGET',
        items: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                vehiculeId: initialData.vehiculeId,
                type: initialData.type,
                dateDebut: initialData.dateDebut.split('T')[0],
                dateFin: initialData.dateFin?.split('T')[0],
                montant: initialData.montant || 0,
                description: initialData.description,
                statut: initialData.statut,
                garage: initialData.garage || '',
                notes: initialData.notes || '',
                modePaiement: initialData.modePaiement || 'ESPECES',
                carteCarburantId: initialData.carteCarburantId,
                bonEssenceId: initialData.bonEssenceId,
                mainDoeuvre: initialData.mainDoeuvre || 0,
                sourceMainDoeuvre: initialData.sourceMainDoeuvre || 'VEHICLE_BUDGET',
                items: initialData.items || []
            });
        } else {
            setFormData({
                vehiculeId: preselectedVehicleId || 0,
                type: preselectedType || 'VIDANGE',
                dateDebut: new Date().toISOString().split('T')[0],
                description: '',
                montant: 0,
                statut: 'EN_ATTENTE',
                modePaiement: 'ESPECES',
                mainDoeuvre: 0,
                sourceMainDoeuvre: 'VEHICLE_BUDGET',
                items: []
            });
        }
    }, [initialData, open, preselectedVehicleId, preselectedType]);
    
    // Auto-calculate totals
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalCard, setTotalCard] = useState(0);

    useEffect(() => {
        const items = formData.items || [];
        let budget = 0;
        let card = 0;

        items.forEach(item => {
            if (item.sourcePaiement === 'FUEL_CARD') {
                card += item.total || 0;
            } else {
                budget += item.total || 0;
            }
        });

        if (formData.sourceMainDoeuvre === 'FUEL_CARD') {
            card += formData.mainDoeuvre || 0;
        } else {
            budget += formData.mainDoeuvre || 0;
        }

        setTotalBudget(budget);
        setTotalCard(card);
        
        const total = budget + card;
        if (total !== formData.montant) {
            setFormData(prev => ({ ...prev, montant: total }));
        }
    }, [formData.items, formData.mainDoeuvre, formData.sourceMainDoeuvre, formData.montant]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    const vehicleBudget = formData.vehiculeId ? getBudgetVehicule(formData.vehiculeId) : null;
    const budgetRestant = vehicleBudget ? vehicleBudget.montantAlloue - vehicleBudget.montantConsomme : 0;
    const depasseBudget = totalBudget > budgetRestant;

    // Payment source labels
    const getSourceLabel = (id?: number) => {
        if (!id) return "Aucune carte";
        const card = fuelCards.find(c => c.id === id);
        return card ? `Carte ${card.numero}` : "Carte inconnue";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-none rounded-xl shadow-2xl">
                <div className="flex flex-col h-[85vh]">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                         <Wrench className="w-5 h-5" />
                        {mode === 'create' ? 'Nouvelle Intervention' : 'Modifier Intervention'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulaire pour enregistrer ou modifier une intervention de maintenance sur un véhicule.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                        <ClipboardList className="w-3.5 h-3.5" /> Infos Véhicule
                                    </h4>
                                    
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-500">Véhicule</Label>
                                        <Select
                                            value={formData.vehiculeId.toString()}
                                            onValueChange={(v) => setFormData(p => ({ ...p, vehiculeId: parseInt(v) }))}
                                        >
                                            <SelectTrigger className="h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-black dark:text-white">
                                                <SelectValue placeholder="Choisir un véhicule" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicles.filter(v => v.statut !== 'EN_MISSION').map(v => (
                                                    <SelectItem key={v.id} value={v.id.toString()} className="text-xs">
                                                        {v.immatriculation} - {v.marque} {v.modele}
                                                    </SelectItem>
                                                ))}
                                                {vehicles.filter(v => v.statut === 'EN_MISSION').length > 0 && (
                                                    <>
                                                        <div className="px-3 py-2 border-t border-slate-100 mt-1">
                                                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">En Mission (Non dispo)</span>
                                                        </div>
                                                        {vehicles.filter(v => v.statut === 'EN_MISSION').map(v => (
                                                            <SelectItem key={v.id} value={v.id.toString()} disabled className="text-xs font-bold uppercase opacity-40">
                                                                {v.immatriculation} - {v.marque} 
                                                            </SelectItem>
                                                        ))}
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-500">Type d'Intervention</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(v: any) => setFormData(p => ({ ...p, type: v }))}
                                        >
                                            <SelectTrigger className="h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-black dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typeOptions.map(o => (
                                                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="p-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-fleet-blue" />
                                        Planning & Statut
                                    </h4>
                                </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Date Début</Label>
                                            <Input
                                                type="date"
                                                value={formData.dateDebut}
                                                onChange={(e) => setFormData(p => ({ ...p, dateDebut: e.target.value }))}
                                                className="h-9 rounded-xl text-xs font-bold text-black dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Date Fin (Opt.)</Label>
                                            <Input
                                                type="date"
                                                value={formData.dateFin || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, dateFin: e.target.value }))}
                                                className="h-9 rounded-xl text-xs font-bold text-black dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newState = formData.statut === 'EN_COURS' ? 'EN_ATTENTE' : 'EN_COURS';
                                                setFormData(p => ({ ...p, statut: newState }));
                                            }}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden",
                                                formData.statut === 'EN_COURS' 
                                                    ? "border-rose-500 bg-rose-50 dark:bg-rose-900/10 shadow-[0_0_15px_rgba(244,63,94,0.2)] scale-[1.02]" 
                                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 opacity-60 hover:opacity-100 hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors relative z-10",
                                                formData.statut === 'EN_COURS' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest relative z-10",
                                                formData.statut === 'EN_COURS' ? "text-rose-600 dark:text-rose-400" : "text-slate-500"
                                            )}>Immobilisé</span>
                                            <span className="text-[8px] font-bold text-slate-400 text-center mt-0.5 relative z-10">(En Maintenance)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newState = formData.statut === 'TERMINEE' ? 'EN_ATTENTE' : 'TERMINEE';
                                                setFormData(p => ({ ...p, statut: newState }));
                                            }}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden",
                                                formData.statut === 'TERMINEE' 
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.02]" 
                                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 opacity-60 hover:opacity-100 hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors relative z-10",
                                                formData.statut === 'TERMINEE' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest relative z-10",
                                                formData.statut === 'TERMINEE' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
                                            )}>Terminée</span>
                                            <span className="text-[8px] font-bold text-slate-400 text-center mt-0.5 relative z-10">(Disponible)</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                            <Wrench className="w-3.5 h-3.5" /> Garage & Main d'œuvre
                                        </h4>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-500">Garage / Prestataire</Label>
                                        <Input
                                            placeholder="Nom du garage"
                                            value={formData.garage || ''}
                                            onChange={(e) => setFormData(p => ({ ...p, garage: e.target.value }))}
                                            className="h-9 rounded-xl text-xs font-bold text-black dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Main d'œuvre (CFA)</Label>
                                            <Input
                                                type="number"
                                                value={formData.mainDoeuvre}
                                                onChange={(e) => setFormData(p => ({ ...p, mainDoeuvre: parseFloat(e.target.value) || 0 }))}
                                                className="h-9 rounded-xl text-xs font-bold text-black dark:text-white border-blue-100"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Paiement Labor</Label>
                                            <Select
                                                value={formData.sourceMainDoeuvre}
                                                onValueChange={(v: any) => setFormData(p => ({ ...p, sourceMainDoeuvre: v }))}
                                            >
                                                <SelectTrigger className="h-9 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 border-blue-100">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="VEHICLE_BUDGET" className="text-xs">Budget Véhicule</SelectItem>
                                                    <SelectItem value="FUEL_CARD" className="text-xs font-bold text-blue-600">Carte Carburant</SelectItem>
                                                    <SelectItem value="CASH" className="text-xs">Espèces</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 pt-2">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500">Carte (si Fuel Card utilisée)</Label>
                                            <Select
                                                value={formData.carteCarburantId?.toString() || "none"}
                                                onValueChange={(v) => setFormData(p => ({ ...p, carteCarburantId: v === "none" ? undefined : parseInt(v) }))}
                                            >
                                                <SelectTrigger className="h-9 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 border-blue-200 text-black dark:text-white">
                                                    <SelectValue placeholder="Aucune carte" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs italic">Aucune carte</SelectItem>
                                                    {fuelCards.map(c => (
                                                        <SelectItem key={c.id} value={c.id.toString()} className="text-xs">
                                                            {c.numero} ({formatSmartCurrency(c.solde)})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
                                    <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                        <ClipboardList className="w-3.5 h-3.5 text-slate-400" /> Description / Notes
                                    </h4>
                                    <Textarea
                                        placeholder="Détails de l'intervention..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                        className="rounded-xl resize-none min-h-20 text-xs py-2 text-black dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Parts Table Section */}
                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <ClipboardList className="w-3.5 h-3.5" /> Détails des Pièces (Split Paiement possible)
                                </h4>
                                <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 px-3 rounded-lg text-[10px] font-black gap-1.5 border-fleet-blue text-fleet-blue hover:bg-fleet-blue hover:text-white transition-all shadow-sm"
                                    onClick={() => {
                                        const newItems = [...(formData.items || []), { nom: '', reference: '', quantite: 1, prixUnitaire: 0, total: 0, sourcePaiement: 'VEHICLE_BUDGET' }];
                                        setFormData(p => ({ ...p, items: newItems as any }));
                                    }}
                                >
                                    <Plus className="w-3 h-3" /> AJOUTER UNE LIGNE
                                </Button>
                            </div>

                            <div className="overflow-x-auto text-black dark:text-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800">
                                            <th className="py-2 px-1 text-[10px] font-black text-slate-400 uppercase">Désignation</th>
                                            <th className="py-2 px-1 text-[10px] font-black text-slate-400 uppercase w-20 text-center">Qté</th>
                                            <th className="py-2 px-1 text-[10px] font-black text-slate-400 uppercase w-32 text-right">Prix Unit.</th>
                                            <th className="py-2 px-1 text-[10px] font-black text-slate-400 uppercase w-48 text-center px-4">Source Paiement</th>
                                            <th className="py-2 px-1 text-[10px] font-black text-slate-400 uppercase w-32 text-right">Total (CFA)</th>
                                            <th className="py-2 px-1 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {(formData.items || []).map((item, idx) => (
                                            <tr key={idx} className="group">
                                                <td className="py-1 px-1">
                                                    <Input 
                                                        className="h-8 text-xs border-none bg-transparent focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-black dark:text-white"
                                                        placeholder="Ex: Filtre à huile"
                                                        value={item.nom}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.items || [])];
                                                            newItems[idx].nom = e.target.value;
                                                            setFormData(p => ({ ...p, items: newItems }));
                                                        }}
                                                    />
                                                </td>
                                                <td className="py-1 px-1">
                                                    <Input 
                                                        type="number"
                                                        className="h-8 text-xs border-none bg-transparent focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-center text-black dark:text-white"
                                                        value={item.quantite}
                                                        onChange={(e) => {
                                                            const q = parseInt(e.target.value) || 0;
                                                            const newItems = [...(formData.items || [])];
                                                            newItems[idx].quantite = q;
                                                            newItems[idx].total = q * item.prixUnitaire;
                                                            setFormData(p => ({ ...p, items: newItems }));
                                                        }}
                                                    />
                                                </td>
                                                <td className="py-1 px-1 text-right">
                                                    <Input 
                                                        type="number"
                                                        className="h-8 text-xs border-none bg-transparent focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-right text-black dark:text-white"
                                                        value={item.prixUnitaire}
                                                        onChange={(e) => {
                                                            const pVal = parseFloat(e.target.value) || 0;
                                                            const newItems = [...(formData.items || [])];
                                                            newItems[idx].prixUnitaire = pVal;
                                                            newItems[idx].total = item.quantite * pVal;
                                                            setFormData(p => ({ ...p, items: newItems }));
                                                        }}
                                                    />
                                                </td>
                                                <td className="py-1 px-4">
                                                    <Select
                                                        value={item.sourcePaiement || 'VEHICLE_BUDGET'}
                                                        onValueChange={(v: any) => {
                                                            const newItems = [...(formData.items || [])];
                                                            newItems[idx].sourcePaiement = v;
                                                            setFormData(p => ({ ...p, items: newItems }));
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-7 text-[10px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold uppercase tracking-tight">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="VEHICLE_BUDGET" className="text-[10px] font-black">Budget Véhicule</SelectItem>
                                                            <SelectItem value="FUEL_CARD" className="text-[10px] font-black text-blue-600">Carte Carburant</SelectItem>
                                                            <SelectItem value="CASH" className="text-[10px] font-black">Espèces</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className={cn(
                                                    "py-1 px-1 text-right text-xs font-black",
                                                    item.sourcePaiement === 'FUEL_CARD' ? "text-blue-500" : "text-fleet-blue"
                                                )}>
                                                    {formatSmartCurrency(item.total)}
                                                </td>
                                                <td className="py-1 px-1 text-right">
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            const newItems = (formData.items || []).filter((_, i) => i !== idx);
                                                            setFormData(p => ({ ...p, items: newItems }));
                                                        }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!formData.items || formData.items.length === 0) && (
                                    <div className="py-8 text-center text-slate-400 text-[11px] italic">
                                        Aucune pièce enregistrée. Ajoutez des lignes pour spécifier les paiements.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget Status (Sticky bottom of scroll area) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className={cn(
                                "p-4 rounded-2xl border transition-all duration-500",
                                depasseBudget ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200 shadow-sm"
                            )}>
                                <div className="space-y-0.5">
                                    <p className={cn("text-[8px] font-black uppercase tracking-widest", depasseBudget ? "text-rose-400" : "text-emerald-400")}>
                                        Part Budget Véhicule
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className={cn("text-xl font-black", depasseBudget ? "text-rose-700" : "text-emerald-700")}>
                                            {formatSmartCurrency(totalBudget)}
                                        </p>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Solde Restant</p>
                                            <p className={cn("text-xs font-bold", depasseBudget ? "text-rose-600" : "text-emerald-600")}>
                                                {formatSmartCurrency(budgetRestant - totalBudget)}
                                            </p>
                                        </div>
                                    </div>
                                    {depasseBudget && (
                                        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-white rounded-xl border border-rose-200 text-rose-600 text-[8px] font-black animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> ATTENTION : LE BUDGET ENREGISTRÉ SERA DÉPASSÉ
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 shadow-sm">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">
                                        Part Carte Carburant
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-black text-blue-700">
                                            {formatSmartCurrency(totalCard)}
                                        </p>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Source Affectée</p>
                                            <p className="text-xs font-bold text-blue-600 truncate max-w-[120px]">
                                                {formData.carteCarburantId ? getSourceLabel(formData.carteCarburantId) : "NON DÉFINIE"}
                                            </p>
                                        </div>
                                    </div>
                                    {!formData.carteCarburantId && totalCard > 0 && (
                                        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-white rounded-xl border border-amber-200 text-amber-600 text-[8px] font-black animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> VEUILLEZ SÉLECTIONNER UNE CARTE
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 font-sans px-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 rounded-xl px-6 font-bold text-[11px] border-slate-200 text-slate-500">
                            ANNULER
                        </Button>
                        <Button 
                            type="submit" 
                            className="h-9 rounded-xl px-10 font-bold text-[11px] bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-white uppercase tracking-widest"
                            disabled={!formData.vehiculeId || !formData.description || (totalCard > 0 && !formData.carteCarburantId)}
                        >
                            ENREGISTRER L'INTERVENTION
                        </Button>
                    </DialogFooter>
                </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
