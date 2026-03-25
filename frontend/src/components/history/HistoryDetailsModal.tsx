"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { History as HistoryIcon, Clock, User, Info, Activity, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HistoryLog {
    id: number;
    action: string;
    module: string;
    description: string;
    createdAt: string;
    user?: { nom: string; prenom: string };
}

interface HistoryDetailsModalProps {
    log: HistoryLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HistoryDetailsModal({ log, open, onOpenChange }: HistoryDetailsModalProps) {
    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5" />
                        Détails de l'Opération
                    </h2>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <User className="w-3 h-3 text-fleet-blue" />
                            Exécuté par
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-fleet-blue">
                                {log.user ? `${log.user.prenom[0]}${log.user.nom[0]}` : "AD"}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white">
                                    {log.user ? `${log.user.prenom} ${log.user.nom}` : "Administrateur Système"}
                                </p>
                                <p className="text-[10px] font-medium text-slate-500 italic">Rôle: {log.user ? 'Utilisateur' : 'Super Admin'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description Complète</p>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                            {log.description}
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
