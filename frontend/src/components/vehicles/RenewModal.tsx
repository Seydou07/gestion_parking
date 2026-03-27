"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Vehicle } from '@/types/api';
import { Calendar, Shield } from 'lucide-react';

interface RenewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle: Vehicle | null;
    type: 'assurance' | 'visite_technique';
    onSubmit: (vehicleId: number, newDate: string, additionalInfo?: { numero?: string; compagnie?: string }) => void;
}

export function RenewModal({ open, onOpenChange, vehicle, type, onSubmit }: RenewModalProps) {
    const [newDate, setNewDate] = useState('');
    const [numero, setNumero] = useState('');
    const [compagnie, setCompagnie] = useState('');

    if (!vehicle) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (type === 'assurance') {
            onSubmit(vehicle.id, newDate, { numero, compagnie });
        } else {
            onSubmit(vehicle.id, newDate);
        }
        onOpenChange(false);
        setNewDate('');
        setNumero('');
        setCompagnie('');
    };

    const isAssurance = type === 'assurance';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        {isAssurance ? <Shield className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        {isAssurance ? 'Renouvellement Assurance' : 'Renouvellement Visite Technique'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulaire pour renouveler les documents de {vehicle.immatriculation}.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
                        {/* Info Bar */}
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Véhicule affecté</p>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                                {vehicle.immatriculation} — {vehicle.marque} {vehicle.modele}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    {isAssurance ? 'Nouv. Date d\'Expiration' : 'Date Prochaine Visite'} *
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                        type="date"
                                        required
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="h-10 pl-10 rounded-xl border-slate-200 focus:border-fleet-blue text-xs font-bold"
                                    />
                                </div>
                            </div>

                            {isAssurance && (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">N° Police d'Assurance</Label>
                                        <Input
                                            value={numero}
                                            onChange={(e) => setNumero(e.target.value)}
                                            placeholder={vehicle.assuranceNumero || 'Ex: ASS-2025-XXX'}
                                            className="h-10 px-4 rounded-xl border-slate-200 focus:border-emerald-500 text-xs font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Compagnie d'Assurance</Label>
                                        <Input
                                            value={compagnie}
                                            onChange={(e) => setCompagnie(e.target.value)}
                                            placeholder={vehicle.assuranceCompagnie || 'Ex: AXA / SONAR'}
                                            className="h-10 px-4 rounded-xl border-slate-200 focus:border-emerald-500 text-xs font-medium"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                            ANNULER
                        </Button>
                        <Button type="submit" className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-wide">
                            CONFIRMER
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
