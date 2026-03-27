"use client";

import { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Vehicle, AllocationType } from '@/types/api';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Landmark } from 'lucide-react';

import { useVehicles, useSettings } from '@/hooks/useFleetStore';

interface BudgetAllocationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle: Vehicle | null;
    onSuccess: () => void;
}

export function BudgetAllocationModal({ open, onOpenChange, vehicle, onSuccess }: BudgetAllocationModalProps) {
    const { settings } = useSettings();
    const { vehicles } = useVehicles();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [type, setType] = useState<AllocationType>('ANNUEL');
    const [comment, setComment] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicle) return;

        const allocationAmount = parseFloat(amount);
        if (isNaN(allocationAmount) || allocationAmount <= 0) {
            toast.error('Veuillez entrer un montant valide');
            return;
        }

        // --- Validation du Seuil Global ---
        const totalAllocatedOtherVehicles = vehicles
            .filter(v => v.id !== vehicle.id)
            .reduce((acc, v) => acc + (v.budgetAlloue || 0), 0);
        
        const currentVehicleAllocation = vehicle.budgetAlloue || 0;
        const newTotalAllocation = totalAllocatedOtherVehicles + currentVehicleAllocation + allocationAmount;
        const globalCap = settings?.budgetGlobalVehicules || 0;

        if (globalCap > 0 && newTotalAllocation > globalCap) {
            toast.error(`Dépassement du budget global ! Restant disponible: ${((globalCap - (totalAllocatedOtherVehicles + currentVehicleAllocation))).toLocaleString()} FCFA`);
            return;
        }

        setLoading(true);
        try {
            await api.budgets.allocate({
                vehiculeId: vehicle.id,
                montant: allocationAmount,
                annee: parseInt(year),
                type,
                commentaire: comment
            });
            toast.success('Budget alloué avec succès');
            onSuccess();
            onOpenChange(false);
            // Reset form
            setAmount('');
            setComment('');
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'allocation");
        } finally {
            setLoading(false);
        }
    };

    if (!vehicle) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Landmark className="w-5 h-5" />
                        Allocation Budget
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulaire d'allocation de budget pour le véhicule {vehicle.immatriculation}
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white dark:bg-slate-900">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type d'Allocation</Label>
                        <Select value={type} onValueChange={(v: AllocationType) => setType(v)}>
                            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold">
                                <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ANNUEL" className="font-bold uppercase text-[10px]">Allocation Annuelle</SelectItem>
                                <SelectItem value="SUPPLEMENTAIRE" className="font-bold uppercase text-[10px]">Budget Supplémentaire</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Année</Label>
                            <Input 
                                type="number" 
                                value={year} 
                                onChange={(e) => setYear(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Montant (FCFA)</Label>
                            <Input 
                                type="number" 
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commentaire / Justification</Label>
                        <Textarea 
                            placeholder="Ex: Dotation initiale année 2024..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border-none font-medium min-h-[100px]"
                        />
                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px] uppercase tracking-wide">
                            ANNULER
                        </Button>
                        <Button type="submit" disabled={loading} className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-wide flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            CONFIRMER L'ALLOCATION
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
