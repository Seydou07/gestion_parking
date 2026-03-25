"use client";

import { useState } from "react";
import { 
    X, 
    DollarSign, 
    AlertTriangle, 
    CheckCircle2, 
    ArrowUpCircle,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface GlobalBudgetSupplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: 'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON';
}

export default function GlobalBudgetSupplyModal({ isOpen, onClose, onSuccess, type }: GlobalBudgetSupplyModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const titles = {
        'MAINTENANCE': "Approvisionnement Budget Entretien",
        'FUEL_CARD': "Approvisionnement Budget Cartes",
        'FUEL_BON': "Approvisionnement Budget Bons d'Essence"
    };

    const icons = {
        'MAINTENANCE': <DollarSign className="w-6 h-6 text-emerald-500" />,
        'FUEL_CARD': <DollarSign className="w-6 h-6 text-blue-500" />,
        'FUEL_BON': <DollarSign className="w-6 h-6 text-amber-500" />
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Veuillez entrer un montant valide supérieur à 0");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.budgets.supplyGlobal({
                field: type,
                amount: numAmount,
                description: description || `Approvisionnement ${type}`
            });
            
            toast.success("Budget approvisionné avec succès !");
            onSuccess();
            onClose();
            setAmount("");
            setDescription("");
        } catch (error: any) {
            console.error("Failed to supply budget:", error);
            toast.error(error.message || "Erreur lors de l'approvisionnement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                                {icons[type]}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                                    {titles[type]}
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Action Tracée</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ArrowUpCircle className="w-3.5 h-3.5 text-fleet-blue" />
                                Montant à ajouter (FCFA)
                            </label>
                            <input
                                autoFocus
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fleet-blue focus:bg-white dark:focus:bg-slate-900 outline-none text-lg font-black transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3.5 h-3.5 text-slate-400" />
                                Description / Commentaire
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Motif de l'approvisionnement..."
                                rows={3}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fleet-blue focus:bg-white dark:focus:bg-slate-900 outline-none text-sm font-medium transition-all resize-none"
                            />
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-fleet-blue shrink-0" />
                            <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold leading-relaxed">
                                Cette opération augmentera le budget global de l'entreprise. 
                                Elle sera enregistrée dans l'historique de traçabilité financière.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] h-12 bg-fleet-blue text-white rounded-xl font-black shadow-lg shadow-fleet-blue/25 hover:shadow-fleet-blue/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Confirmer l'Approvisionnement
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
