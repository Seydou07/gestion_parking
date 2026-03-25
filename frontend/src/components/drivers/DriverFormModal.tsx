"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DriverFormData } from '@/types/api';
import { UserCircle, IdCard, Calendar, Phone, Droplet, StickyNote } from 'lucide-react';

interface DriverFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: DriverFormData) => void;
    initialData?: Partial<DriverFormData>;
    mode: 'create' | 'edit';
}

export function DriverFormModal({ open, onOpenChange, onSubmit, initialData, mode }: DriverFormModalProps) {
    const [formData, setFormData] = useState<DriverFormData>({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        statut: 'DISPONIBLE',
        permisNumero: '',
        permisExpiration: '',
        dateEmbauche: '',
        notes: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        } else {
            setFormData({
                nom: '',
                prenom: '',
                telephone: '',
                email: '',
                statut: 'DISPONIBLE',
                permisNumero: '',
                permisExpiration: '',
                dateEmbauche: '',
                notes: '',
            });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    const updateField = <K extends keyof DriverFormData>(field: K, value: DriverFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <UserCircle className="w-5 h-5" />
                        {mode === 'create' ? 'Nouveau Chauffeur' : 'Modifier Chauffeur'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        {/* Section 1: Identité */}
                        <div className="space-y-4">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-fleet-blue flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-fleet-blue"></div>
                                État Civil & Contact
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nom" className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom *</Label>
                                    <Input
                                        id="nom"
                                        value={formData.nom}
                                        onChange={(e) => updateField('nom', e.target.value)}
                                        placeholder="Ex: OUEDRAOGO"
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold uppercase text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="prenom" className="text-[10px] font-black uppercase text-slate-400 ml-1">Prénom(s) *</Label>
                                    <Input
                                        id="prenom"
                                        value={formData.prenom}
                                        onChange={(e) => updateField('prenom', e.target.value)}
                                        placeholder="Lamine"
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="telephone" className="text-[10px] font-black uppercase text-slate-400 ml-1">Téléphone *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <Input
                                            id="telephone"
                                            value={formData.telephone}
                                            onChange={(e) => updateField('telephone', e.target.value)}
                                            placeholder="+226 70 00 00 00"
                                            className="h-9 pl-9 pr-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Professionnel</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        placeholder="agent@fleet.com"
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Professionnel */}
                        <div className="space-y-4 pt-2">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Aptitude & Profession
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="permisNumero" className="text-[10px] font-black uppercase text-slate-400 ml-1">Numéro de Permis *</Label>
                                    <Input
                                        id="permisNumero"
                                        value={formData.permisNumero}
                                        onChange={(e) => updateField('permisNumero', e.target.value)}
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="permisExpiration" className="text-[10px] font-black uppercase text-slate-400 ml-1">Expiration Permis *</Label>
                                    <Input
                                        id="permisExpiration"
                                        type="date"
                                        value={formData.permisExpiration}
                                        onChange={(e) => updateField('permisExpiration', e.target.value)}
                                        required
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="dateEmbauche" className="text-[10px] font-black uppercase text-slate-400 ml-1">Date d'embauche</Label>
                                    <Input
                                        id="dateEmbauche"
                                        type="date"
                                        value={formData.dateEmbauche}
                                        onChange={(e) => updateField('dateEmbauche', e.target.value)}
                                        className="h-9 px-4 rounded-xl border-slate-200 focus:border-fleet-blue font-bold text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-[10px] font-black uppercase text-slate-400 ml-1">Notes Particulières</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Signaler toute information importante..."
                                rows={2}
                                className="resize-none rounded-xl border-slate-200 focus:border-fleet-blue font-medium text-xs"
                            />
                        </div>

                    </div>

                    <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 px-6">
                        <Button type="button" variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                            ANNULER
                        </Button>
                        <Button type="submit" className="h-9 rounded-xl px-10 font-bold bg-fleet-blue hover:bg-fleet-blue-dark shadow-lg shadow-fleet-blue/20 text-[11px] text-white uppercase tracking-wide">
                            {mode === 'create' ? 'ENREGISTRER' : 'METTRE À JOUR'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
