"use client";

import { useState } from 'react';
import { Plus, Search, Filter, Download, ListFilter, Car, MapPin, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Vehicle, VehicleFormData } from '@/types/api';
import { cn, formatDate } from '@/lib/utils';
import { VehicleFormModal } from '@/components/vehicles/VehicleFormModal';
import { VehicleDetailModal } from '@/components/vehicles/VehicleDetailModal';
import { RenewModal } from '@/components/vehicles/RenewModal';
import { BudgetAllocationModal } from '@/components/vehicles/BudgetAllocationModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast, Toaster } from 'sonner';
import StatCard from '@/components/dashboard/StatCard';
import { useVehicles } from '@/hooks/useFleetStore';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV } from '@/lib/table-utils';

const statusConfig = {
    DISPONIBLE: { label: 'Disponible', variant: 'success' as const },
    EN_MISSION: { label: 'En mission', variant: 'info' as const },
    EN_MAINTENANCE: { label: 'Maintenance', variant: 'warning' as const },
    HORS_SERVICE: { label: 'Hors service', variant: 'destructive' as const },
};

export default function Vehicules() {
    const { vehicles, loading, updateVehicle, refresh } = useVehicles();
    const { isUser, canEdit, canViewBudget } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [renewModalOpen, setRenewModalOpen] = useState(false);
    const [renewType, setRenewType] = useState<'assurance' | 'visite_technique'>('assurance');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [budgetAllocationOpen, setBudgetAllocationOpen] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.modele.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || v.statut === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        const exportData = filteredVehicles.map(v => ({
            Immatriculation: v.immatriculation,
            Marque: v.marque,
            Modele: v.modele,
            Annee: v.annee,
            Kilometrage: v.kilometrage,
            Statut: v.statut,
            Carburant: v.typeCarburant,
            Budget_Initial: v.budgetAlloue,
            Budget_Consomme: v.budgetConsomme
        }));
        exportToCSV(exportData, 'flotte_vehicules');
        toast.success('Export CSV généré');
    };

    const columns = [
        {
            key: 'immatriculation',
            header: 'Immatriculation',
            render: (v: Vehicle) => <span className="font-black text-fleet-blue">{v.immatriculation}</span>,
        },
        {
            key: 'marque',
            header: 'Véhicule',
            render: (v: Vehicle) => (
                <div>
                    <p className="font-bold text-slate-800">{v.marque} {v.modele}</p>
                    <p className="hidden sm:block text-xs text-slate-400 font-medium">Année {v.annee}</p>
                </div>
            ),
        },
        {
            key: 'kilometrage',
            header: 'Kilométrage',
            className: "hidden md:table-cell",
            render: (v: Vehicle) => <span className="font-bold">{v.kilometrage.toLocaleString('fr-FR')} km</span>,
        },
        {
            key: 'statut',
            header: 'État',
            className: "hidden sm:table-cell",
            render: (v: Vehicle) => {
                const status = statusConfig[v.statut];
                return (
                    <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                        v.statut === 'DISPONIBLE' ? "bg-emerald-100 text-emerald-600" :
                            v.statut === 'EN_MISSION' ? "bg-fleet-blue/10 text-fleet-blue" :
                                v.statut === 'EN_MAINTENANCE' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                    )}>
                        {status.label}
                    </span>
                );
            },
        },
        {
            key: 'typeCarburant',
            header: 'Carburant',
            className: "hidden lg:table-cell",
            render: (v: Vehicle) => (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{v.typeCarburant}</span>
                    <span className="text-[10px] text-slate-400">({v.capaciteReservoir}L)</span>
                </div>
            ),
        },
    ];

    const getRowClassName = (v: Vehicle) => {
        const today = new Date();
        const assuranceDate = new Date(v.assuranceExpiration);
        const controleDate = new Date(v.prochainControle);
        
        const isExpired = assuranceDate < today || controleDate < today;
        const isVidangeSoon = (v.kilometrage - (v.derniereVidangeKilometrage || 0)) >= (v.frequenceVidange || 5000);

        if (isExpired) return "bg-red-50/80 hover:bg-red-100/80 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-l-4 border-red-500";
        // removed amber coloring for upcoming oil changes as requested
        return "border-l-4 border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors";
    };

    const handleView = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setDetailModalOpen(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setFormMode('edit');
        setDetailModalOpen(false);
        setFormModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedVehicle(null);
        setFormMode('create');
        setFormModalOpen(true);
    };

    const handleFormSubmit = async (data: VehicleFormData) => {
        try {
            const { api } = await import('@/lib/api');
            if (formMode === 'create') {
                await api.vehicles.create(data);
                toast.success('Véhicule ajouté à la flotte avec succès');
            } else if (selectedVehicle) {
                // Sanitize data to remove internal fields the backend rejects
                const { id, budgetConsomme, createdAt, updatedAt, _count, ...updateData } = data as any;
                await updateVehicle(selectedVehicle.id, updateData);
                toast.success('Fiche véhicule mise à jour');
            }
            setFormModalOpen(false);
            refresh();
        } catch (error) {
            toast.error('Erreur lors de l\'opération');
        }
    };

    const handleRenewInsurance = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setRenewType('assurance');
        setDetailModalOpen(false);
        setRenewModalOpen(true);
    };

    const handleRenewControl = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setRenewType('visite_technique');
        setDetailModalOpen(false);
        setRenewModalOpen(true);
    };

    const handleRenewSubmit = async (vehicleId: number, newDate: string, info?: { numero?: string; compagnie?: string }) => {
        try {
            const updateData: any = {};
            if (renewType === 'assurance') {
                updateData.assuranceExpiration = newDate;
                if (info?.numero) updateData.assuranceNumero = info.numero;
                if (info?.compagnie) updateData.assuranceCompagnie = info.compagnie;
            } else {
                updateData.prochainControle = newDate;
            }
            await updateVehicle(vehicleId, updateData);
            toast.success(renewType === 'assurance' ? 'Assurance renouvelée' : 'Visite technique renouvelée');
            setRenewModalOpen(false);
            refresh();
        } catch (error) {
            toast.error('Erreur lors du renouvellement');
        }
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    const handleDelete = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (vehicleToDelete) {
            try {
                const { api } = await import('@/lib/api');
                await api.vehicles.delete(vehicleToDelete.id);
                toast.success('Véhicule retiré de la flotte');
                setDeleteModalOpen(false);
                setVehicleToDelete(null);
                refresh();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Disponibles" 
                    value={vehicles.filter(v => v.statut === 'DISPONIBLE').length} 
                    exactValue={`${vehicles.filter(v => v.statut === 'DISPONIBLE').length} véhicules disponibles`} 
                    variant="success" 
                    isCurrency={false} 
                    icon={Car} 
                />
                <StatCard 
                    title="En mission" 
                    value={vehicles.filter(v => v.statut === 'EN_MISSION').length} 
                    exactValue={`${vehicles.filter(v => v.statut === 'EN_MISSION').length} véhicules en mission`} 
                    variant="info" 
                    isCurrency={false} 
                    icon={MapPin} 
                />
                <StatCard 
                    title="En maintenance" 
                    value={vehicles.filter(v => v.statut === 'EN_MAINTENANCE').length} 
                    exactValue={`${vehicles.filter(v => v.statut === 'EN_MAINTENANCE').length} véhicules en entretien`} 
                    variant="warning" 
                    isCurrency={false} 
                    icon={Activity} 
                />
                <StatCard 
                    title="Hors service" 
                    value={vehicles.filter(v => v.statut === 'HORS_SERVICE').length} 
                    exactValue={`${vehicles.filter(v => v.statut === 'HORS_SERVICE').length} véhicules hors service`} 
                    variant="danger" 
                    isCurrency={false} 
                    icon={AlertTriangle} 
                />
            </div>

            {/* Main Data Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-2">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher Immatriculation, Marque..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-11 w-full bg-slate-50 border-none dark:bg-slate-900/50 text-sm rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-fleet-blue/20"
                        >
                            <option value="ALL">Tous les Statuts</option>
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="EN_MISSION">En Mission</option>
                            <option value="EN_MAINTENANCE">Maintenance</option>
                            <option value="HORS_SERVICE">Hors Service</option>
                        </select>
                        <Button 
                            variant="outline" 
                            className="h-10 px-4 gap-2 shrink-0 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-fleet-blue hover:text-white transition-all"
                            onClick={handleExport}
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </Button>
                        {!isUser && (
                            <Button className="h-10 px-6 flex items-center gap-2 shadow-xl shadow-fleet-blue/20 transition-all font-black text-xs uppercase tracking-widest shrink-0 rounded-xl" onClick={handleAdd}>
                                <Plus className="w-4 h-4" /> Nouveau Véhicule
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-0">
                    <DataTable
                        data={filteredVehicles}
                        columns={columns}
                        keyExtractor={(v) => v.id}
                        onView={handleView}
                        onEdit={canEdit ? handleEdit : undefined}
                        onDelete={canEdit ? handleDelete : undefined}
                        rowClassName={getRowClassName}
                        emptyMessage="Aucun véhicule trouvé dans la base de données"
                    />
                </div>
            </div>

            {/* Modals Implementation */}
            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={confirmDelete}
                title="Supprimer le véhicule"
                description={`Êtes-vous sûr de vouloir retirer le véhicule ${vehicleToDelete?.immatriculation} de la flotte ? Cette action est irréversible.`}
            />
            <VehicleFormModal
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                onSubmit={handleFormSubmit}
                initialData={selectedVehicle || undefined}
                mode={formMode}
            />

            <VehicleDetailModal
                open={detailModalOpen}
                onOpenChange={setDetailModalOpen}
                vehicle={selectedVehicle}
                onEdit={handleEdit}
                onRenewInsurance={handleRenewInsurance}
                onRenewControl={handleRenewControl}
            />

            <RenewModal
                open={renewModalOpen}
                onOpenChange={setRenewModalOpen}
                vehicle={selectedVehicle}
                type={renewType}
                onSubmit={handleRenewSubmit}
            />

            <BudgetAllocationModal 
                open={budgetAllocationOpen}
                onOpenChange={setBudgetAllocationOpen}
                vehicle={selectedVehicle}
                onSuccess={() => {
                    refresh();
                    setBudgetAllocationOpen(false);
                }}
            />

            <Toaster position="top-right" richColors />
        </div>
    );
}
