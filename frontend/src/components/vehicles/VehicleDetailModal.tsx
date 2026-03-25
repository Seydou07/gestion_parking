"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types/api';
import {
    Car,
    Calendar,
    Shield,
    Fuel,
    Gauge,
    Palette,
    Hash,
    FileText,
    Coins,
    AlertTriangle,
    CheckCircle,
    FileDigit,
    CalendarCheck,
    Wrench,
    Landmark,
    History,
    TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { BudgetAllocation, VehicleBudget } from '@/types/api';
import { BudgetAllocationModal } from './BudgetAllocationModal';
import { cn, formatDate, formatCurrency, formatSmartCurrency } from '@/lib/utils';

interface VehicleDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle: Vehicle | null;
    onEdit?: (vehicle: Vehicle) => void;
    onRenewInsurance?: (vehicle: Vehicle) => void;
    onRenewControl?: (vehicle: Vehicle) => void;
}

const statusConfig = {
    DISPONIBLE: { label: 'Disponible', variant: 'success' as const },
    EN_MISSION: { label: 'En mission', variant: 'info' as const },
    EN_MAINTENANCE: { label: 'Maintenance', variant: 'warning' as const },
    HORS_SERVICE: { label: 'Hors service', variant: 'destructive' as const },
};

export function VehicleDetailModal({ open, onOpenChange, vehicle, onEdit, onRenewInsurance, onRenewControl }: VehicleDetailModalProps) {
    const [budgetData, setBudgetData] = useState<VehicleBudget | null>(null);
    const [loadingBudget, setLoadingBudget] = useState(false);
    const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);

    useEffect(() => {
        if (open && vehicle) {
            fetchBudgetData();
        }
    }, [open, vehicle]);

    const fetchBudgetData = async () => {
        if (!vehicle) return;
        setLoadingBudget(true);
        try {
            const data = await api.budgets.getVehicleBudget(vehicle.id);
            setBudgetData(data);
        } catch (error) {
            console.error("Erreur lors de la récupération du budget:", error);
        } finally {
            setLoadingBudget(false);
        }
    };

    if (!vehicle) return null;

    const today = new Date();
    const assuranceDate = new Date(vehicle.assuranceExpiration);
    const controleDate = new Date(vehicle.prochainControle);

    const assuranceExpired = assuranceDate < today;
    const controleExpired = controleDate < today;
    const assuranceWarning = !assuranceExpired && (assuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    const controleWarning = !controleExpired && (controleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;

    const status = statusConfig[vehicle.statut];

    const InfoItem = ({ icon: Icon, label, value, warning, expired, onRenew }: {
        icon: React.ElementType;
        label: string;
        value: string | number;
        warning?: boolean;
        expired?: boolean;
        onRenew?: () => void;
    }) => (
        <div className={cn(
            "flex items-start gap-4 p-4 rounded-xl transition-all",
            expired && "bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20",
            warning && !expired && "bg-amber-50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20",
            !warning && !expired && "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800"
        )}>
            <div className={cn(
                "p-2 rounded-lg",
                expired && "bg-white text-red-500",
                warning && !expired && "bg-white text-amber-500",
                !warning && !expired && "bg-white dark:bg-slate-700 text-fleet-blue shadow-sm"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{label}</p>
                <p className={cn(
                    "font-bold",
                    expired && "text-red-600",
                    warning && !expired && "text-amber-600",
                    !warning && !expired && "text-slate-900 dark:text-white"
                )}>
                    {value}
                    {expired && <span className="ml-2 text-[10px] font-black uppercase px-1.5 py-0.5 bg-red-600 text-white rounded">EXPIRÉ</span>}
                    {warning && !expired && <span className="ml-2 text-[10px] font-black uppercase px-1.5 py-0.5 bg-amber-600 text-white rounded">PROCHE</span>}
                </p>
            </div>
            {(expired || warning) && onRenew && (
                <Button size="sm" variant="outline" className="h-8 text-[10px] border-amber-200" onClick={onRenew}>
                    Renouveler
                </Button>
            )}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Car className="w-5 h-5 text-white/90" />
                        Fiche Véhicule
                    </h2>
                    <Badge variant={status.variant} className="h-6 px-3 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 border-white/20 text-white mr-8">
                        {status.label}
                    </Badge>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        {/* Summary Info Bar */}
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-fleet-blue text-white flex items-center justify-center shadow-md transform rotate-2">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight leading-none uppercase">
                                    {vehicle.immatriculation}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">
                                    {vehicle.marque} {vehicle.modele} • <span className="text-fleet-blue">{vehicle.annee}</span>
                                </p>
                            </div>
                            <div className="ml-auto flex items-center gap-4 text-right">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kilométrage</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{(vehicle.kilometrage || 0).toLocaleString()} KM</p>
                                </div>
                            </div>
                        </div>

                        {/* Criticity Alerts */}
                        {(assuranceExpired || controleExpired) && (
                            <div className="p-4 rounded-xl bg-rose-500 text-white shadow-lg animate-pulse">
                                <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Alertes de validité
                                </div>
                                <div className="space-y-1 text-xs font-bold text-rose-50">
                                    {assuranceExpired && <p>• Assurance expirée ({formatDate(vehicle.assuranceExpiration)})</p>}
                                    {controleExpired && <p>• Visite technique expirée ({formatDate(vehicle.prochainControle)})</p>}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tech Stats */}
                            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Gauge className="w-3.5 h-3.5 text-fleet-blue" />
                                    Données Techniques
                                </h4>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase text-[9px]">Numéro Chassis</span>
                                        <span className="font-black text-slate-700 dark:text-slate-200">{vehicle.numeroChassis || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase text-[9px]">Transmission</span>
                                        <span className="font-black text-slate-700 dark:text-slate-200">{vehicle.transmission || 'MANUELLE'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase text-[9px]">Carburant</span>
                                        <span className="font-black text-slate-700 dark:text-slate-200">{vehicle.typeCarburant}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase text-[9px]">Réservoir</span>
                                        <span className="font-black text-slate-700 dark:text-slate-200">{vehicle.capaciteReservoir || 0} L</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase text-[9px]">Couleur</span>
                                        <span className="font-black text-slate-700 dark:text-slate-200">{vehicle.couleur || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Maintenance Tracking */}
                            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Wrench className="w-3.5 h-3.5 text-blue-500" />
                                    Suivi Maintenance
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Dernière Vidange</p>
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                {(vehicle.derniereVidangeKilometrage || 0).toLocaleString()} KM
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Prochaine Échéance</p>
                                            <p className={cn(
                                                "text-xs font-black",
                                                (vehicle.kilometrage - (vehicle.derniereVidangeKilometrage || 0)) >= (vehicle.frequenceVidange || 5000) ? "text-rose-500" : "text-slate-700 dark:text-slate-200"
                                            )}>
                                                {((vehicle.derniereVidangeKilometrage || 0) + (vehicle.frequenceVidange || 5000)).toLocaleString()} KM
                                            </p>
                                        </div>
                                        {(vehicle.kilometrage - (vehicle.derniereVidangeKilometrage || 0)) >= (vehicle.frequenceVidange || 5000) && (
                                            <Badge className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 animate-pulse">À FAIRE</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Compliance Section */}
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 md:col-span-2">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                Conformité Administrative
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assurance</p>
                                        <p className={cn("text-xs font-black", assuranceExpired ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200')}>
                                            {formatDate(vehicle.assuranceExpiration)}
                                        </p>
                                    </div>
                                    {onRenewInsurance && (
                                        <Button size="sm" variant="outline" className="h-7 text-[9px] px-3 font-black uppercase border-amber-200 text-amber-600 hover:bg-amber-50" onClick={() => onRenewInsurance(vehicle)}>
                                            Renouveler
                                        </Button>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Visite Technique</p>
                                        <p className={cn("text-xs font-black", controleExpired ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200')}>
                                            {formatDate(vehicle.prochainControle)}
                                        </p>
                                    </div>
                                    {onRenewControl && (
                                        <Button size="sm" variant="outline" className="h-7 text-[9px] px-3 font-black uppercase border-amber-200 text-amber-600 hover:bg-amber-50" onClick={() => onRenewControl(vehicle)}>
                                            Renouveler
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Budget Section */}
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                                    Gestion Budget Annuel
                                </h4>
                                <Button 
                                    size="sm" 
                                    className="h-7 text-[9px] font-black uppercase tracking-tight bg-slate-900 text-white"
                                    onClick={() => setIsAllocateModalOpen(true)}
                                >
                                    Allouer Budget
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Alloué</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">
                                        {formatSmartCurrency(budgetData?.totalAllocated || vehicle.budgetAlloue || 0)}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Consommé</p>
                                    <p className="text-xl font-black text-blue-500">
                                        {formatSmartCurrency(budgetData?.totalSpent || vehicle.budgetConsomme || 0)}
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Solde Restant</p>
                                    <p className={cn(
                                        "text-xl font-black",
                                        ((budgetData?.totalAllocated || vehicle.budgetAlloue || 0) - (budgetData?.totalSpent || vehicle.budgetConsomme || 0)) <= 0 ? "text-rose-500" : "text-emerald-600"
                                    )}>
                                        {formatSmartCurrency((budgetData?.totalAllocated || vehicle.budgetAlloue || 0) - (budgetData?.totalSpent || vehicle.budgetConsomme || 0))}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">Progression</span>
                                    <span className={cn(
                                        (budgetData?.totalSpent || 0) / (budgetData?.totalAllocated || 1) > 0.9 ? "text-rose-500" : "text-fleet-blue"
                                    )}>
                                        {Math.round(((budgetData?.totalSpent || 0) / (budgetData?.totalAllocated || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            ((budgetData?.totalSpent || 0) / (budgetData?.totalAllocated || 1)) > 0.9 ? "bg-rose-500" :
                                                ((budgetData?.totalSpent || 0) / (budgetData?.totalAllocated || 1)) > 0.7 ? "bg-amber-500" : "bg-fleet-blue"
                                        )}
                                        style={{ width: `${Math.min(100, ((budgetData?.totalSpent || 0) / (budgetData?.totalAllocated || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                        </div>

                        <BudgetAllocationModal 
                            open={isAllocateModalOpen}
                            onOpenChange={setIsAllocateModalOpen}
                            vehicle={vehicle}
                            onSuccess={() => {
                                fetchBudgetData();
                                if (onEdit) onEdit(vehicle); // To refresh global state if needed
                            }}
                        />
                    </div>

                <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end px-6">
                    <Button variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                        FERMER
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

