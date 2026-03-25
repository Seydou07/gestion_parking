"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mission, Vehicle, Driver, FuelCard, FuelVoucher } from '@/types/api';
import { formatSmartCurrency } from '@/lib/utils';
import { Map, Calendar, Car, Fuel, FileUp, Search, AlertTriangle } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface MissionCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicles: Vehicle[];
    drivers: Driver[];
    fuelCards: FuelCard[];
    fuelVouchers: FuelVoucher[];
    onSubmit: (data: Partial<Mission>) => void;
}

export function MissionCreateModal({ open, onOpenChange, vehicles, drivers, fuelCards, fuelVouchers, onSubmit }: MissionCreateModalProps) {
    const [formData, setFormData] = useState<Partial<Mission>>({
        destination: '',
        dateDebut: '',
        dateFin: '',
        vehiculeId: undefined,
        chauffeurId: undefined,
        typeCarburantDotation: 'AUCUNE',
        bonCarburantId: undefined,
        carteCarburantId: undefined,
        lettreMissionUrl: '',
        statut: 'PLANIFIEE'
    });

    const [vehicleSearch, setVehicleSearch] = useState('');
    const [driverSearch, setDriverSearch] = useState('');
    
    // Safety Alert State
    const [safetyModalOpen, setSafetyModalOpen] = useState(false);
    const [potentialVehicleId, setPotentialVehicleId] = useState<number | null>(null);
    const [safetyMessage, setSafetyMessage] = useState('');

    const availableVehicles = vehicles
        .filter(v => v.statut === 'DISPONIBLE')
        .filter(v => v.immatriculation.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.marque.toLowerCase().includes(vehicleSearch.toLowerCase()));

    const availableDrivers = drivers
        .filter(d => d.statut === 'DISPONIBLE')
        .filter(d => d.nom.toLowerCase().includes(driverSearch.toLowerCase()) || d.prenom.toLowerCase().includes(driverSearch.toLowerCase()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    const updateField = <K extends keyof Mission>(field: K, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVehicleSelect = (id: number) => {
        const vehicle = vehicles.find(v => v.id === id);
        if (!vehicle) return;

        const today = new Date();
        const assuranceDate = new Date(vehicle.assuranceExpiration);
        const controleDate = new Date(vehicle.prochainControle);
        
        const isExpired = assuranceDate < today || controleDate < today;
        const vidangeKilometres = vehicle.kilometrage - vehicle.derniereVidangeKilometrage;
        const isVidangeSoon = vidangeKilometres >= vehicle.frequenceVidange;

        if (isExpired || isVidangeSoon) {
            let message = "Ce véhicule présente des alertes de maintenance ou administratives : ";
            if (isExpired) message += "Documents expirés (Assurance/Visite). ";
            if (isVidangeSoon) message += "Vidange à effectuer immédiatement. ";
            message += "Voulez-vous quand même l'affecter à cette mission ?";
            
            setSafetyMessage(message);
            setPotentialVehicleId(id);
            setSafetyModalOpen(true);
        } else {
            updateField('vehiculeId', id);
        }
    };

    const confirmSafetyAlert = () => {
        if (potentialVehicleId) {
            updateField('vehiculeId', potentialVehicleId);
            setPotentialVehicleId(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Simulation d'upload
        if (e.target.files && e.target.files.length > 0) {
            updateField('lettreMissionUrl', e.target.files[0].name);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Map className="w-5 h-5 text-white/80" />
                        Nouvelle Mission
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        {/* Fichier Lettre de Mission - Compact */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
                                    <FileUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <Label className="text-[10px] font-black uppercase text-amber-700">Lettre de Mission *</Label>
                                    <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-tighter">Document obligatoire</p>
                                </div>
                            </div>
                            <div>
                                <input type="file" id="lettreMission" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} required />
                                <label htmlFor="lettreMission" className="cursor-pointer inline-flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest ring-offset-background transition-colors focus-visible:outline-none bg-white text-slate-900 shadow-sm border border-slate-200 h-9 px-4 hover:bg-slate-50">
                                    {formData.lettreMissionUrl ? (
                                        <span className="truncate max-w-[150px]">{formData.lettreMissionUrl}</span>
                                    ) : "TÉLÉVERSER"}
                                </label>
                            </div>
                        </div>

                        {/* Details du Trajet */}
                        <div className="space-y-4">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                Détails du Trajet
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Destination & Objet *</Label>
                                    <Input
                                        required
                                        placeholder="Ex: Mission de supervision Bobo-Dioulasso..."
                                        value={formData.destination}
                                        onChange={(e) => updateField('destination', e.target.value)}
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Départ Prévu *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <Input
                                            type="date"
                                            required
                                            value={formData.dateDebut}
                                            onChange={(e) => updateField('dateDebut', e.target.value)}
                                            className="h-9 pl-9 pr-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Retour Prévu *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <Input
                                            type="date"
                                            required
                                            value={formData.dateFin}
                                            onChange={(e) => updateField('dateFin', e.target.value)}
                                            className="h-9 pl-9 pr-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Affectation des Ressources */}
                        <div className="space-y-4">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-fleet-blue flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-fleet-blue"></div>
                                Affectation Logistique
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Véhicule *</Label>
                                    <Select required value={formData.vehiculeId?.toString()} onValueChange={(v) => handleVehicleSelect(Number(v))}>
                                        <SelectTrigger className="h-9 rounded-xl border-slate-200 font-bold text-xs">
                                            <SelectValue placeholder="Choisir un véhicule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10 border-b">
                                                <div className="relative">
                                                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <Input
                                                        placeholder="Filtrer..."
                                                        className="h-8 pl-8 text-[10px] rounded-lg border-slate-100"
                                                        value={vehicleSearch}
                                                        onChange={(e) => setVehicleSearch(e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                            {availableVehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id.toString()} className="text-xs font-bold uppercase">
                                                    {v.immatriculation} - {v.marque}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Chauffeur *</Label>
                                    <Select required value={formData.chauffeurId?.toString()} onValueChange={(v) => updateField('chauffeurId', Number(v))}>
                                        <SelectTrigger className="h-9 rounded-xl border-slate-200 font-bold text-xs">
                                            <SelectValue placeholder="Choisir un chauffeur" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10 border-b">
                                                <div className="relative">
                                                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <Input
                                                        placeholder="Filtrer..."
                                                        className="h-8 pl-8 text-[10px] rounded-lg border-slate-100"
                                                        value={driverSearch}
                                                        onChange={(e) => setDriverSearch(e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                            {availableDrivers.map(d => (
                                                <SelectItem key={d.id} value={d.id.toString()} className="text-xs font-bold uppercase">
                                                    {d.prenom} {d.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dotation Carburant */}
                                <div className="md:col-span-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4 mt-2 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
                                        <Label className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                            <Fuel className="w-3.5 h-3.5" /> Dotation Carburant
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            {['AUCUNE', 'BON', 'CARTE'].map(type => (
                                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="typeCarburant"
                                                        value={type}
                                                        checked={formData.typeCarburantDotation === type}
                                                        onChange={() => {
                                                            updateField('typeCarburantDotation', type);
                                                            updateField('bonCarburantId', undefined);
                                                            updateField('carteCarburantId', undefined);
                                                        }}
                                                        className="accent-amber-500 w-3 h-3 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-amber-600 transition-colors">
                                                        {type === 'AUCUNE' ? 'AUCUNE' : type === 'BON' ? "BON" : "CARTE"}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {formData.typeCarburantDotation === 'BON' && (
                                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Label className="text-[10px] font-black uppercase text-amber-600/70 ml-1">Sélectionner le Bon d'Essence *</Label>
                                                <Select required value={formData.bonCarburantId?.toString()} onValueChange={(v) => updateField('bonCarburantId', Number(v))}>
                                                    <SelectTrigger className="h-9 rounded-xl border-amber-100 bg-amber-50/30 font-bold text-xs text-amber-900">
                                                        <SelectValue placeholder="Liste des bons disponibles" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fuelVouchers.filter(v => v.statut === 'DISPONIBLE').map(v => (
                                                            <SelectItem key={v.id} value={v.id.toString()} className="text-xs font-bold uppercase">
                                                                {v.numero} - {formatSmartCurrency(v.valeur)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {formData.typeCarburantDotation === 'CARTE' && (
                                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Label className="text-[10px] font-black uppercase text-amber-600/70 ml-1">Sélectionner la Carte Carburant *</Label>
                                                <Select required value={formData.carteCarburantId?.toString()} onValueChange={(v) => updateField('carteCarburantId', Number(v))}>
                                                    <SelectTrigger className="h-9 rounded-xl border-amber-100 bg-amber-50/30 font-bold text-xs text-amber-900">
                                                        <SelectValue placeholder="Liste des cartes configurées" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fuelCards.map(c => (
                                                            <SelectItem key={c.id} value={c.id.toString()} className="text-xs font-bold uppercase">
                                                                {c.numero} - {c.description}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {formData.typeCarburantDotation === 'AUCUNE' && (
                                            <div className="py-2 text-[10px] font-medium text-slate-400 flex items-center gap-2 justify-center">
                                                La mission sera créée sans dotation carburant initiale.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                            ANNULER
                        </Button>
                        <Button type="submit" className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-wide">
                            CRÉER LA MISSION
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            <ConfirmModal
                open={safetyModalOpen}
                onOpenChange={setSafetyModalOpen}
                onConfirm={confirmSafetyAlert}
                title="Avertissement de Sécurité"
                description={safetyMessage}
                confirmText="Affecter quand même"
                variant="warning"
            />
        </Dialog>
    );
}
