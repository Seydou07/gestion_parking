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
            <DialogContent className="sm:max-w-[450px] border-none shadow-2xl overflow-hidden p-0">
                <div className="bg-slate-900 p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Landmark className="w-24 h-24 rotate-12" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Allocation Budget</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            Allocation pour {vehicle.marque} {vehicle.modele} ({vehicle.immatriculation})
                        </DialogDescription>
                    </DialogHeader>
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

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 px-6 font-bold uppercase text-[10px] tracking-widest">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="h-12 px-8 bg-slate-900 text-white hover:bg-slate-800 font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirmer l'Allocation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
