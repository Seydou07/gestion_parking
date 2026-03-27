"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Driver } from '@/types/api';
import {
    UserCircle, CalendarDays, IdCard, MapPin, Edit2, AlertTriangle, Phone, Mail, Droplet, Car
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface DriverDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    driver: Driver | null;
    onEdit?: (driver: Driver) => void;
}

const statusConfig = {
    DISPONIBLE: { label: 'Disponible', variant: 'success' as const },
    EN_MISSION: { label: 'En mission', variant: 'info' as const },
    INACTIF: { label: 'Inactif', variant: 'destructive' as const },
};

export function DriverDetailModal({ open, onOpenChange, driver, onEdit }: DriverDetailModalProps) {
    if (!driver) return null;

    const today = new Date();
    const permisDate = new Date(driver.permisExpiration);
    const permisExpired = permisDate < today;
    const permisWarning = !permisExpired && (permisDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;

    const status = statusConfig[driver.statut];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 border-none rounded-2xl shadow-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 bg-fleet-blue text-white flex items-center justify-between sticky top-0 z-50">
                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-white/90" />
                        Fiche Collaborateur
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Informations détaillées du chauffeur {driver.prenom} {driver.nom}
                    </DialogDescription>
                    <Badge variant={status.variant} className="h-6 px-3 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 border-white/20 text-white mr-8">
                        {status.label}
                    </Badge>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                        {/* Summary Info Bar */}
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-fleet-blue text-white flex items-center justify-center font-black text-xl shadow-md">
                                {driver.prenom[0]}{driver.nom[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight leading-none uppercase">
                                    {driver.nom} <span className="text-fleet-blue">{driver.prenom}</span>
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                                    <IdCard className="w-3.5 h-3.5" />
                                    Permis N° {driver.permisNumero}
                                </p>
                            </div>
                            <div className="ml-auto flex items-center gap-2 text-right">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiration</p>
                                    <p className={cn("text-xs font-bold", permisExpired ? 'text-rose-500' : 'text-slate-900 dark:text-white')}>
                                        {formatDate(driver.permisExpiration)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Alerte Permis */}
                        {(permisExpired || permisWarning) && (
                            <div className={cn(
                                "p-4 rounded-xl flex items-center gap-3",
                                permisExpired ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                            )}>
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                                        {permisExpired ? "Permis Expiré" : "Expiration imminente"}
                                    </p>
                                    <p className="text-xs font-medium opacity-90">
                                        Action requise avant le {formatDate(driver.permisExpiration)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Contact Info */}
                            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-fleet-blue" />
                                    Coordonnées
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400"><Phone className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400">Téléphone</p>
                                            <p className="text-sm font-bold">{driver.telephone}</p>
                                        </div>
                                    </div>
                                    {driver.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400"><Mail className="w-3.5 h-3.5" /></div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase text-slate-400">Email PRO</p>
                                                <p className="text-sm font-bold truncate max-w-[150px]">{driver.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* HR Info */}
                            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                                    Administration
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400"><CalendarDays className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400">Date d'embauche</p>
                                            <p className="text-sm font-bold">{driver.dateEmbauche ? formatDate(driver.dateEmbauche) : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400"><Droplet className="w-3.5 h-3.5 text-rose-400" /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400">Groupe Sanguin</p>
                                            <p className="text-sm font-bold">A+</p> {/* Example static, if not in type */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mission Section */}
                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-fleet-blue" />
                                Statut Opérationnel
                            </h4>

                            {driver.statut === 'EN_MISSION' && driver.missions && driver.missions.some(m => m.statut === 'EN_COURS') ? (
                                driver.missions.filter(m => m.statut === 'EN_COURS').map(mission => (
                                    <div key={mission.id} className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between group hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-white/40">Destination</p>
                                                <p className="text-sm font-black">{mission.destination}</p>
                                            </div>
                                        </div>
                                        {mission.vehicule && (
                                            <div className="text-right px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                                <p className="text-[8px] font-black uppercase text-white/40">Véhicule</p>
                                                <p className="text-xs font-black">{mission.vehicule.immatriculation}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                    <p className="text-xs font-bold text-slate-400">Aucune mission en cours</p>
                                </div>
                            )}
                        </div>
                    </div>

                <DialogFooter className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end px-6">
                    <Button variant="outline" className="h-9 rounded-xl px-6 font-bold text-slate-500 border-slate-200 text-[11px]" onClick={() => onOpenChange(false)}>
                        FERMER
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
