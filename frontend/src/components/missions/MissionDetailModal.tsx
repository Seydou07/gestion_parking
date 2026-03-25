"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mission } from '@/types/api';
import { mockFuelCards, mockFuelVouchers } from '@/data/mockData';
import { formatDate, formatSmartCurrency, formatSmartNumber } from '@/lib/utils';
import { Map, Calendar, Car, User, Fuel, Gauge, FileText, Download } from 'lucide-react';

interface MissionDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mission: Mission | null;
}

export function MissionDetailModal({ open, onOpenChange, mission }: MissionDetailModalProps) {
    if (!mission) return null;

    const usedVoucher = mockFuelVouchers.find(v => v.id === mission.bonCarburantId);
    const usedCard = mockFuelCards.find(c => c.id === mission.carteCarburantId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black tracking-tight">Détails de la Mission</h2>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/20 text-white mr-8`}>
                            {mission.statut}
                        </span>
                    </div>
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
                                {formatDate(mission.dateDebut)} - {formatDate(mission.dateFin)}
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
                                        {mission.typeCarburantDotation === 'BON' && usedVoucher && (
                                            <div>
                                                <p className="text-[10px] font-black text-amber-600/70 uppercase mb-1">Référence</p>
                                                <p className="font-black text-xs text-amber-900 dark:text-amber-500 uppercase">{usedVoucher.numero}</p>
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

                                <div className="space-y-2">
                                    {mission.lettreMissionUrl && (
                                        <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-amber-200/50">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-fleet-blue" />
                                                <span className="text-[10px] font-black uppercase text-slate-700">Lettre de Mission</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-fleet-blue"><Download className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    )}
                                    {mission.ticketCarburantUrl && (
                                        <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-amber-200/50">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-600" />
                                                <span className="text-[10px] font-black uppercase text-slate-700">Ticket Carburant</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600"><Download className="w-3.5 h-3.5" /></Button>
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
                                    <p className="font-black text-xl text-slate-900 dark:text-white mb-2">{formatSmartNumber(mission.kilometrageDepart || 0)} <span className="text-[10px] text-slate-400">KM</span></p>
                                    <div className="text-[10px] font-medium text-slate-500 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg italic">
                                        "{mission.observationDepart || 'Aucune observation'}"
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-100/50 dark:bg-slate-900 rounded-xl border-l-2 border-emerald-500">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Check-in (Retour)</p>
                                    <p className="font-black text-xl text-slate-900 dark:text-white mb-2">{formatSmartNumber(mission.kilometrageRetour || 0)} <span className="text-[10px] text-slate-400">KM</span></p>
                                        <div className="text-[10px] font-medium text-slate-500 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg italic text-right">
                                            <div className="text-emerald-600 font-black mb-1">
                                                +{formatSmartNumber((mission.kilometrageRetour || 0) - (mission.kilometrageDepart || 0))} KM PARCOURUS
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
