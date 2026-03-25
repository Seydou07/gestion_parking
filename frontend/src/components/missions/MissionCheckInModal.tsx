"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mission } from '@/types/api';
import { CheckCircle2, ChevronRight, Gauge, Wrench, Fuel, FileUp } from 'lucide-react';

interface MissionCheckInModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mission: Mission | null;
    onSubmit: (missionId: number, kmRetour: number, observation: string, montantCarburant?: number, ticketUrl?: string) => void;
}

export function MissionCheckInModal({ open, onOpenChange, mission, onSubmit }: MissionCheckInModalProps) {
    const [kmRetour, setKmRetour] = useState<number | ''>('');
    const [observation, setObservation] = useState('');
    const [montantCarburant, setMontantCarburant] = useState<number | ''>('');
    const [ticketUrl, setTicketUrl] = useState('');

    if (!mission) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (kmRetour && kmRetour >= (mission.kilometrageDepart || 0)) {
            onSubmit(mission.id, Number(kmRetour), observation, Number(montantCarburant) || undefined, ticketUrl);
            onOpenChange(false);
            setKmRetour('');
            setObservation('');
            setMontantCarburant('');
            setTicketUrl('');
        } else {
            alert("Kilométrage de retour invalide");
        }
    };

    const handleTicketUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setTicketUrl(e.target.files[0].name);
        }
    };

    return (        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                             <CheckCircle2 className="w-5 h-5 text-white/90" />
                             Enregistrement du Retour
                        </h2>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/20 text-white mr-8">
                            CHECK-IN
                        </span>
                    </div>
                    <div className="text-[10px] font-bold opacity-70 tracking-widest uppercase">
                        Destination: {mission.destination}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Section Gauche : Kilométrage */}
                            <div className="space-y-6">
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Véhicule</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{mission.vehicule?.immatriculation}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">KM au Départ</p>
                                        <p className="text-sm font-black text-emerald-600 uppercase">{mission.kilometrageDepart?.toLocaleString('fr-FR')} KM</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Relevé Compteur au Retour *</Label>
                                    <div className="relative">
                                        <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                        <Input
                                            type="number"
                                            required
                                            min={mission.kilometrageDepart}
                                            value={kmRetour}
                                            onChange={(e) => setKmRetour(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="Kilométrage actuel..."
                                            className="h-12 pl-10 text-2xl font-black rounded-xl border-emerald-200 bg-emerald-50/20 text-emerald-900 dark:text-emerald-400"
                                        />
                                    </div>
                                    {kmRetour !== '' && mission.kilometrageDepart && kmRetour >= mission.kilometrageDepart && (
                                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-right mt-1">
                                            +{(Number(kmRetour) - mission.kilometrageDepart).toLocaleString('fr-FR')} KM PARCOURUS
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Droite : Observations & Carburant */}
                            <div className="space-y-6">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-amber-700 ml-1 flex items-center gap-2">
                                            <Fuel className="w-3.5 h-3.5" /> Consommation Réelle (FCFA)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={montantCarburant}
                                            onChange={(e) => setMontantCarburant(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="Montant total dépensé..."
                                            className="h-10 px-4 rounded-xl border-amber-200 focus:border-amber-400 font-bold text-xs"
                                        />
                                    </div>

                                    {(mission.typeCarburantDotation === 'BON' || montantCarburant !== '') && (
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-amber-600/70 ml-1">Justificatif (Ticket/Reçu)</Label>
                                            <input type="file" id="ticketCarburant" className="hidden" accept=".pdf,image/*" onChange={handleTicketUpload} />
                                            <label htmlFor="ticketCarburant" className="cursor-pointer flex items-center justify-center w-full rounded-xl border border-dashed border-amber-300 bg-white/50 hover:bg-white text-amber-700 h-10 px-4 transition-colors">
                                                <FileUp className="w-3.5 h-3.5 mr-2" />
                                                <span className="text-[10px] font-black uppercase tracking-tight">
                                                    {ticketUrl ? ticketUrl : "JOINDRE LE REÇU"}
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                                        <Wrench className="w-3.5 h-3.5" /> État du Véhicule au Retour *
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {['RAS', 'NIVEAU HUILE BAS', 'PNEU DÉGONFLÉ', 'SALISSURE'].map(tag => (
                                            <button
                                                type="button"
                                                key={tag}
                                                onClick={() => setObservation(prev => prev ? `${prev} | ${tag}` : tag)}
                                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-black text-[9px] text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                                            >
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>
                                    <Textarea
                                        required
                                        value={observation}
                                        onChange={(e) => setObservation(e.target.value)}
                                        placeholder="Décrire l'état général, pannes éventuelles..."
                                        className="min-h-[80px] rounded-xl border-slate-200 focus:border-emerald-500 text-xs font-medium italic"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]"
                            onClick={() => onOpenChange(false)}
                        >
                            ANNULER
                        </Button>
                        <Button
                            type="submit"
                            className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase flex items-center gap-2"
                            disabled={!kmRetour || (mission.kilometrageDepart && kmRetour < mission.kilometrageDepart) || !observation}
                        >
                            VALIDER LE RETOUR
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

