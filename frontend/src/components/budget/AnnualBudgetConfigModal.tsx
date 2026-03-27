"use client";

import { useState, useEffect } from "react";
import { 
    X, 
    Save, 
    Landmark, 
    Database, 
    CreditCard, 
    Ticket,
    Info,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AnnualBudgetConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentSettings: any;
}

export default function AnnualBudgetConfigModal({ isOpen, onClose, onSuccess, currentSettings }: AnnualBudgetConfigModalProps) {
    const [loading, setLoading] = useState(false);
    const [budgets, setBudgets] = useState({
        MAINTENANCE: 0,
        FUEL_CARD: 0,
        FUEL_BON: 0
    });

    useEffect(() => {
        if (currentSettings) {
            setBudgets({
                MAINTENANCE: currentSettings.budgetGlobalVehicules || 0,
                FUEL_CARD: currentSettings.budgetGlobalCartes || 0,
                FUEL_BON: currentSettings.budgetGlobalBons || 0
            });
        }
    }, [currentSettings, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await Promise.all([
                api.budgets.initializeGlobal({
                    field: 'MAINTENANCE',
                    amount: budgets.MAINTENANCE,
                    description: `Définition budget annuel maintenance: ${new Date().getFullYear()}`
                }),
                api.budgets.initializeGlobal({
                    field: 'FUEL_CARD',
                    amount: budgets.FUEL_CARD,
                    description: `Définition budget annuel cartes: ${new Date().getFullYear()}`
                }),
                api.budgets.initializeGlobal({
                    field: 'FUEL_BON',
                    amount: budgets.FUEL_BON,
                    description: `Définition budget annuel bons: ${new Date().getFullYear()}`
                })
            ]);

            toast.success("Budgets annuels configurés avec succès");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to initialize budgets:", error);
            toast.error("Erreur lors de la configuration des budgets");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Landmark className="w-5 h-5" />
                        Configuration Annuelle {new Date().getFullYear()}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Configuration des budgets globaux pour la maintenance, les cartes carburant et les bons d'essence.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Maintenance */}
                            <div className="space-y-2 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Database className="w-4 h-4 text-emerald-500" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Maintenance & Pièces</label>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={budgets.MAINTENANCE}
                                        onChange={(e) => setBudgets({...budgets, MAINTENANCE: parseFloat(e.target.value)})}
                                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-fleet-blue rounded-2xl py-4 px-6 text-lg font-black outline-none transition-all shadow-sm"
                                        placeholder="0"
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">FCFA</div>
                                </div>
                            </div>

                            {/* Fuel Cards */}
                            <div className="space-y-2 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-4 h-4 text-blue-500" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cartes Carburant</label>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={budgets.FUEL_CARD}
                                        onChange={(e) => setBudgets({...budgets, FUEL_CARD: parseFloat(e.target.value)})}
                                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-fleet-blue rounded-2xl py-4 px-6 text-lg font-black outline-none transition-all shadow-sm"
                                        placeholder="0"
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">FCFA</div>
                                </div>
                            </div>

                            {/* Fuel Vouchers */}
                            <div className="space-y-2 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <Ticket className="w-4 h-4 text-amber-500" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bons d'Essence</label>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={budgets.FUEL_BON}
                                        onChange={(e) => setBudgets({...budgets, FUEL_BON: parseFloat(e.target.value)})}
                                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-fleet-blue rounded-2xl py-4 px-6 text-lg font-black outline-none transition-all shadow-sm"
                                        placeholder="0"
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">FCFA</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-[30px] flex gap-4">
                            <AlertTriangle className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                            <div>
                                <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-1">Impact sur la validation</p>
                                <p className="text-[11px] font-bold text-blue-700/70 dark:text-blue-400/70 leading-relaxed">
                                    La modification des enveloppes annuelles impactera directement la validation des seuils lors de l'allocation des budgets véhicules.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-10 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px] uppercase tracking-widest" onClick={onClose}>
                            ANNULER
                        </Button>
                        <Button type="submit" disabled={loading} className="h-10 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-widest flex items-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            {loading ? "Calcul..." : "Appliquer la Configuration"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
