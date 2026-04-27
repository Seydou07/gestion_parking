"use client";

import { useState } from 'react';
import { Plus, Search, Filter, Download, Route, PlaneTakeoff, PlaneLanding, MapPin, Eye, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Mission } from '@/types/api';
import { cn, formatDate, formatSmartCurrency } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import { useMissions, useVehicles, useDrivers, useFuelCards, useFuelVouchers } from '@/hooks/useFleetStore';
import { Loader2 } from 'lucide-react';
import { exportToCSV } from '@/lib/table-utils';
import StatCard from '@/components/dashboard/StatCard';

import { MissionCreateModal } from '@/components/missions/MissionCreateModal';
import { MissionCheckOutModal } from '@/components/missions/MissionCheckOutModal';
import { MissionCheckInModal } from '@/components/missions/MissionCheckInModal';
import { MissionDetailModal } from '@/components/missions/MissionDetailModal';

const statusConfig = {
    PLANIFIEE: { label: 'Planifiée', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    EN_COURS: { label: 'En Cours', className: 'bg-fleet-blue/10 text-fleet-blue animate-pulse' },
    TERMINEE: { label: 'Terminée', className: 'bg-emerald-100 text-emerald-600' },
    ANNULEE: { label: 'Annulée', className: 'bg-red-100 text-red-600' },
};

export default function MissionsPage() {
    const { missions, loading: loadingMissions, refresh: refreshMissions } = useMissions();
    const { vehicles, loading: loadingVehicles } = useVehicles();
    const { drivers, loading: loadingDrivers } = useDrivers();
    const { cards: fuelCards, loading: loadingCards } = useFuelCards();
    const { vouchers: fuelVouchers, loading: loadingVouchers } = useFuelVouchers();
    const [searchTerm, setSearchTerm] = useState('');

    // Modals state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const filteredMissions = missions.filter(m => {
        const matchesSearch = m.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.vehicule?.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.chauffeur?.nom.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || m.statut === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const sortedMissions = [...filteredMissions].sort((a, b) => {
        const dateA = new Date(a.dateDepart || 0).getTime();
        const dateB = new Date(b.dateDepart || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
    });

    const handleExport = () => {
        const exportData = filteredMissions.map(m => ({
            Destination: m.destination,
            Vehicule: m.vehicule?.immatriculation || '',
            Chauffeur: `${m.chauffeur?.prenom} ${m.chauffeur?.nom}`,
            Date_Depart: m.dateDepart,
            Date_Retour: m.dateRetour,
            Statut: m.statut,
            Dotation: m.typeCarburantDotation
        }));
        exportToCSV(exportData, 'registre_missions');
        toast.success('Export CSV généré');
    };
    const columns = [
        {
            key: 'destination',
            header: 'Ordre de Mission',
            render: (m: Mission) => (
                <div>
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{m.destination}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                            {formatDate(m.dateDepart)}
                        </span>
                        <span className="hidden md:inline text-[10px] text-slate-300">→</span>
                        <span className="hidden md:inline text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                            {formatDate(m.dateRetour)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'vehicule',
            header: 'Véhicule',
            className: "hidden sm:table-cell",
            render: (m: Mission) => {
                const vouchers = m.vouchers || [];
                const totalVouchersValue = vouchers.reduce((sum, v) => sum + v.valeur, 0);
                return (
                    <div>
                        <p className="font-bold text-fleet-blue">{m.vehicule?.immatriculation}</p>
                        <div className="hidden lg:block">
                            {m.typeCarburantDotation === 'BON' && vouchers.length > 0 ? (
                                <p className="text-[10px] font-black uppercase text-amber-600 mt-1 flex items-center gap-1">
                                    {vouchers.length} bon(s) ({formatSmartCurrency(totalVouchersValue)})
                                </p>
                            ) : m.typeCarburantDotation === 'CARTE' ? (
                                <p className="text-[10px] font-black uppercase text-amber-600 mt-1 flex items-center gap-1">
                                    Carte Carburant
                                </p>
                            ) : (
                                <p className="text-[10px] text-slate-400 mt-1">Aucune dotation</p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'chauffeur',
            header: 'Chauffeur',
            className: "hidden md:table-cell",
            render: (m: Mission) => (
                <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 uppercase">{m.chauffeur?.nom} <span className="hidden lg:inline capitalize text-slate-500">{m.chauffeur?.prenom}</span></p>
                </div>
            ),
        },
        {
            key: 'statut',
            header: 'Statut',
            render: (m: Mission) => {
                const status = statusConfig[m.statut];
                return (
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md", status.className)}>
                        {status.label}
                    </span>
                );
            },
        },
        {
            key: 'actions_metier',
            header: 'Actions',
            className: "text-right",
            render: (m: Mission) => (
                <div className="flex items-center justify-end gap-2">
                    <div className="hidden sm:flex gap-2">
                        {m.statut === 'PLANIFIEE' && (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleOpenCheckOut(m); }} className="bg-slate-900 text-white hover:bg-slate-800 font-bold tracking-widest uppercase text-[10px] h-8 shadow-md px-3">
                                Out
                            </Button>
                        )}
                        {m.statut === 'EN_COURS' && (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleOpenCheckIn(m); }} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest uppercase text-[10px] h-8 shadow-md px-3">
                                In
                            </Button>
                        )}
                    </div>

                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleOpenDetail(m); }} className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Eye className="w-4 h-4 text-slate-500" />
                    </Button>
                </div>
            )
        }
    ];

    /* Handlers */
    const handleOpenCreate = () => setIsCreateOpen(true);

    const handleOpenDetail = (m: Mission) => {
        setSelectedMission(m);
        setIsDetailOpen(true);
    };

    const handleOpenCheckOut = (m: Mission) => {
        setSelectedMission(m);
        setIsCheckOutOpen(true);
    };

    const handleOpenCheckIn = (m: Mission) => {
        setSelectedMission(m);
        setIsCheckInOpen(true);
    };

    const handleCreateSubmit = async (data: any) => {
        try {
            const { api } = await import('@/lib/api');
            
            // Map old names to new names if they exist (cache safety for browser)
            const submissionData = {
                ...data,
                dateDepart: data.dateDepart || data.dateDebut,
                dateRetour: data.dateRetour || data.dateFin,
                lettreMission: data.lettreMission || data.lettreMissionUrl
            };

            // Remove old/extra fields to avoid validation errors if forbidNonWhitelisted was on
            delete submissionData.dateDebut;
            delete submissionData.dateFin;
            delete submissionData.lettreMissionUrl;

            console.log('Submitting Mission Data:', submissionData);
            
            await api.missions.create(submissionData);

            // Sync card status if one was selected
            if (submissionData.typeCarburantDotation === 'CARTE' && submissionData.carteCarburantId) {
                await api.fuel.updateCard(submissionData.carteCarburantId, { statut: 'EN_MISSION' });
            }

            setIsCreateOpen(false);
            refreshMissions();
            toast.success('Mission planifiée avec succès');
        } catch (error) {
            console.error('Error creating mission:', error);
            toast.error('Erreur lors de la planification');
        }
    };

    const handleCheckOutSubmit = async (id: number, kmDepart: number, observation: string) => {
        try {
            const { api } = await import('@/lib/api');
            await api.missions.update(id, {
                statut: 'EN_COURS',
                kmDepart: kmDepart,
                observationDepart: observation
            });
            refreshMissions();
            toast.success("Validation de départ confirmée. Bon voyage !");
            setIsCheckOutOpen(false);
        } catch (error) {
            toast.error("Erreur lors du check-out");
        }
    };

    const handleCheckInSubmit = async (id: number, kmRetour: number, observation: string, montant?: number, ticket?: string) => {
        try {
            const { api } = await import('@/lib/api');
            const mission = missions.find(m => m.id === id);
            let finalMontant = montant;

            // Si c'est un bon, on récupère sa valeur cumulée pour l'analytics
            if (mission?.typeCarburantDotation === 'BON' && mission.vouchers && mission.vouchers.length > 0) {
                finalMontant = mission.vouchers.reduce((sum, v) => sum + v.valeur, 0);
            }

            await api.missions.update(id, {
                statut: 'TERMINEE',
                kmRetour: kmRetour,
                observationRetour: observation,
                montantCarburantUtilise: finalMontant,
                ticketCarburantUrl: ticket
            });

            // Reset card status if one was used
            if (mission?.typeCarburantDotation === 'CARTE' && mission.carteCarburantId) {
                await api.fuel.updateCard(mission.carteCarburantId, { statut: 'ACTIVE' });
            }

            refreshMissions();
            toast.success("Retour enregistré avec succès.");
            setIsCheckInOpen(false);
        } catch (error) {
            toast.error("Erreur lors du check-in");
        }
    };

    if (loadingMissions || loadingVehicles || loadingDrivers || loadingCards || loadingVouchers) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-fleet-blue" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="En Cours" 
                    value={missions.filter(m => m.statut === 'EN_COURS').length} 
                    exactValue={`${missions.filter(m => m.statut === 'EN_COURS').length} missions en cours de route`}
                    isCurrency={false} 
                    variant="default" 
                    icon={PlaneTakeoff} 
                />
                <StatCard 
                    title="Planifiées" 
                    value={missions.filter(m => m.statut === 'PLANIFIEE').length} 
                    exactValue={`${missions.filter(m => m.statut === 'PLANIFIEE').length} missions planifiées à venir`}
                    isCurrency={false} 
                    variant="warning" 
                    icon={Clock} 
                />
                <StatCard 
                    title="Terminées" 
                    value={missions.filter(m => m.statut === 'TERMINEE').length} 
                    exactValue={`${missions.filter(m => m.statut === 'TERMINEE').length} missions clôturées`}
                    isCurrency={false} 
                    variant="success" 
                    icon={CheckCircle2} 
                />
                <StatCard 
                    title="Total Missions" 
                    value={missions.length} 
                    exactValue={`${missions.length} missions enregistrées dans le registre`}
                    isCurrency={false} 
                    variant="info" 
                    icon={Route} 
                />
            </div>

            {/* Main Table Area */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-2">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher une destination..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-11 bg-slate-50 dark:bg-slate-800/50 border-transparent rounded-xl text-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-fleet-blue/20"
                        >
                            <option value="ALL">Tous les Statuts</option>
                            <option value="PLANIFIEE">Planifiée</option>
                            <option value="EN_COURS">En Cours</option>
                            <option value="TERMINEE">Terminée</option>
                            <option value="ANNULEE">Annulée</option>
                        </select>
                        <Button 
                            variant="outline" 
                            className="h-10 px-4 gap-2 shrink-0 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-fleet-blue hover:text-white transition-all"
                            onClick={handleExport}
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </Button>
                        <Button className="h-10 px-6 flex items-center gap-2 shadow-xl shadow-fleet-blue/20 transition-all font-black text-xs uppercase tracking-widest shrink-0 rounded-xl" onClick={handleOpenCreate}>
                            <Plus className="w-4 h-4" />
                            Planifier une Mission
                        </Button>
                    </div>
                </div>

                <div className="p-0">
                    <DataTable
                        data={sortedMissions}
                        columns={columns}
                        keyExtractor={(m) => m.id}
                        emptyMessage="Aucune mission trouvée."
                    />
                </div>
            </div>

            {/* Modals */}
            <MissionCreateModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                vehicles={vehicles}
                drivers={drivers}
                fuelCards={fuelCards}
                fuelVouchers={fuelVouchers}
                onSubmit={handleCreateSubmit}
            />

            <MissionCheckOutModal
                open={isCheckOutOpen}
                onOpenChange={setIsCheckOutOpen}
                mission={selectedMission}
                onSubmit={handleCheckOutSubmit}
            />

            <MissionCheckInModal
                open={isCheckInOpen}
                onOpenChange={setIsCheckInOpen}
                mission={selectedMission}
                onSubmit={handleCheckInSubmit}
            />

            <MissionDetailModal
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                mission={selectedMission}
                fuelCards={fuelCards}
            />

            <Toaster position="top-right" richColors />
        </div>
    );
}
