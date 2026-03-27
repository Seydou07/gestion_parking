"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mission } from '@/types/api';
import { LogOut, ChevronRight, Gauge } from 'lucide-react';

interface MissionCheckOutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mission: Mission | null;
    onSubmit: (missionId: number, kmDepart: number, observation: string) => void;
}

export function MissionCheckOutModal({ open, onOpenChange, mission, onSubmit }: MissionCheckOutModalProps) {
    const [kmDepart, setKmDepart] = useState<number | ''>(mission?.kmDepart || mission?.vehicule?.kilometrage || '');
    const [observation, setObservation] = useState('Véhicule en bon état visuel et fonctionnel. RAS.');

    if (!mission) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (kmDepart && observation) {
            onSubmit(mission.id, Number(kmDepart), observation);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                         <LogOut className="w-5 h-5" />
                         Départ en Mission (Check-Out)
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Enregistrement du départ pour la mission.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        {/* Info Bar */}
                        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Véhicule (IMMAT)</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{mission.vehicule?.immatriculation}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernier Kilométrage</p>
                                <p className="text-sm font-black text-fleet-blue uppercase">{mission.vehicule?.kilometrage.toLocaleString('fr-FR')} KM</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Relevé Kilométrique au Départ *</Label>
                                <div className="relative">
                                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fleet-blue" />
                                    <Input
                                        type="number"
                                        required
                                        placeholder="Saisir le kilométrage actuel..."
                                        value={kmDepart}
                                        onChange={(e) => setKmDepart(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="h-12 pl-10 text-xl font-black rounded-xl border-slate-200 focus:border-fleet-blue"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">État Initial / Observations *</Label>
                                <Input
                                    required
                                    placeholder="Observations sur l'état du véhicule..."
                                    value={observation}
                                    onChange={(e) => setObservation(e.target.value)}
                                    className="h-10 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-medium text-xs italic"
                                />
                            </div>
                        </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                            ANNULER
                        </Button>
                        <Button type="submit" className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase flex items-center gap-2">
                            VALIDER LE DÉPART
                            <LogOut className="w-3.5 h-3.5" />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
