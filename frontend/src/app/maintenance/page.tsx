"use client";

import { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Filter, 
    Download, 
    Wrench, 
    AlertTriangle, 
    CheckCircle2, 
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Settings2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Maintenance, MaintenanceFormData } from '@/types/api';
import { useMaintenances, useVehicles, useAlerts, useBudgets } from '@/hooks/useFleetStore';
import { MaintenanceFormModal } from '@/components/maintenance/MaintenanceFormModal';
import { MaintenanceDetailModal } from '@/components/maintenance/MaintenanceDetailModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from 'sonner';
import { cn, formatCurrency, formatDate, formatSmartCurrency } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';

const typeConfig: Record<string, { label: string; color: string }> = {
    vidange: { label: 'Vidange', color: 'text-blue-500 bg-blue-50' },
    revision: { label: 'Révision', color: 'text-amber-500 bg-amber-50' },
    reparation: { label: 'Réparation', color: 'text-rose-500 bg-rose-50' },
    controle_technique: { label: 'Contrôle Technique', color: 'text-emerald-500 bg-emerald-50' },
    pneumatiques: { label: 'Pneus', color: 'text-slate-500 bg-slate-50' },
    freins: { label: 'Freins', color: 'text-orange-500 bg-orange-50' },
    autre: { label: 'Autre', color: 'text-slate-500 bg-slate-50' },
};

export default function MaintenancePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { maintenances, loading: loadingMaint, add, update, remove, marquerRetourGarage } = useMaintenances();
    const { vehicles, loading: loadingVehicles, refresh: refreshVehicles } = useVehicles();
    const { alerts, markRead, refresh: refreshAlerts } = useAlerts();
    
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [preselectedVehicleId, setPreselectedVehicleId] = useState<number | undefined>();
    const [preselectedType, setPreselectedType] = useState<Maintenance['type'] | undefined>();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [maintenanceToDelete, setMaintenanceToDelete] = useState<Maintenance | null>(null);

    // Check for alerts on mount
    useEffect(() => {
        refreshAlerts();
    }, [refreshAlerts]);

    const getVehicle = (id: number) => vehicles.find(v => v.id === id);
    const maintenanceAlerts = alerts.filter(a => a.module === 'MAINTENANCE' && !a.lue);

    const filteredMaintenances = maintenances.filter(m => {
        const v = getVehicle(m.vehiculeId);
        return (
            v?.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.garage?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const totalCouts = maintenances.reduce((acc, m) => acc + (m.montant || 0), 0);
    const vehiculesEnMaintenance = vehicles.filter(v => v.statut === 'EN_MAINTENANCE').length;

    const columns = [
        { 
            key: 'date', 
            header: 'Date', 
            render: (m: Maintenance) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{formatDate(m.dateDebut)}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">REF-{m.id.toString().padStart(4, '0')}</span>
                </div>
            )
        },
        { 
            key: 'vehiculeId', 
            header: 'Véhicule', 
            render: (m: Maintenance) => { 
                const v = getVehicle(m.vehiculeId); 
                return v ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-400">
                            {v.marque[0]}{v.modele[0]}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white leading-none">{v.immatriculation}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{v.marque} {v.modele}</p>
                        </div>
                    </div>
                ) : '-'; 
            }
        },
        { 
            key: 'type', 
            header: 'Type', 
            render: (m: Maintenance) => (
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                    typeConfig[m.type]?.color || typeConfig.autre.color
                )}>
                    {typeConfig[m.type]?.label || m.type}
                </span>
            ) 
        },
        { 
            key: 'cout', 
            header: 'Coût', 
            render: (m: Maintenance) => (
                <span className="font-black text-slate-900 dark:text-white">
                    {formatSmartCurrency(m.montant || 0)}
                </span>
            ) 
        },
        { 
            key: 'garage', 
            header: 'Garage', 
            render: (m: Maintenance) => (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 capitalize">{m.garage || '-'}</span>
                </div>
            ) 
        },
        {
            key: 'status',
            header: 'Statut',
            render: (m: Maintenance) => {
                const statusConfig: Record<string, { label: string; className: string }> = {
                    EN_ATTENTE: { label: 'PLANIFIÉE', className: 'bg-amber-100 text-amber-600' },
                    EN_COURS: { label: 'AU GARAGE', className: 'bg-fleet-blue/10 text-fleet-blue' },
                    TERMINEE: { label: 'TERMINÉE', className: 'bg-emerald-100 text-emerald-600' },
                    ANNULEE: { label: 'ANNULÉE', className: 'bg-slate-100 text-slate-500' },
                };
                const cfg = statusConfig[m.statut] || statusConfig.EN_ATTENTE;
                return (
                    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase", cfg.className)}>
                        {cfg.label}
                    </span>
                );
            }
        }
    ];

    const handleView = (m: Maintenance) => { setSelectedMaintenance(m); setDetailModalOpen(true); };
    const handleEdit = (m: Maintenance) => { setSelectedMaintenance(m); setFormMode('edit'); setDetailModalOpen(false); setFormModalOpen(true); };
    const handleAdd = () => { setSelectedMaintenance(null); setFormMode('create'); setPreselectedVehicleId(undefined); setPreselectedType(undefined); setFormModalOpen(true); };

    const handleAlertClick = (alert: any) => {
        markRead(alert.id);
        if (alert.vehicule?.id) {
            setPreselectedVehicleId(alert.vehicule.id);
            setPreselectedType('VIDANGE');
            setSelectedMaintenance(null);
            setFormMode('create');
            setFormModalOpen(true);
        }
    };

    const handleFormSubmit = async (data: MaintenanceFormData) => {
        if (formMode === 'create') { 
            await add(data); 
            refreshVehicles();
            toast.success('Intervention enregistrée avec succès'); 
        } else if (selectedMaintenance) { 
            await update(selectedMaintenance.id, data); 
            refreshVehicles();
            toast.success('Intervention mise à jour'); 
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Headers are removed to keep it professional and match the new UI direction */}

            {/* Alerts Section */}
            {maintenanceAlerts.length > 0 && (
                <div className="space-y-3">
                    {maintenanceAlerts.map(alert => (
                        <div 
                            key={alert.id} 
                            onClick={() => handleAlertClick(alert)} 
                            className="group p-5 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900 border border-amber-200 dark:border-amber-900/30 rounded-3xl cursor-pointer hover:shadow-lg transition-all flex items-center gap-4 animate-in slide-in-from-top-2"
                        >
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-slate-900 dark:text-white">{alert.message}</p>
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1">Cliquez pour régulariser l'entretien</p>
                            </div>
                            <Button size="sm" variant="outline" className="rounded-xl border-amber-200 text-amber-600 font-black text-[10px] px-4">AGIR</Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Coûts de Maintenance"
                    value={totalCouts}
                    exactValue={`${formatCurrency(totalCouts)} dépensés en entretien au total`}
                    icon={TrendingUp}
                    trend={{ value: 12, isPositive: true }}
                    variant="info"
                />

                <StatCard
                    title="Alertes Actives"
                    value={maintenanceAlerts.length}
                    exactValue={`${maintenanceAlerts.length} véhicules nécessitant une vidange ou révision`}
                    icon={AlertTriangle}
                    variant="warning"
                    isCurrency={false}
                />

                <StatCard
                    title="Véhicules Immobilisés"
                    value={vehiculesEnMaintenance}
                    exactValue={`${vehiculesEnMaintenance} véhicules actuellement au garage`}
                    icon={Wrench}
                    variant="danger"
                    isCurrency={false}
                />
            </div>

            {/* Content Section */}
            <div className="card-premium overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Véhicule, garage, description..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-11 w-full bg-slate-50 border-none dark:bg-slate-900/50 text-sm rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                        <Button variant="outline" className="h-10 px-4 gap-2 shrink-0 text-xs font-black uppercase tracking-widest rounded-xl">
                            <Filter className="w-3.5 h-3.5" /> Filtrer
                        </Button>
                        <Button 
                            onClick={handleAdd}
                            className="h-10 px-6 bg-fleet-blue hover:bg-fleet-blue-dark text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-fleet-blue/20 shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            NOUVELLE INTERVENTION
                        </Button>
                        <button className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-fleet-blue hover:bg-slate-50 transition-all shadow-sm shrink-0">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <DataTable 
                    data={filteredMaintenances} 
                    columns={columns} 
                    keyExtractor={(m) => m.id} 
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={(m) => {
                        setMaintenanceToDelete(m);
                        setDeleteModalOpen(true);
                    }} 
                    emptyMessage="Aucun dossier de maintenance enregistré" 
                />
            </div>

            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={() => {
                    if (maintenanceToDelete) {
                        remove(maintenanceToDelete.id);
                        toast.success('Intervention supprimée');
                        setMaintenanceToDelete(null);
                    }
                }}
                title="Supprimer l'intervention"
                description="Êtes-vous sûr de vouloir supprimer définitivement ce dossier d'intervention ? Cette action est irréversible."
            />

            {/* Modals */}
            <MaintenanceFormModal 
                open={formModalOpen} 
                onOpenChange={setFormModalOpen} 
                onSubmit={handleFormSubmit} 
                initialData={selectedMaintenance || undefined} 
                mode={formMode} 
                preselectedVehicleId={preselectedVehicleId}
                preselectedType={preselectedType}
            />

            <MaintenanceDetailModal 
                open={detailModalOpen} 
                onOpenChange={setDetailModalOpen} 
                maintenance={selectedMaintenance} 
                onEdit={handleEdit}
                onMarquerRetour={(m) => {
                    marquerRetourGarage(m.id);
                    toast.success('Véhicule de retour en service');
                    setDetailModalOpen(false);
                }}
            />
        </div>
    );
}
