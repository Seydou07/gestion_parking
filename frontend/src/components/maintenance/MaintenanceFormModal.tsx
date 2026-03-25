"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Maintenance, MaintenanceFormData, PieceChangee } from '@/types/api';
import { useVehicles, useBudgets, useFuelCards, useFuelVouchers } from '@/hooks/useFleetStore';
import { AlertTriangle, Plus, Trash2, Wrench, Droplets, Banknote, Calendar, ClipboardList } from 'lucide-react';
import { cn, formatCurrency, formatSmartCurrency } from '@/lib/utils';

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
    { value: 'vidange', label: 'Vidange', description: 'Changement d\'huile moteur' },
    { value: 'revision', label: 'Révision', description: 'Révision générale du véhicule' },
    { value: 'reparation', label: 'Réparation', description: 'Réparation suite à une panne' },
    { value: 'controle_technique', label: 'Contrôle technique', description: 'Visite technique obligatoire' },
    { value: 'pneumatiques', label: 'Pneumatiques', description: 'Remplacement/réparation pneus' },
    { value: 'freins', label: 'Freins', description: 'Système de freinage' },
    { value: 'autre', label: 'Autre', description: 'Autre intervention' },
];

const defaultPiece: PieceChangee = { nom: '', reference: '', prix: 0, quantite: 1 };

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

    const [formData, setFormData] = useState<MaintenanceFormData & { 
        modePaiement?: 'BUDGET_VEHICULE' | 'CARTE_CARBURANT' | 'BON_ESSENCE', 
        carteCarburantId?: number,
        bonEssenceId?: number,
        huileLitrage?: number, 
        nombreBidons?: number 
    }>({
        vehiculeId: 0,
        type: 'vidange',
        date: new Date().toISOString().split('T')[0],
        kilometrage: 0,
        cout: 0,
        description: '',
        modePaiement: 'BUDGET_VEHICULE',
        huileLitrage: 0,
        nombreBidons: 0
    });

    const [piecesChangees, setPiecesChangees] = useState<PieceChangee[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                vehiculeId: initialData.vehiculeId,
                type: initialData.type,
                date: initialData.date,
                kilometrage: initialData.kilometrage,
                cout: initialData.cout,
                description: initialData.description,
                prochaineMaintenance: initialData.prochaineMaintenance,
                garage: initialData.garage,
                garageTelephone: initialData.garageTelephone,
                garageAdresse: initialData.garageAdresse,
                notes: initialData.notes,
                vehiculeAuGarage: initialData.vehiculeAuGarage,
                huileType: initialData.huileType,
                huileQuantite: initialData.huileQuantite,
                huilePrix: initialData.huilePrix,
                huileLitrage: (initialData as any).huileLitrage || 0,
                nombreBidons: (initialData as any).nombreBidons || 0,
                filtreHuileChange: initialData.filtreHuileChange,
                filtreHuilePrix: initialData.filtreHuilePrix,
                filtreAirChange: initialData.filtreAirChange,
                filtreAirPrix: initialData.filtreAirPrix,
                filtreHabitacleChange: initialData.filtreHabitacleChange,
                filtreHabitaclePrix: initialData.filtreHabitaclePrix,
                mainOeuvre: initialData.mainOeuvre,
                heuresTravail: initialData.heuresTravail,
            });
            setPiecesChangees(initialData.piecesChangees || []);
        } else {
            setFormData({
                vehiculeId: preselectedVehicleId || 0,
                type: preselectedType || 'vidange',
                date: new Date().toISOString().split('T')[0],
                kilometrage: 0,
                cout: 0,
                description: preselectedType === 'vidange' ? 'Vidange huile moteur' : '',
                vehiculeAuGarage: false,
                huileLitrage: 0,
                nombreBidons: 0
            });
            setPiecesChangees([]);
        }
    }, [initialData, open, preselectedVehicleId, preselectedType]);

    // Update km when vehicle selected
    useEffect(() => {
        if (formData.vehiculeId && !initialData) {
            const vehicle = vehicles.find(v => v.id === formData.vehiculeId);
            if (vehicle) {
                setFormData(prev => ({
                    ...prev,
                    kilometrage: vehicle.kilometrage,
                    prochaineMaintenance: prev.type === 'vidange' ? vehicle.kilometrage + 10000 : prev.prochaineMaintenance,
                }));
            }
        }
    }, [formData.vehiculeId, vehicles, initialData]);

    // Auto-update description and prochaineMaintenance based on type
    useEffect(() => {
        if (!initialData && formData.type) {
            let description = formData.description;
            let prochaine: number | undefined = formData.prochaineMaintenance;

            if (!description) {
                switch (formData.type) {
                    case 'vidange':
                        description = 'Vidange huile moteur';
                        prochaine = formData.kilometrage + 10000;
                        break;
                    case 'revision':
                        description = 'Révision générale';
                        prochaine = formData.kilometrage + 30000;
                        break;
                    case 'controle_technique':
                        description = 'Contrôle technique périodique';
                        break;
                }
                setFormData(prev => ({ ...prev, description, prochaineMaintenance: prochaine }));
            }
        }
    }, [formData.type]);

    // Calculate total cost
    const calculatedTotal = useMemo(() => {
        let total = 0;
        if (formData.huilePrix) total += formData.huilePrix;
        if (formData.filtreHuileChange && formData.filtreHuilePrix) total += formData.filtreHuilePrix;
        if (formData.filtreAirChange && formData.filtreAirPrix) total += formData.filtreAirPrix;
        if (formData.filtreHabitacleChange && formData.filtreHabitaclePrix) total += formData.filtreHabitaclePrix;
        piecesChangees.forEach(p => { total += (p.prix || 0) * (p.quantite || 0); });
        if (formData.mainOeuvre) total += formData.mainOeuvre;
        return total;
    }, [formData, piecesChangees]);

    const handleAddPiece = () => setPiecesChangees([...piecesChangees, { ...defaultPiece }]);
    const handleRemovePiece = (index: number) => setPiecesChangees(piecesChangees.filter((_, i) => i !== index));
    const handlePieceChange = (index: number, field: keyof PieceChangee, value: any) => {
        setPiecesChangees(piecesChangees.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCout = calculatedTotal > 0 ? calculatedTotal : Number(formData.cout);
        onSubmit({
            ...formData,
            cout: finalCout,
            piecesChangees: piecesChangees.length > 0 ? piecesChangees : undefined,
        });
        onOpenChange(false);
    };

    const selectedVehicle = vehicles.find(v => v.id === formData.vehiculeId);
    const vehicleBudget = formData.vehiculeId ? getBudgetVehicule(formData.vehiculeId) : null;
    const budgetRestant = vehicleBudget ? vehicleBudget.montantAlloue - vehicleBudget.montantConsomme : 0;
    const finalCout = calculatedTotal > 0 ? calculatedTotal : Number(formData.cout);
    const depasseBudget = vehicleBudget && finalCout > budgetRestant;

    const isVidange = formData.type === 'vidange';
    const isRevision = formData.type === 'revision';
    const showDetailedEntry = isVidange || isRevision;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl flex flex-col overflow-hidden bg-white dark:bg-slate-950">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                         <Wrench className="w-5 h-5" />
                        {mode === 'create' ? 'Nouvelle Intervention' : 'Modifier'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                        {/* Section GAUCHE: Infos Générales */}
                        <div className="space-y-4">
                            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    <ClipboardList className="w-3.5 h-3.5" /> Infos Véhicule
                                </h4>
                                
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-500">Véhicule</Label>
                                    <Select
                                        value={formData.vehiculeId.toString()}
                                        onValueChange={(v) => setFormData(p => ({ ...p, vehiculeId: parseInt(v) }))}
                                    >
                                        <SelectTrigger className="h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs">
                                            <SelectValue placeholder="Choisir un véhicule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id.toString()} className="text-xs">
                                                    {v.immatriculation} - {v.marque} {v.modele}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-500">Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(v: any) => setFormData(p => ({ ...p, type: v }))}
                                        >
                                            <SelectTrigger className="h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 capitalize text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typeOptions.map(o => (
                                                    <SelectItem key={o.value} value={o.value} className="capitalize text-xs">{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-500">Kilométrage</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={formData.kilometrage}
                                                onChange={(e) => setFormData(p => ({ ...p, kilometrage: parseInt(e.target.value) || 0 }))}
                                                className="h-9 rounded-xl pl-8 text-xs font-bold"
                                            />
                                            <Wrench className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-500">Date et Statut</Label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                                                className="h-9 rounded-xl pl-8 text-xs font-bold"
                                            />
                                            <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex-none h-9">
                                            <Checkbox
                                                id="garage"
                                                checked={formData.vehiculeAuGarage}
                                                onCheckedChange={(c: boolean) => setFormData(p => ({ ...p, vehiculeAuGarage: !!c }))}
                                                className="w-3.5 h-3.5"
                                            />
                                            <Label htmlFor="garage" className="text-[10px] font-bold cursor-pointer whitespace-nowrap">Immobilisé</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Select
                                        value={formData.modePaiement}
                                        onValueChange={(v: any) => setFormData(p => ({ ...p, modePaiement: v }))}
                                    >
                                        <SelectTrigger className="h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BUDGET_VEHICULE" className="text-xs">BUDGET VÉHICULE (Maintenance)</SelectItem>
                                            <SelectItem value="CARTE_CARBURANT" className="text-xs">CARTE CARBURANT</SelectItem>
                                            <SelectItem value="BON_ESSENCE" className="text-xs">BON D'ESSENCE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.modePaiement === 'CARTE_CARBURANT' && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                        <Label className="text-[11px] font-bold text-slate-500">Choisir la Carte</Label>
                                        <Select
                                            onValueChange={(v) => setFormData(p => ({ ...p, carteCarburantId: parseInt(v) }))}
                                        >
                                            <SelectTrigger className="h-9 rounded-xl text-xs bg-white dark:bg-slate-950">
                                                <SelectValue placeholder="Sélectionner une carte" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fuelCards.map(card => (
                                                    <SelectItem key={card.id} value={card.id.toString()} className="text-xs">
                                                        Carte #{card.numero} ({card.solde} CFA)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {formData.modePaiement === 'BON_ESSENCE' && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                        <Label className="text-[11px] font-bold text-slate-500">Choisir le Bon</Label>
                                        <Select
                                            onValueChange={(v) => setFormData(p => ({ ...p, bonEssenceId: parseInt(v) }))}
                                        >
                                            <SelectTrigger className="h-9 rounded-xl text-xs bg-white dark:bg-slate-950">
                                                <SelectValue placeholder="Sélectionner un bon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fuelVouchers.filter(v => v.statut === 'DISPONIBLE').map(voucher => (
                                                    <SelectItem key={voucher.id} value={voucher.id.toString()} className="text-xs">
                                                        Bon #{voucher.numero} ({voucher.valeur} CFA)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    <Wrench className="w-3.5 h-3.5" /> Prestataire
                                </h4>
                                <Input
                                    placeholder="Nom du garage"
                                    value={formData.garage || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, garage: e.target.value }))}
                                    className="h-9 rounded-xl text-xs font-bold"
                                />
                                <Textarea
                                    placeholder="Description de l'intervention..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="rounded-xl resize-none h-20 text-xs py-2"
                                />
                            </div>
                        </div>

                        {/* Section DROITE: Détails Financiers & Pièces */}
                        <div className="space-y-4">
                            {showDetailedEntry && (
                                <div className="p-4 bg-fleet-blue/5 rounded-2xl border border-fleet-blue/10 space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-fleet-blue mb-1">
                                        <Droplets className="w-3.5 h-3.5" /> Détails Fluides
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Type d'huile (ex: 5W30)"
                                            value={formData.huileType || ''}
                                            onChange={(e) => setFormData(p => ({ ...p, huileType: e.target.value }))}
                                            className="h-8 rounded-xl text-[10px] font-bold"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Prix Huile"
                                            value={formData.huilePrix || ''}
                                            onChange={(e) => setFormData(p => ({ ...p, huilePrix: parseFloat(e.target.value) || 0 }))}
                                            className="h-8 rounded-xl text-[10px] font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase ml-1">Litrage utilisé (L)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Litre(s)"
                                                value={formData.huileLitrage || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, huileLitrage: parseFloat(e.target.value) || 0 }))}
                                                className="h-8 rounded-xl text-[10px] font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nombre de Bidons</Label>
                                            <Input
                                                type="number"
                                                placeholder="Bidon(s)"
                                                value={formData.nombreBidons || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, nombreBidons: parseInt(e.target.value) || 0 }))}
                                                className="h-8 rounded-xl text-[10px] font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-1">
                                        <div className="flex flex-col gap-1 items-center p-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                            <span className="text-[7px] font-black uppercase text-slate-400">Fil. Huile</span>
                                            <Checkbox className="w-3 h-3" checked={formData.filtreHuileChange} onCheckedChange={(c: boolean) => setFormData(p => ({ ...p, filtreHuileChange: !!c }))} />
                                        </div>
                                        <div className="flex flex-col gap-1 items-center p-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                            <span className="text-[7px] font-black uppercase text-slate-400">Fil. Air</span>
                                            <Checkbox className="w-3 h-3" checked={formData.filtreAirChange} onCheckedChange={(c: boolean) => setFormData(p => ({ ...p, filtreAirChange: !!c }))} />
                                        </div>
                                        <div className="flex flex-col gap-1 items-center p-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                            <span className="text-[7px] font-black uppercase text-slate-400">Fil. Hab</span>
                                            <Checkbox className="w-3 h-3" checked={formData.filtreHabitacleChange} onCheckedChange={(c: boolean) => setFormData(p => ({ ...p, filtreHabitacleChange: !!c }))} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <Plus className="w-3.5 h-3.5" /> Pièces Remplacées
                                    </h4>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleAddPiece} className="h-5 text-[8px] font-black text-fleet-blue hover:bg-fleet-blue/10">
                                        AJOUTER
                                    </Button>
                                </div>
                                
                                {piecesChangees.length > 0 ? (
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                        {piecesChangees.map((piece, i) => (
                                            <div key={i} className="flex gap-2 items-center bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group/item">
                                                <Input
                                                    placeholder="Pièce"
                                                    value={piece.nom}
                                                    onChange={e => handlePieceChange(i, 'nom', e.target.value)}
                                                    className="h-7 text-[10px] border-none bg-transparent focus:ring-0 px-0 flex-1 font-bold"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Prix"
                                                    value={piece.prix || ''}
                                                    onChange={e => handlePieceChange(i, 'prix', parseFloat(e.target.value) || 0)}
                                                    className="h-7 text-[10px] border-none bg-transparent focus:ring-0 w-12 px-0 text-right font-bold"
                                                />
                                                <button type="button" onClick={() => handleRemovePiece(i)} className="p-1 text-slate-300 hover:text-red-500">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-2 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                        <p className="text-[9px] font-bold text-slate-300 italic">Aucune pièce</p>
                                    </div>
                                )}

                                <div className="pt-3 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-1 flex-1">
                                        <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Main d'œuvre</Label>
                                        <Input
                                            type="number"
                                            value={formData.mainOeuvre || ''}
                                            onChange={e => setFormData(p => ({ ...p, mainOeuvre: parseFloat(e.target.value) || 0 }))}
                                            className="h-8 rounded-xl text-[10px] font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1 w-24">
                                        <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Coût Total</Label>
                                        <Input
                                            type="number"
                                            disabled={calculatedTotal > 0}
                                            value={calculatedTotal > 0 ? calculatedTotal : formData.cout}
                                            onChange={e => setFormData(p => ({ ...p, cout: parseFloat(e.target.value) || 0 }))}
                                            className="h-8 rounded-xl text-[10px] font-black bg-slate-100/30 text-fleet-blue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Résumé du Budget */}
                    <div className={cn(
                        "p-4 rounded-2xl border transition-all duration-500",
                        depasseBudget ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className={cn("text-[8px] font-black uppercase tracking-widest", depasseBudget ? "text-rose-400" : "text-emerald-400")}>
                                    Budget du Véhicule
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className={cn("text-base font-black", depasseBudget ? "text-rose-600" : "text-emerald-600")}>
                                        {formatSmartCurrency(budgetRestant)} <span className="text-[10px] font-medium opacity-60">Restant</span>
                                    </div>
                                    {depasseBudget && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-full border border-rose-200 text-rose-600 text-[8px] font-black animate-pulse shadow-sm">
                                            <AlertTriangle className="w-2.5 h-2.5" /> DÉPASSEMENT
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right space-y-0.5">
                                <p className={cn("text-[8px] font-black uppercase tracking-widest", depasseBudget ? "text-rose-400" : "text-emerald-400")}>
                                    Coût de l'Intervention
                                </p>
                                <p className={cn("text-lg font-black", depasseBudget ? "text-rose-700" : "text-emerald-700")}>
                                    {formatSmartCurrency(finalCout)}
                                </p>
                            </div>
                        </div>
                    </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 font-sans">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 rounded-xl px-6 font-bold text-[11px] border-slate-200">
                            ANNULER
                        </Button>
                        <Button 
                            type="submit" 
                            className="h-9 rounded-xl px-10 font-bold text-[11px] bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-white"
                            disabled={!formData.vehiculeId || !formData.description}
                        >
                            ENREGISTRER
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
