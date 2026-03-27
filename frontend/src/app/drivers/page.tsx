"use client";

import { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Driver, DriverFormData } from '@/types/api';
import { cn } from '@/lib/utils';
import { DriverFormModal } from '@/components/drivers/DriverFormModal';
import { DriverDetailModal } from '@/components/drivers/DriverDetailModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from 'sonner';
import StatCard from '@/components/dashboard/StatCard';
import { useDrivers } from '@/hooks/useFleetStore';
import { Loader2 } from 'lucide-react';

const statusConfig = {
    DISPONIBLE: { label: 'Disponible', className: 'badge-success' },
    EN_MISSION: { label: 'En mission', className: 'badge-info' },
    INACTIF: { label: 'Inactif', className: 'badge-danger' },
};

export default function DriversPage() {
    const { drivers: chauffeurs, loading, updateDriver, refresh } = useDrivers();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

    const filteredChauffeurs = chauffeurs.filter(c =>
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telephone.includes(searchTerm)
    );

    const columns = [
        {
            key: 'nom',
            header: 'Chauffeur',
            render: (c: Driver) => (
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-10 h-10 rounded-full bg-fleet-blue/10 items-center justify-center border border-fleet-blue/20">
                        <span className="text-sm font-black text-fleet-blue">
                            {c.prenom[0]}{c.nom[0]}
                        </span>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white uppercase">{c.nom} <span className="hidden sm:inline capitalize font-medium text-slate-600 dark:text-slate-300">{c.prenom}</span></p>
                        <p className="hidden md:block text-xs text-slate-400 font-medium">{c.email || 'Aucun email'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'telephone',
            header: 'Téléphone',
            className: "hidden sm:table-cell",
            render: (c: Driver) => (
                <span className="font-bold text-slate-700 dark:text-slate-300">{c.telephone}</span>
            )
        },
        {
            key: 'permisNumero',
            header: 'N° Permis',
            className: "hidden md:table-cell",
            render: (c: Driver) => (
                <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                    {c.permisNumero}
                </span>
            ),
        },
        {
            key: 'statut',
            header: 'Statut',
            render: (c: Driver) => {
                const status = statusConfig[c.statut];
                return (
                    <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                        c.statut === 'DISPONIBLE' ? "bg-emerald-100 text-emerald-600" :
                            c.statut === 'EN_MISSION' ? "bg-fleet-blue/10 text-fleet-blue" :
                                "bg-red-100 text-red-600"
                    )}>
                        {status.label}
                    </span>
                );
            },
        },
    ];

    const handleOpenCreate = () => {
        setFormMode('create');
        setSelectedDriver(null);
        setIsFormOpen(true);
    };

    const handleView = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDetailOpen(true);
    };

    const handleEdit = (driver: Driver) => {
        setSelectedDriver(driver);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDelete = (driver: Driver) => {
        setDriverToDelete(driver);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (driverToDelete) {
            try {
                const { api } = await import('@/lib/api');
                await api.drivers.delete(driverToDelete.id);
                toast.success('Chauffeur supprimé avec succès');
                setDeleteModalOpen(false);
                setDriverToDelete(null);
                refresh();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleFormSubmit = async (data: DriverFormData) => {
        try {
            const { api } = await import('@/lib/api');
            if (formMode === 'create') {
                await api.drivers.create(data);
                toast.success('Nouveau chauffeur enregistré avec succès');
            } else if (selectedDriver) {
                await updateDriver(selectedDriver.id, data);
                toast.success('Fiche chauffeur mise à jour avec succès');

                if (isDetailOpen) {
                    setSelectedDriver({ ...selectedDriver, ...data } as Driver);
                }
            }
            setIsFormOpen(false);
            refresh();
        } catch (error) {
            toast.error('Erreur lors de l\'opération');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-fleet-blue" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Disponibles" 
                    value={chauffeurs.filter(c => c.statut === 'DISPONIBLE').length} 
                    isCurrency={false}
                    extraValue="0 FCFA"
                    variant="success" 
                />
                <StatCard 
                    title="En mission" 
                    value={chauffeurs.filter(c => c.statut === 'EN_MISSION').length} 
                    isCurrency={false}
                    extraValue="0 FCFA"
                    variant="info" 
                />
                <StatCard 
                    title="Inactifs / Congés" 
                    value={chauffeurs.filter(c => c.statut === 'INACTIF').length} 
                    isCurrency={false}
                    extraValue="0 FCFA"
                    variant="danger" 
                />
            </div>

            {/* Main Table Area */}
            <div className="card-premium">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher par nom, matricule ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                        <Button variant="outline" className="h-12 px-6 gap-2">
                            <Filter className="w-4 h-4" /> Filtrer
                        </Button>
                        <Button variant="outline" className="h-12 px-6 gap-2">
                            <Download className="w-4 h-4" /> Export
                        </Button>
                        <Button className="h-12 px-6 flex items-center gap-2 shadow-xl shadow-fleet-blue/20 transition-all font-bold shrink-0" onClick={handleOpenCreate}>
                            <Plus className="w-5 h-5" />
                            Nouveau Chauffeur
                        </Button>
                    </div>
                </div>

                <div className="p-0">
                    <DataTable
                        data={filteredChauffeurs}
                        columns={columns}
                        keyExtractor={(c) => c.id}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        emptyMessage="Aucun collaborateur trouvé pour cette recherche."
                    />
                </div>
            </div>

            <ConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={confirmDelete}
                title="Supprimer le chauffeur"
                description={`Êtes-vous sûr de vouloir supprimer définitivement la fiche de ${driverToDelete?.prenom} ${driverToDelete?.nom} ? Cette action est irréversible.`}
            />

            {/* Modals */}
            <DriverFormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                mode={formMode}
                initialData={selectedDriver || undefined}
                onSubmit={handleFormSubmit}
            />

            <DriverDetailModal
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                driver={selectedDriver}
                onEdit={(driver) => {
                    setSelectedDriver(driver);
                    setFormMode('edit');
                    setIsFormOpen(true);
                }}
            />
        </div>
    );
}
