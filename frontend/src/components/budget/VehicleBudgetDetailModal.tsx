"use client";

import { useEffect, useState } from "react";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { 
    Wrench, 
    Fuel, 
    TrendingUp, 
    Calendar,
    Car,
    AlertCircle,
    Activity,
    Landmark,
    MapPin,
    Hash,
    BarChart3
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface VehicleBudgetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: any;
}

const MONTHS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function VehicleBudgetDetailModal({ isOpen, onClose, vehicle }: VehicleBudgetDetailModalProps) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'MAINTENANCE' | 'FUEL' | 'MONTHLY'>('MAINTENANCE');

    useEffect(() => {
        if (isOpen && vehicle) {
            fetchDetails();
        }
    }, [isOpen, vehicle]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await api.budgets.getVehicleBudget(vehicle.id);
            setDetails(data);
        } catch (error) {
            console.error("Failed to fetch vehicle budget details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!vehicle) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-none rounded-[20px] shadow-2xl bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                {/* Unified Premium Header */}
                <div className="shrink-0 px-6 py-5 bg-fleet-blue text-white flex items-center gap-4 sticky top-0 z-50">
                    <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                        <Car className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <DialogTitle className="text-xl font-black tracking-tight leading-none">
                            {vehicle.immatriculation}
                        </DialogTitle>
                        <DialogDescription className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                            {vehicle.marque} {vehicle.modele} • Analyse de Consommation Annuelle
                        </DialogDescription>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black uppercase text-white/50 tracking-widest mb-0.5">Kilométrage Actuel</p>
                        <p className="text-lg font-black tracking-tighter">{(vehicle.kilometrage || 0).toLocaleString()} km</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <div className="relative w-12 h-12">
                                <Loader2 className="w-12 h-12 animate-spin text-fleet-blue" />
                                <Activity className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-fleet-blue/40" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronisation des flux financiers...</p>
                        </div>
                    ) : details ? (
                        <>
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard 
                                    label="Dépenses Annuelles"
                                    value={formatCurrency(details.totalSpent)}
                                    subValue={`${(details.allocations?.length || 0)} transactions`}
                                    icon={Activity}
                                    color="blue"
                                />
                                <MetricCard 
                                    label="Coût d'Exploitation"
                                    value={vehicle.costPerKm ? `${vehicle.costPerKm.toFixed(1)} CFA/km` : '0 CFA/km'}
                                    subValue="Rentabilité réelle"
                                    icon={TrendingUp}
                                    color="orange"
                                />
                                <MetricCard 
                                    label="Maintenance"
                                    value={formatCurrency(details.totalSpentMaint)}
                                    subValue={`${(details.maintenances?.length || 0)} interventions`}
                                    icon={Wrench}
                                    color="emerald"
                                />
                                <MetricCard 
                                    label="Carburant"
                                    value={formatCurrency(details.totalSpentFuel)}
                                    subValue={`${(details.fuelRecords?.length || 0)} pleins`}
                                    icon={Fuel}
                                    color="amber"
                                />
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-max">
                                {[
                                    { id: 'MAINTENANCE', label: 'Interventions', icon: Wrench },
                                    { id: 'FUEL', label: 'Carburant', icon: Fuel },
                                    { id: 'MONTHLY', label: 'Flux Mensuel', icon: BarChart3 }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                            activeTab === tab.id 
                                                ? "bg-white dark:bg-slate-800 text-fleet-blue dark:text-white shadow-md border border-slate-100 dark:border-slate-700" 
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Lists */}
                            <div className="space-y-4">
                                {activeTab === 'MAINTENANCE' && (
                                    <div className="space-y-3">
                                        {details?.maintenances?.length > 0 ? (
                                            details.maintenances.map((m: any) => (
                                                <div key={m.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500/30 transition-all group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                                                            <Wrench className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded tracking-widest">
                                                                    {m.type || 'INTERVENTION'}
                                                                </span>
                                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">#{m.id}</span>
                                                            </div>
                                                            <p className="text-sm font-black text-slate-800 dark:text-white mb-1">{m.description}</p>
                                                            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                                                                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {formatDate(m.dateDebut)}</span>
                                                                <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {m.garage || 'Zone Inconnue'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(m.montant)}</p>
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Régularisé</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <EmptyState icon={Wrench} text="Aucun dossier de maintenance" />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'FUEL' && (
                                    <div className="space-y-3">
                                        {details?.fuelRecords?.length > 0 ? (
                                            details.fuelRecords.map((fr: any) => (
                                                <div key={fr.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-amber-500/30 transition-all group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-colors">
                                                            <Fuel className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded tracking-widest">
                                                                    {fr.type || 'CARBURANT'}
                                                                </span>
                                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">ID {fr.id}</span>
                                                            </div>
                                                            <p className="text-sm font-black text-slate-800 dark:text-white mb-1">Ravitaillement Effectué</p>
                                                            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                                                                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {formatDate(fr.date)}</span>
                                                                <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> {fr.litres} Litres</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-amber-600 tracking-tighter">{formatCurrency(fr.montant)}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant Débité</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <EmptyState icon={Fuel} text="Aucune consommation enregistrée" />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'MONTHLY' && (
                                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-fleet-blue/10 rounded-2xl flex items-center justify-center">
                                                <BarChart3 className="w-6 h-6 text-fleet-blue" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl tracking-tight uppercase">Flux Mensuel {new Date().getFullYear()}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Décomposition mois par mois des coûts d'exploitation</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {details?.monthlyData?.map((data: any) => (
                                                <div key={data.month} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-fleet-blue/20 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-xs text-slate-400 group-hover:text-fleet-blue transition-colors">
                                                            {MONTHS[data.month].substring(0, 3)}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-black text-sm text-slate-800 dark:text-white leading-none mb-1">{MONTHS[data.month]}</p>
                                                            <div className="flex gap-3 text-[9px] font-black uppercase tracking-tight">
                                                                <span className="text-emerald-500">Maint: {data.maintenance.toLocaleString()} CFA</span>
                                                                <span className="text-amber-500">Carb: {data.fuel.toLocaleString()} CFA</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(data.total)}</p>
                                                        <div className="w-24 h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full mt-2 overflow-hidden flex">
                                                            {data.total > 0 && (
                                                                <>
                                                                    <div 
                                                                        className="h-full bg-emerald-500" 
                                                                        style={{ width: `${(data.maintenance / (data.total || 1)) * 100}%` }}
                                                                    ></div>
                                                                    <div 
                                                                        className="h-full bg-amber-500" 
                                                                        style={{ width: `${(data.fuel / (data.total || 1)) * 100}%` }}
                                                                    ></div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="py-24 text-center">
                            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-slate-200" />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Données de flux introuvables</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MetricCard({ label, value, subValue, icon: Icon, color }: any) {
    const colors: any = {
        blue: "text-blue-500 bg-blue-50/50 border-blue-100 hover:border-blue-300",
        emerald: "text-emerald-500 bg-emerald-50/50 border-emerald-100 hover:border-emerald-300",
        amber: "text-amber-500 bg-amber-50/50 border-amber-100 hover:border-amber-300",
        orange: "text-orange-500 bg-orange-50/50 border-orange-100 hover:border-orange-300"
    };

    return (
        <div className={cn("p-6 rounded-[25px] border flex flex-col gap-4 transition-all hover:shadow-lg hover:-translate-y-1", colors[color])}>
            <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-50">
                    <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-3 h-3 opacity-20" />
            </div>
            <div>
                <p className="text-[8px] font-black uppercase tracking-[0.15em] opacity-60 mb-1.5">{label}</p>
                <p className="text-xl font-black tracking-tighter leading-none mb-1.5 text-slate-900 dark:text-white">{value}</p>
                <p className="text-[10px] font-bold text-slate-400">{subValue}</p>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, text }: any) {
    return (
        <div className="py-20 flex flex-col items-center justify-center opacity-30 bg-slate-50/50 dark:bg-slate-900/50 rounded-[50px] border border-dashed border-slate-200 dark:border-slate-800">
            <Icon className="w-14 h-14 mb-4 text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest">{text}</p>
        </div>
    );
}
