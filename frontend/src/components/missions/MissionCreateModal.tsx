"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mission, Vehicle, Driver, FuelCard, FuelVoucher } from '@/types/api';
import { formatSmartCurrency, cn } from '@/lib/utils';
import { Map, Calendar, Car, Fuel, FileUp, Search, AlertTriangle, Check, ChevronsUpDown, CreditCard, Ticket } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

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
        dateDepart: '',
        dateRetour: '',
        vehiculeId: undefined,
        chauffeurId: undefined,
        typeCarburantDotation: 'AUCUNE',
        bonCarburantIds: [],
        carteCarburantId: undefined,
        lettreMission: '',
        statut: 'PLANIFIEE'
    });

    const [vehicleSearch, setVehicleSearch] = useState('');
    const [driverSearch, setDriverSearch] = useState('');
    const [cardSearch, setCardSearch] = useState('');
    const [voucherSearch, setVoucherSearch] = useState('');
    
    const [vehicleOpen, setVehicleOpen] = useState(false);
    const [driverOpen, setDriverOpen] = useState(false);
    const [cardOpen, setCardOpen] = useState(false);
    const [voucherOpen, setVoucherOpen] = useState(false);
    
    // Safety Alert State
    const [safetyModalOpen, setSafetyModalOpen] = useState(false);
    const [potentialVehicleId, setPotentialVehicleId] = useState<number | null>(null);
    const [safetyMessage, setSafetyMessage] = useState('');

    const availableVehicles = vehicles.filter(v => v.statut === 'DISPONIBLE');
    const unavailableVehicles = vehicles.filter(v => v.statut !== 'DISPONIBLE');

    const filteredVehicles = vehicles
        .filter(v => v.immatriculation.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.marque.toLowerCase().includes(vehicleSearch.toLowerCase()));
    
    // Limit to 5 if no search
    const displayedVehicles = vehicleSearch === '' ? availableVehicles.slice(0, 5) : filteredVehicles.filter(v => v.statut === 'DISPONIBLE');
    const displayedUnavailable = vehicleSearch === '' ? [] : filteredVehicles.filter(v => v.statut !== 'DISPONIBLE');
    
    const getVehicleWarning = (v: Vehicle) => {
        const today = new Date();
        const warnings: string[] = [];
        if (v.assuranceExpiration && new Date(v.assuranceExpiration) < today) warnings.push('Assurance expirée');
        if (v.prochainControle && new Date(v.prochainControle) < today) warnings.push('Visite expirée');
        return warnings;
    };
    
    const statusLabels: Record<string, string> = {
        EN_MISSION: '🚗 En mission',
        EN_MAINTENANCE: '🔧 Au garage',
        HORS_SERVICE: '⛔ Hors service',
    };

    const availableDrivers = drivers.filter(d => d.statut === 'DISPONIBLE');

    const filteredDrivers = drivers
        .filter(d => d.statut === 'DISPONIBLE')
        .filter(d => d.nom.toLowerCase().includes(driverSearch.toLowerCase()) || d.prenom.toLowerCase().includes(driverSearch.toLowerCase()));

    // Limit to 5 if no search
    const displayedDrivers = driverSearch === '' ? availableDrivers.slice(0, 5) : filteredDrivers;

    const filteredCards = fuelCards
        .filter(c => c.statut === 'ACTIVE')
        .filter(c => 
            c.numero.toLowerCase().includes(cardSearch.toLowerCase()) || 
            (c.description || '').toLowerCase().includes(cardSearch.toLowerCase()) || 
            (c.fournisseur || '').toLowerCase().includes(cardSearch.toLowerCase())
        );

    // Limit to 5 if no search
    const displayedCards = cardSearch === '' ? filteredCards.slice(0, 5) : filteredCards;

    const filteredVouchers = fuelVouchers
        .filter(v => v.statut === 'DISPONIBLE')
        .filter(v => v.numero.toLowerCase().includes(voucherSearch.toLowerCase()));

    // Limit to 5 if no search
    const displayedVouchers = voucherSearch === '' ? filteredVouchers.slice(0, 5) : filteredVouchers;

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
            updateField('lettreMission', e.target.files[0].name);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Map className="w-5 h-5 text-white/80" />
                        Nouvelle Mission
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulaire pour planifier une nouvelle mission.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                                <input type="file" id="lettreMission" name="lettreMission" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
                                <label htmlFor="lettreMission" className="cursor-pointer inline-flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest ring-offset-background transition-colors focus-visible:outline-none bg-white text-slate-900 shadow-sm border border-slate-200 h-9 px-4 hover:bg-slate-50">
                                    {formData.lettreMission ? (
                                        <span className="truncate max-w-[150px]">{formData.lettreMission}</span>
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
                                            value={formData.dateDepart}
                                            onChange={(e) => updateField('dateDepart', e.target.value)}
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
                                            value={formData.dateRetour}
                                            onChange={(e) => updateField('dateRetour', e.target.value)}
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
                                    <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={vehicleOpen}
                                                className="w-full h-9 justify-between rounded-xl border-slate-200 font-bold text-xs"
                                            >
                                                {formData.vehiculeId
                                                    ? vehicles.find((v) => v.id === formData.vehiculeId)?.immatriculation
                                                    : "Choisir un véhicule"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 max-w-[400px]" align="start">
                                            <Command shouldFilter={false}>
                                                <CommandInput 
                                                    placeholder="Rechercher un véhicule..." 
                                                    value={vehicleSearch}
                                                    onValueChange={setVehicleSearch}
                                                />
                                                            <CommandList>
                                                    <CommandEmpty>Aucun véhicule trouvé.</CommandEmpty>
                                                    <CommandGroup heading="Véhicules Disponibles">
                                                        {displayedVehicles.map((v) => {
                                                            const warnings = getVehicleWarning(v);
                                                            return (
                                                                <CommandItem
                                                                    key={v.id}
                                                                    value={v.id.toString()}
                                                                    onSelect={() => {
                                                                        handleVehicleSelect(v.id);
                                                                        setVehicleOpen(false);
                                                                        setVehicleSearch('');
                                                                    }}
                                                                    className="flex items-center justify-between p-3"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-slate-100 rounded-lg">
                                                                            <Car className="w-4 h-4 text-slate-600" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-black text-xs uppercase">{v.immatriculation} - {v.marque}</span>
                                                                            {warnings.length > 0 && (
                                                                                <span className="text-[8px] text-amber-600 font-black">⚠ {warnings.join(', ')}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <Check
                                                                        className={cn(
                                                                            "h-4 w-4 text-fleet-blue",
                                                                            formData.vehiculeId === v.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                    {displayedUnavailable.length > 0 && (
                                                        <CommandGroup heading="Indisponibles">
                                                            {displayedUnavailable.map((v) => (
                                                                <CommandItem key={v.id} disabled className="opacity-40 p-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-slate-100 rounded-lg">
                                                                            <Car className="w-4 h-4 text-slate-400" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-black text-xs uppercase">{v.immatriculation} - {v.marque}</span>
                                                                            <span className="text-[9px] text-slate-400 font-bold uppercase">{statusLabels[v.statut] || v.statut}</span>
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    )}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Chauffeur *</Label>
                                    <Popover open={driverOpen} onOpenChange={setDriverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={driverOpen}
                                                className="w-full h-9 justify-between rounded-xl border-slate-200 font-bold text-xs"
                                            >
                                                {formData.chauffeurId
                                                    ? drivers.find((d) => d.id === formData.chauffeurId)?.nom
                                                    : "Choisir un chauffeur"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 max-w-[400px]" align="start">
                                            <Command shouldFilter={false}>
                                                <CommandInput 
                                                    placeholder="Rechercher un chauffeur..." 
                                                    value={driverSearch}
                                                    onValueChange={setDriverSearch}
                                                />
                                                            <CommandList>
                                                    <CommandEmpty>Aucun chauffeur trouvé.</CommandEmpty>
                                                    <CommandGroup heading="Chauffeurs Disponibles">
                                                        {displayedDrivers.map((d) => (
                                                            <CommandItem
                                                                key={d.id}
                                                                value={d.id.toString()}
                                                                onSelect={() => {
                                                                    updateField('chauffeurId', d.id);
                                                                    setDriverOpen(false);
                                                                    setDriverSearch('');
                                                                }}
                                                                className="flex items-center justify-between p-3"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-slate-100 rounded-lg">
                                                                        <div className="w-4 h-4 text-slate-600 bg-slate-200 rounded-full flex items-center justify-center text-[8px] font-black uppercase">
                                                                            {d.nom[0]}{d.prenom[0]}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-black text-xs uppercase">{d.prenom} {d.nom}</span>
                                                                    </div>
                                                                </div>
                                                                <Check
                                                                    className={cn(
                                                                        "h-4 w-4 text-fleet-blue",
                                                                        formData.chauffeurId === d.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
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
                                                            updateField('bonCarburantIds', []);
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
                                                <Popover open={voucherOpen} onOpenChange={setVoucherOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={voucherOpen}
                                                            className="w-full h-10 justify-between rounded-xl border-amber-100 bg-amber-50/30 font-bold text-xs text-amber-900 hover:bg-amber-100/50"
                                                        >
                                                            {formData.bonCarburantIds && formData.bonCarburantIds.length > 0
                                                                ? `${formData.bonCarburantIds.length} bon(s) sélectionné(s) (${formatSmartCurrency(
                                                                    fuelVouchers
                                                                        .filter(v => formData.bonCarburantIds?.includes(v.id))
                                                                        .reduce((sum, v) => sum + v.valeur, 0)
                                                                  )})`
                                                                : "Choisir des bons..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0 max-w-[400px]" align="start">
                                                        <Command shouldFilter={false}>
                                                            <CommandInput 
                                                                placeholder="Rechercher un bon (Numéro)..." 
                                                                value={voucherSearch}
                                                                onValueChange={setVoucherSearch}
                                                            />
                                                                        <CommandList>
                                                                <CommandEmpty>Aucun bon trouvé.</CommandEmpty>
                                                                <CommandGroup heading={voucherSearch === '' ? "Bons disponibles (Aperçu)" : "Résultats de recherche"}>
                                                                    {displayedVouchers.map((v) => (
                                                                        <CommandItem
                                                                            key={v.id}
                                                                            value={v.id.toString()}
                                                                            onSelect={() => {
                                                                                const currentIds = formData.bonCarburantIds || [];
                                                                                const newIds = currentIds.includes(v.id)
                                                                                    ? currentIds.filter(id => id !== v.id)
                                                                                    : [...currentIds, v.id];
                                                                                updateField('bonCarburantIds', newIds);
                                                                                setVoucherSearch('');
                                                                            }}
                                                                            className="flex items-center justify-between p-3"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                                                    <Ticket className="w-4 h-4 text-amber-600" />
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-black text-xs">№ {v.numero}</span>
                                                                                    <span className="text-[10px] text-amber-600 font-bold">{formatSmartCurrency(v.valeur)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <Check
                                                                                className={cn(
                                                                                    "h-4 w-4 text-amber-600",
                                                                                    formData.bonCarburantIds?.includes(v.id) ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                                {voucherSearch === '' && filteredVouchers.length > 5 && (
                                                                    <div className="p-2 text-center border-t">
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">Recherchez pour voir plus de bons</p>
                                                                    </div>
                                                                )}
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        )}

                                        {formData.typeCarburantDotation === 'CARTE' && (
                                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Label className="text-[10px] font-black uppercase text-amber-600/70 ml-1">Sélectionner la Carte Carburant *</Label>
                                                <Popover open={cardOpen} onOpenChange={setCardOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={cardOpen}
                                                            className="w-full h-10 justify-between rounded-xl border-amber-100 bg-amber-50/30 font-bold text-xs text-amber-900 hover:bg-amber-100/50"
                                                        >
                                                            {formData.carteCarburantId
                                                                ? fuelCards.find((c) => c.id === formData.carteCarburantId)?.numero
                                                                : "Choisir une carte..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0 max-w-[400px]" align="start">
                                                        <Command shouldFilter={false}>
                                                            <CommandInput 
                                                                placeholder="Rechercher une carte (Numéro, Fournisseur)..." 
                                                                value={cardSearch}
                                                                onValueChange={setCardSearch}
                                                            />
                                                            <CommandList className="no-scrollbar">
                                                                <CommandEmpty>Aucune carte trouvée.</CommandEmpty>
                                                                <CommandGroup heading={cardSearch === '' ? "Cartes actives (Aperçu)" : "Résultats de recherche"}>
                                                                    {displayedCards.map((c) => (
                                                                        <CommandItem
                                                                            key={c.id}
                                                                            value={c.id.toString()}
                                                                            onSelect={() => {
                                                                                updateField('carteCarburantId', c.id);
                                                                                setCardOpen(false);
                                                                                setCardSearch('');
                                                                            }}
                                                                            className="flex items-center justify-between p-3"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="font-black text-xs">{c.numero}</span>
                                                                                        <span className="text-[8px] bg-slate-100 px-1 py-0.5 rounded text-slate-500 font-bold uppercase">{c.fournisseur}</span>
                                                                                    </div>
                                                                                    <span className="text-[10px] text-emerald-600 font-bold">{formatSmartCurrency(c.solde)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <Check
                                                                                className={cn(
                                                                                    "h-4 w-4 text-blue-600",
                                                                                    formData.carteCarburantId === c.id ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                                {cardSearch === '' && filteredCards.length > 5 && (
                                                                    <div className="p-2 text-center border-t">
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">Recherchez pour voir plus de cartes</p>
                                                                    </div>
                                                                )}
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
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
