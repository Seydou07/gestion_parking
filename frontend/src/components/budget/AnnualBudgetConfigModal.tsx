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
    AlertTriangle
} from "lucide-react";
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative p-8 pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-fleet-blue/10 rounded-2xl flex items-center justify-center border border-fleet-blue/20">
                            <Landmark className="w-7 h-7 text-fleet-blue" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Configuration Annuelle</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Définition des enveloppes globales {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
                                La modification des enveloppes annuelles impactera directement la validation des seuils lors de l'allocation des budgets véhicules. Cette action sera enregistrée comme une "Définition Initiale" dans l'historique financier.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98]"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-slate-900 dark:bg-fleet-blue text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-fleet-blue/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Save className={cn("w-5 h-5", loading && "animate-spin")} />
                            {loading ? "Enregistrement..." : "Appliquer la Configuration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
