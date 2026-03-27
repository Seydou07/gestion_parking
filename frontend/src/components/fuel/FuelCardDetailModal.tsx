"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FuelCard } from '@/types/api';
import { CreditCard, Fuel, Calendar, Hash, Building2, StickyNote, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FuelCardDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    card: FuelCard | null;
}

export function FuelCardDetailModal({ open, onOpenChange, card }: FuelCardDetailModalProps) {
    if (!card) return null;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';

    const isExpired = card.dateExpiration ? new Date(card.dateExpiration) <= new Date() : false;
    const usagePercent = card.soldeInitial > 0 ? Math.round(((card.soldeInitial - card.solde) / card.soldeInitial) * 100) : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="shrink-0 px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fleet-blue/20 rounded-full blur-[40px] -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            Fiche Carte Carburant
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-xs font-bold uppercase tracking-widest">
                            Détails complets de la carte #{card.numero}
                        </DialogDescription>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                    {/* Status & Number */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Numéro de Carte</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-wider">{card.numero}</p>
                        </div>
                        <span className={cn(
                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                            card.statut === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" :
                            card.statut === 'INACTIVE' ? "bg-slate-100 text-slate-500" :
                            "bg-rose-100 text-rose-600"
                        )}>
                            {card.statut}
                        </span>
                    </div>

                    {/* Financial Overview */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Solde Actuel</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(card.solde)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Solde Initial</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(card.soldeInitial)}</p>
                            </div>
                        </div>

                        {/* Usage bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Consommation</span>
                                <span>{usagePercent}%</span>
                            </div>
                            <div className="h-2.5 bg-white dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all", usagePercent > 80 ? "bg-rose-500" : usagePercent > 50 ? "bg-amber-500" : "bg-emerald-500")}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Liter Estimation */}
                    {(card.prixLitre || card.litresEstimes) && (
                        <div className="bg-fleet-blue/5 border border-fleet-blue/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-fleet-blue/10 rounded-xl flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-fleet-blue" />
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                {card.prixLitre && (
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Prix / Litre</p>
                                        <p className="text-lg font-black text-fleet-blue">{formatCurrency(card.prixLitre)}</p>
                                    </div>
                                )}
                                {card.litresEstimes && (
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Litres Estimés</p>
                                        <p className="text-lg font-black text-fleet-blue">{card.litresEstimes} L</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem icon={Building2} label="Fournisseur" value={card.fournisseur || 'N/A'} />
                        <DetailItem icon={Calendar} label="Expiration" value={card.dateExpiration ? new Date(card.dateExpiration).toLocaleDateString('fr-FR') : 'N/A'} alert={isExpired} />
                        <DetailItem icon={StickyNote} label="Affectation" value={card.notes || 'Non assignée'} colSpan />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({ icon: Icon, label, value, alert, colSpan }: { icon: any; label: string; value: string; alert?: boolean; colSpan?: boolean }) {
    return (
        <div className={cn("p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700", colSpan && "col-span-2")}>
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
            </div>
            <p className={cn("font-bold text-sm", alert ? "text-rose-600" : "text-slate-800 dark:text-white")}>{value}</p>
        </div>
    );
}
