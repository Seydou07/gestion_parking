"use client";

import { useState } from "react";
import { 
    X, 
    DollarSign, 
    AlertTriangle, 
    CheckCircle2, 
    ArrowUpCircle,
    Info,
    Wallet
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Approvisionnement
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Ajouter des fonds au budget global {type.toLowerCase()}.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                {icons[type]}
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Catégorie</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{titles[type]}</p>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Montant à ajouter (FCFA)</label>
                            <input
                                autoFocus
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fleet-blue focus:bg-white dark:focus:bg-slate-900 outline-none text-lg font-black transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Commentaire</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Motif de l'approvisionnement..."
                                rows={3}
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fleet-blue focus:bg-white dark:focus:bg-slate-900 outline-none text-sm font-bold transition-all resize-none"
                            />
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-fleet-blue shrink-0" />
                            <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold leading-relaxed">
                                Cette opération augmentera le budget global de l'entreprise. 
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-10 flex-1 rounded-xl font-bold text-slate-500 border-slate-200 text-[11px] uppercase tracking-widest" onClick={onClose}>
                            ANNULER
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-10 flex-[2] rounded-xl font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-widest flex items-center gap-2">
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            CONFIRMER
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
