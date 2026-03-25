"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maintenance, Vehicle } from '@/types/api';
import { useVehicles } from '@/hooks/useFleetStore';
import { 
    Wrench, 
    Calendar, 
    Gauge, 
    Building, 
    FileText, 
    Droplets, 
    Package, 
    Phone, 
    MapPin, 
    CheckCircle2, 
    Clock,
    AlertCircle,
    Download,
    Share2,
    Printer,
    Car
} from 'lucide-react';
import { formatCurrency, formatDate, formatSmartCurrency, formatSmartNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

const typeConfig = {
    vidange: { label: 'Vidange', className: 'bg-blue-50 text-blue-600 border-blue-100' },
    revision: { label: 'Révision', className: 'bg-amber-50 text-amber-600 border-amber-100' },
    reparation: { label: 'Réparation', className: 'bg-rose-50 text-rose-600 border-rose-100' },
    controle_technique: { label: 'Contrôle technique', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    pneumatiques: { label: 'Pneumatiques', className: 'bg-slate-50 text-slate-600 border-slate-100' },
    freins: { label: 'Freins', className: 'bg-orange-50 text-orange-600 border-orange-100' },
    autre: { label: 'Autre', className: 'bg-slate-50 text-slate-600 border-slate-100' },
};

interface MaintenanceDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    maintenance: Maintenance | null;
    onEdit: (maintenance: Maintenance) => void;
    onMarquerRetour?: (maintenance: Maintenance) => void;
}

export function MaintenanceDetailModal({
    open,
    onOpenChange,
    maintenance,
    onEdit,
    onMarquerRetour,
}: MaintenanceDetailModalProps) {
    const { vehicles } = useVehicles();

    if (!maintenance) return null;

    const vehicle = vehicles.find(v => v.id === maintenance.vehiculeId);
    const type = typeConfig[maintenance.type] || typeConfig.autre;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-white/80" />
                        Rapport d'Intervention
                    </h2>
                    
                    <div className="flex gap-2 mr-8">
                         <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-md">
                            <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-md">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        {/* Summary Bar */}
                        <div className="flex flex-wrap items-center gap-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-fleet-blue/10 text-fleet-blue"><Calendar className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                    <p className="text-xs font-bold">{formatDate(maintenance.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600"><Gauge className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kilométrage</p>
                                    <p className="text-xs font-bold">{formatSmartNumber(maintenance.kilometrage)} KM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><Building className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                    <p className="text-xs font-bold capitalize">{type.label}</p>
                                </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-slate-900/10 text-slate-900 dark:text-white"><FileText className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Référence</p>
                                    <p className="text-xs font-bold">#{maintenance.id.toString().padStart(6, '0')}</p>
                                </div>
                            </div>
                        </div>
                        {/* Section Véhicule & Garage */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                                     <Car className="w-6 h-6 text-fleet-blue" />
                                </div>
                                <h3 className="text-lg font-black tracking-tight mb-0.5">{vehicle?.immatriculation}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vehicle?.marque} {vehicle?.modele}</p>
                                <div className="mt-4 w-full pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between px-2">
                                    <div className="text-left">
                                        <p className="text-[8px] font-bold text-slate-300 uppercase">Statut</p>
                                        <p className="text-[10px] font-bold text-emerald-500">CONFORME</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold text-slate-300 uppercase">Immobilisé</p>
                                        <p className={cn("text-[10px] font-bold", maintenance.vehiculeAuGarage ? "text-rose-500" : "text-slate-400")}>
                                            {maintenance.vehiculeAuGarage ? "OUI" : "NON"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Building className="w-3.5 h-3.5" /> Détails Prestataire
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 rounded-lg bg-fleet-blue/10 text-fleet-blue"><Building className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500">Garage</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{maintenance.garage || 'Non spécifié'}</p>
                                        </div>
                                    </div>
                                    {maintenance.garageTelephone && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-fleet-blue/10 text-fleet-blue"><Phone className="w-3.5 h-3.5" /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500">Contact</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{maintenance.garageTelephone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description & Travaux */}
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Travaux Effectués</h4>
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                                <div className="flex gap-3 items-start">
                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl"><FileText className="w-5 h-5 text-slate-400" /></div>
                                    <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400 pt-1">{maintenance.description}</p>
                                </div>

                                {/* Fluides if oil change */}
                                {maintenance.huileType && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 flex items-center gap-3">
                                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm"><Droplets className="w-4 h-4 text-blue-500" /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-blue-400 uppercase">Huile Moteur</p>
                                                <p className="text-xs font-bold text-blue-900 dark:text-blue-100">
                                                    {maintenance.huileType} 
                                                    {((maintenance as any).huileLitrage || maintenance.huileQuantite) && ` • ${(maintenance as any).huileLitrage || maintenance.huileQuantite}L`}
                                                    {(maintenance as any).nombreBidons > 0 && ` (${(maintenance as any).nombreBidons} bidons)`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-3">
                                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-emerald-400 uppercase">Filtres</p>
                                                <p className="text-[8px] font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-tighter mt-0.5">
                                                    {maintenance.filtreHuileChange && "HUILE • "}
                                                    {maintenance.filtreAirChange && "AIR • "}
                                                    {maintenance.filtreHabitacleChange && "HABITACLE"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Pièces Détachées */}
                                {maintenance.piecesChangees && maintenance.piecesChangees.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">Pièces remplacées</p>
                                        <div className="space-y-1.5">
                                            {maintenance.piecesChangees.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-fleet-blue/10 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Package className="w-3.5 h-3.5 text-slate-300" />
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{p.nom}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-fleet-blue">{formatSmartCurrency(p.prix * p.quantite)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recap & Costs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-4 bg-slate-900 rounded-2xl text-white">
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">COÛT TOTAL</p>
                                <p className="text-xl font-black">{formatSmartCurrency(maintenance.cout)}</p>
                            </div>
                            {maintenance.prochaineMaintenance && (
                                <div className="p-4 bg-amber-500 rounded-2xl text-white">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">PROCHAINE ÉCHÉANCE</p>
                                    <p className="text-xl font-black">{formatSmartNumber(maintenance.prochaineMaintenance)} KM</p>
                                </div>
                            )}
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">TEMPS PASSÉ</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-300" />
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{maintenance.heuresTravail || '0'} H</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        {maintenance.notes && (
                            <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-[2.5rem] flex gap-4">
                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Notes du Technicien</p>
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300 italic">{maintenance.notes}</p>
                                </div>
                            </div>
                        )}
                 </div>

                <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]">
                        FERMER
                    </Button>
                    {maintenance.vehiculeAuGarage && onMarquerRetour && (
                        <Button onClick={() => onMarquerRetour(maintenance)} className="h-9 rounded-xl px-6 font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-[11px] text-white">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> MARQUER RETOUR
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
