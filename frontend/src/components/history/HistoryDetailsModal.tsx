import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { History as HistoryIcon, Clock, User, Info, Activity, Calendar, MapPin, Wrench, Shield, CreditCard, ChevronRight } from "lucide-react";
import { formatDate, formatSmartCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { HistoryLog } from "@/types/api";
import { cn } from "@/lib/utils";

interface HistoryDetailsModalProps {
    log: HistoryLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HistoryDetailsModal({ log, open, onOpenChange }: HistoryDetailsModalProps) {
    const [entityData, setEntityData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && log && log.entiteId && log.entiteType) {
            fetchEntityDetails();
        } else {
            setEntityData(null);
        }
    }, [open, log]);

    const fetchEntityDetails = async () => {
        if (!log) return;
        setLoading(true);
        try {
            let data;
            if (log.entiteType === 'MISSION') {
                data = await api.missions.getOne(log.entiteId!);
            } else if (log.entiteType === 'MAINTENANCE') {
                data = await api.maintenance.getOne(log.entiteId!);
            }
            setEntityData(data);
        } catch (error) {
            console.error("Failed to fetch entity details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5" />
                        Détails de l'Opération
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Détails historiques de l'action {log.action} effectuée par {log.utilisateur?.nom || 'l\'administrateur'}
                    </DialogDescription>
                </div>

                <div className="overflow-y-auto max-h-[80vh] p-8 space-y-6 scrollbar-hide">
                    {/* Basic Info */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-black dark:text-white">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                            <Activity className="w-5 h-5 text-fleet-blue" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                Action Effectuée
                            </p>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                {log.action}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-black dark:text-white">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                <Info className="w-3 h-3 text-fleet-blue" />
                                Module
                            </p>
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-fleet-blue/10 text-fleet-blue text-[10px] font-black uppercase tracking-widest">
                                {log.module}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-fleet-blue" />
                                Date & Heure
                            </p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {formatDate(log.createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 text-black dark:text-white">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <User className="w-3 h-3 text-fleet-blue" />
                            Exécuté par
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-fleet-blue">
                                {log.utilisateur ? `${log.utilisateur.prenom[0]}${log.utilisateur.nom[0]}` : "AD"}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white">
                                    {log.utilisateur ? `${log.utilisateur.prenom} ${log.utilisateur.nom}` : "Administrateur Système"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Linked Entity Section */}
                    {log.entiteId && (
                        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-black dark:text-white">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 text-fleet-blue" />
                                    Objet Lié: {log.entiteType} #{log.entiteId}
                                </p>
                                {loading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-fleet-blue" />}
                            </div>

                            {entityData && log.entiteType === 'MISSION' && (
                                <div className="p-5 bg-fleet-blue/5 border border-fleet-blue/10 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-fleet-blue" />
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{entityData.destination}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                            entityData.statut === 'TERMINEE' ? "bg-emerald-100 text-emerald-600" : "bg-fleet-blue/10 text-fleet-blue"
                                        )}>
                                            {entityData.statut}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Véhicule</p>
                                            <p className="text-xs font-bold">{entityData.vehicule?.immatriculation} - {entityData.vehicule?.marque}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Chauffeur</p>
                                            <p className="text-xs font-bold">{entityData.chauffeur?.nom} {entityData.chauffeur?.prenom}</p>
                                        </div>
                                    </div>
                                    {entityData.realConsommation > 0 && (
                                        <div className="pt-2 border-t border-fleet-blue/10 flex items-center justify-between">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" /> Consommation Réelle
                                            </p>
                                            <p className="text-sm font-black text-fleet-blue">{formatSmartCurrency(entityData.realConsommation)}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {entityData && log.entiteType === 'MAINTENANCE' && (
                                <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wrench className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{entityData.type}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                            entityData.statut === 'TERMINEE' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                        )}>
                                            {entityData.statut}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-bold italic">Garage:</span>
                                            <span className="font-black">{entityData.garage || 'N/A'}</span>
                                        </div>
                                        {entityData.items && entityData.items.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pièces & Fournitures</p>
                                                <div className="space-y-1.5">
                                                    {entityData.items.map((item: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                                                            <div className="flex flex-col">
                                                                <span>{item.quantite}x {item.nom}</span>
                                                                <span className={cn(
                                                                    "text-[8px] uppercase tracking-tighter",
                                                                    item.sourcePaiement === 'FUEL_CARD' ? "text-blue-500" : "text-slate-400"
                                                                )}>
                                                                    {item.sourcePaiement === 'FUEL_CARD' ? '💳 Carte Carburant' : '💰 Budget Véhicule'}
                                                                </span>
                                                            </div>
                                                            <span className={cn(
                                                                item.sourcePaiement === 'FUEL_CARD' ? "text-blue-600" : "text-slate-700 dark:text-slate-300"
                                                            )}>{formatSmartCurrency(item.total)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="pt-3 border-t border-amber-500/10 space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                                <span className="text-slate-400">Main d'œuvre ({entityData.sourceMainDoeuvre === 'FUEL_CARD' ? 'Carte' : 'Budget'})</span>
                                                <span className="text-slate-600">{formatSmartCurrency(entityData.mainDoeuvre || 0)}</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                                    <p className="text-[7px] font-black text-emerald-600 uppercase">DÉBIT BUDGET</p>
                                                    <p className="text-xs font-black text-emerald-700">
                                                        {formatSmartCurrency(
                                                            (entityData.items || [])
                                                                .filter((i: any) => i.sourcePaiement !== 'FUEL_CARD')
                                                                .reduce((acc: number, i: any) => acc + i.total, 0) + 
                                                            (entityData.sourceMainDoeuvre !== 'FUEL_CARD' ? (entityData.mainDoeuvre || 0) : 0)
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                                    <p className="text-[7px] font-black text-blue-600 uppercase">DÉBIT CARTE</p>
                                                    <p className="text-xs font-black text-blue-700">
                                                        {formatSmartCurrency(
                                                            (entityData.items || [])
                                                                .filter((i: any) => i.sourcePaiement === 'FUEL_CARD')
                                                                .reduce((acc: number, i: any) => acc + i.total, 0) + 
                                                            (entityData.sourceMainDoeuvre === 'FUEL_CARD' ? (entityData.mainDoeuvre || 0) : 0)
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex items-center justify-between">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Intervention</p>
                                                <p className="text-lg font-black text-amber-600">{formatSmartCurrency(entityData.montant)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2 pt-2 text-black dark:text-white">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Commentaire / Description</p>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                            {log.details || "Aucun détail supplémentaire."}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={() => onOpenChange(false)}
                        className="px-8 py-2.5 bg-fleet-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-fleet-blue/20 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        Fermer le Panel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
