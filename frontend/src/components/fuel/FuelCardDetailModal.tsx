"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FuelCard } from '@/types/api';
import { CreditCard, Calendar, Landmark, StickyNote, Droplets, Pencil, RefreshCw, UserCheck, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FuelCardDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    card: FuelCard | null;
    onEdit?: (card: FuelCard) => void;
}

export function FuelCardDetailModal({ open, onOpenChange, card, onEdit }: FuelCardDetailModalProps) {
    if (!card) return null;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';

    const isExpired = card.dateExpiration ? new Date(card.dateExpiration) <= new Date() : false;
    const usagePercent = card.soldeInitial > 0 ? Math.round(((card.soldeInitial - card.solde) / card.soldeInitial) * 100) : 0;
    const remainingPercent = 100 - usagePercent;

    const PRIX_DIESEL = 675;
    const PRIX_SUPER = 750;

    const pd = (card as any).prixDiesel || PRIX_DIESEL;
    const ps = (card as any).prixSuper || PRIX_SUPER;

    const ld = Math.round((card.solde / pd) * 10) / 10;
    const ls = Math.round((card.solde / ps) * 10) / 10;

    const handleEdit = () => {
        if (onEdit) {
            onOpenChange(false);
            onEdit(card);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] p-0 border-none rounded-[35px] shadow-2xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                {/* Header Premium */}
                <div className="shrink-0 px-8 py-6 bg-fleet-blue text-white flex items-center gap-4 sticky top-0 z-50 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16"></div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-lg relative z-10">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                        <DialogTitle className="text-2xl font-black tracking-tight leading-none mb-1">
                            Fiche Carte Carburant
                        </DialogTitle>
                        <DialogDescription className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                            N° {card.numero} • {card.fournisseur}
                        </DialogDescription>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
                    {/* Status & Holder */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                <UserCheck className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Détenteur Actuel</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{card.notes || 'Non assigné'}</p>
                            </div>
                        </div>
                        <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            card.statut === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/50" :
                            card.statut === 'INACTIVE' ? "bg-slate-100 text-slate-500 border-slate-200" :
                            "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            {card.statut}
                        </span>
                    </div>

                    {/* Financial & Gauges */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-1">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Solde Restant</p>
                                <p className="text-3xl font-black text-fleet-blue tracking-tighter">{formatCurrency(card.solde)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">{remainingPercent}%</p>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Disponible</p>
                            </div>
                        </div>

                        {/* Progress Jauge */}
                        <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={cn(
                                    "absolute inset-y-0 left-0 transition-all duration-1000 ease-out",
                                    remainingPercent > 50 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
                                    remainingPercent > 20 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                                    "bg-gradient-to-r from-rose-500 to-rose-700"
                                )}
                                style={{ width: `${remainingPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Bi-Carburant Estimation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-3xl group hover:bg-emerald-50 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm text-emerald-600">
                                    <Droplets className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-[0.2em]">Diesel</span>
                            </div>
                            <p className="text-3xl font-black text-emerald-600 tracking-tighter">{ld} <span className="text-sm opacity-50">L</span></p>
                            <p className="text-[9px] font-bold text-emerald-700/60 uppercase mt-1">Estimation à {PRIX_DIESEL} F/L</p>
                        </div>

                        <div className="p-5 bg-amber-50/30 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-3xl group hover:bg-amber-50 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm text-amber-600">
                                    <Droplets className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-[0.2em]">Super 91</span>
                            </div>
                            <p className="text-3xl font-black text-amber-600 tracking-tighter">{ls} <span className="text-sm opacity-50">L</span></p>
                            <p className="text-[9px] font-bold text-amber-700/60 uppercase mt-1">Estimation à {PRIX_SUPER} F/L</p>
                        </div>
                    </div>

                    {/* Secondary Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Landmark className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Station / Fournisseur</span>
                            </div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase">{card.fournisseur}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Date Expiration</span>
                            </div>
                            <p className={cn("text-sm font-black uppercase", isExpired ? "text-rose-600" : "text-slate-800 dark:text-slate-200")}>
                                {card.dateExpiration ? new Date(card.dateExpiration).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                {onEdit && (
                    <div className="shrink-0 p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-10 rounded-xl px-8 font-black text-slate-400 text-[11px] uppercase tracking-widest"
                            onClick={() => onOpenChange(false)}
                        >
                            Fermer
                        </Button>
                        <Button
                            type="button"
                            onClick={handleEdit}
                            className="h-10 rounded-xl px-10 font-black text-[11px] text-white bg-fleet-blue hover:bg-fleet-blue-dark shadow-xl shadow-fleet-blue/20 flex items-center gap-2 uppercase tracking-widest transition-transform active:scale-95"
                        >
                            <Pencil className="w-3.5 h-3.5" /> Modifier la Carte
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
