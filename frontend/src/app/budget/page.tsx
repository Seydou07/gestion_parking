"use client";

import { useEffect, useState, useMemo } from "react";
import { 
    Plus,
    History,
    Landmark,
    Ticket,
    Fuel,
    Car,
    ArrowUpCircle,
    Gauge,
    LayoutDashboard,
    Wallet,
    TrendingUp,
    ShieldCheck,
    CreditCard,
    Search,
    AlertTriangle,
    TrendingDown,
    Zap,
    Wrench,
    ArrowRight,
    TrendingUp as TrendingUpIcon,
    AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import GlobalBudgetSupplyModal from "@/components/budget/GlobalBudgetSupplyModal";
import AnnualBudgetConfigModal from "@/components/budget/AnnualBudgetConfigModal";
import { HistoryDetailsModal } from "@/components/history/HistoryDetailsModal";
import { Button } from '@/components/ui/button';
import StatCard from "@/components/dashboard/StatCard";
import VehicleBudgetDetailModal from "@/components/budget/VehicleBudgetDetailModal";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

export default function BudgetPage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal states
    const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [supplyType, setSupplyType] = useState<'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON'>('MAINTENANCE');

    // Details states
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    
    // Vehicle Detail Modal
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.budgets.getSummary();
            setSummary(data);
        } catch (error) {
            console.error("Failed to fetch budget summary:", error);
            toast.error("Impossible de charger le tableau de bord financier");
        } finally {
            setLoading(false);
        }
    };

    const openSupplyModal = (type: 'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON') => {
        setSupplyType(type);
        setIsSupplyModalOpen(true);
    };

    const handleOpenVehicleDetails = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setIsVehicleModalOpen(true);
    };

    const filteredVehicles = useMemo(() => {
        if (!summary?.vehicleStats) return [];
        return summary.vehicleStats.filter((v: any) => 
            v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.modele.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [summary?.vehicleStats, searchTerm]);

    // Intelligence Flotte : Calcul des Rankings Critiques
    const analytics = useMemo(() => {
        if (!summary?.vehicleStats) return null;
        const stats = summary.vehicleStats;

        // 1. Plus gros consommateurs (Dépenses Totales)
        const topExpenses = [...stats].sort((a, b) => b.totalExpenses - a.totalExpenses).slice(0, 3);
        
        // 2. Plus coûteux au Km (Efficacité)
        const topCostPerKm = [...stats].sort((a, b) => b.costPerKm - a.costPerKm).slice(0, 3);
        
        // 3. Maintenance Intensive (Gros budget maintenance)
        const topMaintenance = [...stats].sort((a, b) => b.budgetConsomme - a.budgetConsomme).slice(0, 3);

        return { topExpenses, topCostPerKm, topMaintenance };
    }, [summary?.vehicleStats]);

    if (loading || !summary) return (
        <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-fleet-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 font-bold tracking-tight uppercase text-xs">Consolidation des données financières...</p>
        </div>
    );

    const { settings, fuelCards, fuelVouchers, maintenance } = summary;

    const vehicleColumns = [
        {
            key: 'vehicle', header: 'Véhicule', render: (v: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                        <Car className="w-6 h-6 text-slate-400 group-hover:text-fleet-blue" />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{v.immatriculation}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.marque} {v.modele}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'usage', header: 'Usage & Efficacité', render: (v: any) => (
                <div className="space-y-1">
                    <p className="font-black text-slate-700 dark:text-slate-300 text-sm">{(v.kilometrage || 0).toLocaleString()} <span className="text-[10px] opacity-60">KM</span></p>
                    <div className="flex items-center gap-1.5">
                        <Gauge className="w-3 h-3 text-fleet-blue" />
                        <span className="text-[11px] font-black text-fleet-blue uppercase tracking-tight">{v.costPerKm.toFixed(1)} CFA / KM</span>
                    </div>
                </div>
            )
        },
        {
            key: 'breakdown', header: 'Maint. / Carb.', className: "text-right", render: (v: any) => (
                <div className="space-y-1">
                    <p className="text-xs font-black text-emerald-600">{formatCurrency(v.budgetConsomme)}</p>
                    <p className="text-[10px] font-bold text-amber-500 uppercase">{formatCurrency(v.fuelSpent)}</p>
                </div>
            )
        },
        {
            key: 'total', header: 'Total Dépenses', className: "text-right", render: (v: any) => (
                <div className="flex flex-col items-end">
                    <p className={cn(
                        "text-base font-black tracking-tight",
                        v.totalExpenses > v.budgetAlloue ? "text-rose-600" : "text-slate-900 dark:text-white"
                    )}>
                        {formatCurrency(v.totalExpenses)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget: {formatCurrency(v.budgetAlloue)}</span>
                        {v.totalExpenses > v.budgetAlloue && <AlertCircle className="w-3 h-3 text-rose-500" />}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            {/* Header / Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <StatCard title="Budget Total" value={maintenance.initialEnvelope} exactValue={`${formatCurrency(maintenance.initialEnvelope)} alloués pour l'année`} icon={Wallet} variant="info" />
                <StatCard title="Budget Consommé" value={maintenance.totalAllocatedToVehicles} exactValue={`${formatCurrency(maintenance.totalAllocatedToVehicles)} consommés par les véhicules`} icon={TrendingUp} variant="warning" />
                <StatCard title="Budget Restant" value={maintenance.currentPool} exactValue={`${formatCurrency(maintenance.currentPool)} disponibles dans le pool`} icon={ShieldCheck} variant="success" />
                <StatCard title="Bons d'essence" value={fuelVouchers.totalValue} exactValue={`${formatCurrency(fuelVouchers.totalValue)} en stock (${fuelVouchers.count} bons)`} icon={Ticket} variant="default" extraValue={`${fuelVouchers.count} bons`} />
                <StatCard title="Cartes Carburant" value={fuelCards.totalBalance} exactValue={`${formatCurrency(fuelCards.totalBalance)} total sur les cartes (${fuelCards.count} cartes)`} icon={CreditCard} variant="default" extraValue={`${fuelCards.count} cartes`} />
            </div>

            {/* SECTIONS ANALYTIQUES (INTELLIGENCE FLOTTE) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-fleet-blue" /> Intelligence Flotte : Analyse de Performance
                    </h2>
                    <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Analyse basée sur l'historique complet</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Consommateurs */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[35px] p-8 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
                                <TrendingUpIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-tight">Plus Gros Coûts</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dépenses Cumulées</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {analytics?.topExpenses.map((v, i) => (
                                <div key={v.id} onClick={() => handleOpenVehicleDetails(v)} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-black text-slate-100 dark:text-slate-800">0{i+1}</div>
                                        <div>
                                            <p className="font-black text-xs uppercase group-hover:text-fleet-blue transition-colors">{v.immatriculation}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{v.marque} {v.modele}</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-xs text-rose-600">{formatCurrency(v.totalExpenses)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Fragilité (Maintenance) */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[35px] p-8 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-tight">Plus Fragiles</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Budget Maintenance</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {analytics?.topMaintenance.map((v, i) => (
                                <div key={v.id} onClick={() => handleOpenVehicleDetails(v)} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-black text-slate-100 dark:text-slate-800">0{i+1}</div>
                                        <div>
                                            <p className="font-black text-xs uppercase group-hover:text-fleet-blue transition-colors">{v.immatriculation}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{v.marque} {v.modele}</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-xs text-amber-600">{formatCurrency(v.budgetConsomme)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Coût au KM */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[35px] p-8 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center border border-slate-100">
                                <Gauge className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-tight">Moins Rentables</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Coût au Kilomètre</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {analytics?.topCostPerKm.map((v, i) => (
                                <div key={v.id} onClick={() => handleOpenVehicleDetails(v)} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-black text-slate-100 dark:text-slate-800">0{i+1}</div>
                                        <div>
                                            <p className="font-black text-xs uppercase group-hover:text-fleet-blue transition-colors">{v.immatriculation}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{v.marque} {v.modele}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-black text-xs text-fleet-blue text-right">{v.costPerKm.toFixed(1)}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase text-right leading-none">CFA / KM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* POOL MAINTENANCE SECTION (DATATABLE) */}
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fleet-blue/5 rounded-full translate-x-32 -translate-y-32"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[25px] flex items-center justify-center border border-emerald-100">
                            <Car className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight leading-none mb-1.5">Pool Maintenance & Dépenses</h2>
                            <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Inventaire détaillé et suivi budgétaire par unité</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Rechercher un véhicule..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 h-11 bg-slate-50 border-transparent rounded-2xl font-bold text-xs focus:bg-white focus:border-fleet-blue transition-all"
                            />
                        </div>
                        <Button 
                            onClick={() => openSupplyModal('MAINTENANCE')}
                            className="h-10 px-8 bg-fleet-blue hover:bg-fleet-blue-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-fleet-blue/20 transition-transform active:scale-95 flex items-center gap-3 w-full sm:w-auto"
                        >
                            <Plus className="w-5 h-5" /> RECHARGER LE POOL
                        </Button>
                    </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-800">
                    <DataTable 
                        data={filteredVehicles} 
                        columns={vehicleColumns} 
                        keyExtractor={(v) => v.id}
                        onRowClick={handleOpenVehicleDetails}
                        emptyMessage="Aucun véhicule trouvé correspondant à votre recherche."
                    />
                </div>
            </div>

            {/* INVENTAIRE EXPRESS (CARTES & BONS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cartes Carburant */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[35px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-tight">Cartes Magnétiques</h3>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fuelCards.count} Actives</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fuelCards.cards.slice(0, 4).map((card: any) => (
                            <div key={card.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{card.fournisseur || 'Station'}</p>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{formatCurrency(card.solde)}</p>
                                    <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">N° {card.numero}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {fuelCards.count > 4 && (
                        <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">+ {fuelCards.count - 4} autres cartes dans l'onglet Carburant</p>
                    )}
                </div>

                {/* Bons d'Essence */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[35px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-tight">Réserve de Bons</h3>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatCurrency(fuelVouchers.totalValue)}</span>
                    </div>
                    <div className="space-y-3">
                        {fuelVouchers.denominations.map((denom: any) => (
                            <div key={denom.value} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="text-xs font-black px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">{formatCurrency(denom.value)}</div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valeur Unitaire</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{denom.count}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">En Stock</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <GlobalBudgetSupplyModal isOpen={isSupplyModalOpen} onClose={() => setIsSupplyModalOpen(false)} onSuccess={fetchData} type={supplyType} />
            <AnnualBudgetConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} onSuccess={fetchData} currentSettings={settings} />
            <HistoryDetailsModal log={selectedActivity} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
            <VehicleBudgetDetailModal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} vehicle={selectedVehicle} />
            <Toaster position="top-right" richColors />
        </div>
    );
}
