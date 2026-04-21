"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mission, FuelCard } from '@/types/api';
import { formatDate, formatSmartCurrency, formatSmartNumber } from '@/lib/utils';
import { Map, Calendar, Car, User, Fuel, Gauge, FileText, Download, Ticket } from 'lucide-react';

interface MissionDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mission: Mission | null;
    fuelCards?: FuelCard[];
}

export function MissionDetailModal({ open, onOpenChange, mission, fuelCards = [] }: MissionDetailModalProps) {
    if (!mission) return null;

    const usedCard = fuelCards.find(c => c.id === mission.carteCarburantId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="flex items-center gap-3">
                        <span className="text-xl font-black tracking-tight">Détails de la Mission</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/20 text-white mr-8`}>
                            {mission.statut}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Vue détaillée des informations de la mission sélectionnée.
                    </DialogDescription>
                    <div className="text-[10px] font-bold opacity-70 tracking-widest uppercase">
                        ID: #{mission.id.toString().padStart(4, '0')}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {/* Quick Summary Bar */}
                    <div className="px-6 py-3 bg-white border-b border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center gap-8 sticky top-0 z-40">
                        <div className="flex items-center gap-2">
                            <Map className="w-4 h-4 text-fleet-blue" />
                            <span className="text-sm font-black">{mission.destination}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">
                                {formatDate(mission.dateDepart)} - {formatDate(mission.dateRetour)}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-slate-200 ml-auto"></div>
                        <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-black uppercase tracking-wider">{mission.vehicule?.immatriculation}</span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Ressources Personnel & Matériel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <User className="w-3.5 h-3.5" /> Chauffeur assigné
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                        {mission.chauffeur?.nom?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase">{mission.chauffeur?.nom} {mission.chauffeur?.prenom}</p>
                                        <p className="text-xs text-slate-500 font-medium">{mission.chauffeur?.telephone}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <Car className="w-3.5 h-3.5" /> Véhicule utilisé
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                        <Car className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase">{mission.vehicule?.immatriculation}</p>
                                        <p className="text-xs text-slate-500 font-medium">{mission.vehicule?.marque} {mission.vehicule?.modele}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carburant & Documents */}
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <h3 className="font-black text-amber-700 uppercase tracking-widest text-[10px] flex items-center gap-2 mb-4">
                                <Fuel className="w-3.5 h-3.5" /> Dotation Carburant
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-amber-600/70 uppercase mb-1">Mode</p>
                                            <p className="font-bold text-xs text-amber-900 dark:text-amber-500 uppercase">
                                                {mission.typeCarburantDotation}
                                            </p>
                                        </div>
                                        {mission.typeCarburantDotation === 'BON' && mission.vouchers && mission.vouchers.length > 0 && (
                                            <div className="md:col-span-2">
                                                <p className="text-[10px] font-black text-amber-600/70 uppercase mb-2">Bons d'Essence Assignés</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {mission.vouchers.map(v => (
                                                        <div key={v.id} className="bg-white dark:bg-slate-800 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                            <Ticket className="w-3 h-3 text-amber-600" />
                                                            <span className="font-black text-[10px] text-amber-900 dark:text-amber-500 uppercase">{v.numero}</span>
                                                            <span className="text-[10px] text-amber-600 font-bold">({formatSmartCurrency(v.valeur)})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-2 text-[10px] font-black text-amber-700 uppercase">
                                                    Total Dotation : {formatSmartCurrency(mission.vouchers.reduce((sum, v) => sum + v.valeur, 0))}
                                                </div>
                                            </div>
                                        )}
                                        {mission.typeCarburantDotation === 'CARTE' && usedCard && (
                                            <div>
                                                <p className="text-[10px] font-black text-amber-600/70 uppercase mb-1">Référence</p>
                                                <p className="font-black text-xs text-amber-900 dark:text-amber-500 uppercase">{usedCard.numero}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-amber-200/40">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Consommation Réelle</p>
                                        {mission.montantCarburantUtilise ? (
                                            <p className="font-black text-xl text-emerald-600">{formatSmartCurrency(mission.montantCarburantUtilise)}</p>
                                        ) : (
                                            <p className="text-xs font-medium text-slate-400 italic">Non renseigné</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {mission.lettreMission && (
                                        <div className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-amber-200/50 p-3 hover:border-fleet-blue transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-fleet-blue/10 text-fleet-blue rounded-lg">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400">Lettre de Mission</p>
                                                        <p className="text-xs font-bold truncate max-w-[150px]">{mission.lettreMission}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 text-[10px] font-black uppercase text-fleet-blue hover:bg-fleet-blue/5"
                                                        onClick={() => window.open(`https://api.placeholder.com/600/800?text=${mission.lettreMission}`, '_blank')}
                                                    >
                                                        VOIR
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {mission.ticketCarburantUrl && (
                                        <div className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-emerald-200/50 p-3 hover:border-emerald-500 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400">Ticket Carburant</p>
                                                        <p className="text-xs font-bold truncate max-w-[150px]">Justificatif de dotation</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50"
                                                        onClick={() => window.open(`https://api.placeholder.com/600/400?text=Ticket+Carburant`, '_blank')}
                                                    >
                                                        VOIR
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Télémétrie Kilométrique */}
                        {mission.statut !== 'PLANIFIEE' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-100/50 dark:bg-slate-900 rounded-xl border-l-2 border-fleet-blue">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Check-out (Départ)</p>
                                    <p className="font-black text-xl text-slate-900 dark:text-white mb-2">{formatSmartNumber(mission.kmDepart || 0)} <span className="text-[10px] text-slate-400">KM</span></p>
                                    <div className="text-[10px] font-medium text-slate-500 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg italic">
                                        "{mission.observationDepart || 'Aucune observation'}"
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-100/50 dark:bg-slate-900 rounded-xl border-l-2 border-emerald-500">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Check-in (Retour)</p>
                                    <p className="font-black text-xl text-slate-900 dark:text-white mb-2">{formatSmartNumber(mission.kmRetour || 0)} <span className="text-[10px] text-slate-400">KM</span></p>
                                        <div className="text-[10px] font-medium text-slate-500 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg italic text-right">
                                            <div className="text-emerald-600 font-black mb-1">
                                                +{formatSmartNumber((mission.kmRetour || 0) - (mission.kmDepart || 0))} KM PARCOURUS
                                            </div>
                                            "{mission.observationRetour || 'Aucune observation'}"
                                        </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end px-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 rounded-xl px-10 font-bold text-slate-500 border-slate-200 text-[11px]">
                        FERMER
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
