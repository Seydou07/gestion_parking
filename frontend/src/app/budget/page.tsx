"use client";

import { useEffect, useState } from "react";
import { 
    Wallet, 
    ArrowUpCircle, 
    Database, 
    PieChart, 
    TrendingUp, 
    AlertCircle,
    Plus,
    History,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Search,
    Filter,
    ShieldCheck,
    Settings,
    ArrowRightLeft,
    TrendingDown,
    Activity,
    Landmark
} from "lucide-react";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { GlobalBudgetActivity } from "@/types/api";
import { cn } from "@/lib/utils";
import GlobalBudgetSupplyModal from "@/components/budget/GlobalBudgetSupplyModal";
import AnnualBudgetConfigModal from "@/components/budget/AnnualBudgetConfigModal";

export default function BudgetPage() {
    const [settings, setSettings] = useState<any>(null);
    const [history, setHistory] = useState<GlobalBudgetActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    
    // Modal states
    const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [supplyType, setSupplyType] = useState<'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON'>('MAINTENANCE');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsData, historyData] = await Promise.all([
                api.settings.get(),
                api.budgets.getGlobalHistory(),
            ]);
            setSettings(settingsData);
            setHistory(historyData as GlobalBudgetActivity[]);

            // Stats is optional (may require auth) — load it separately
            try {
                const dashboardData = await api.stats.getDashboard();
                setStats(dashboardData);
            } catch (statsError) {
                console.warn("Stats could not be loaded (auth required):", statsError);
            }
        } catch (error) {
            console.error("Failed to fetch budget data:", error);
            toast.error("Impossible de charger les données budgétaires");
        } finally {
            setLoading(false);
        }
    };

    const openSupplyModal = (type: 'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON') => {
        setSupplyType(type);
        setIsSupplyModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'XOF', 
            maximumFractionDigits: 0 
        }).format(amount).replace('XOF', 'FCFA');
    };

    if (loading || !settings) return (
        <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-fleet-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 font-bold tracking-tight uppercase text-xs">Analyse financière en cours...</p>
        </div>
    );

    const totalFuelBudget = settings.budgetGlobalCarburant + settings.budgetGlobalCartes + settings.budgetGlobalBons;
    const totalMaintenanceBudget = settings.budgetGlobalVehicules;
    
    // Nouveaux calculs pour la traçabilité
    const totalMaintenanceEnveloppe = history
        .filter(a => a.field === 'MAINTENANCE' && (a.type === 'INITIAL_DEFINITION' || a.type === 'REPLENISHMENT'))
        .reduce((acc, a) => acc + a.amount, 0);
    
    const totalMaintenanceAlloue = history
        .filter(a => a.field === 'MAINTENANCE' && a.type === 'ALLOCATION_VEHICULE')
        .reduce((acc, a) => acc + a.amount, 0);

    const grandTotal = totalFuelBudget + totalMaintenanceBudget + totalMaintenanceAlloue;

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Professional Hero Section */}
            <div className="relative overflow-hidden bg-gradient-ccva rounded-[30px] p-8 md:p-10 text-white shadow-xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white">
                            Gestion Budgétaire
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                                Trésorerie <span className="text-white/80">Globale</span>
                            </h1>
                            <p className="text-white/70 font-medium text-sm max-w-md">
                                Suivi des budgets annuels et allocations en temps réel.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 pt-2">
                            <button 
                                onClick={() => setIsConfigModalOpen(true)}
                                className="px-6 py-3 bg-white text-fleet-blue rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Configurer l'Année
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-6 space-y-4 relative overflow-hidden">
                            <div>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Capacité Totale
                                </p>
                                <h3 className="text-3xl font-black tracking-tighter tabular-nums">{formatCurrency(grandTotal)}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                                <div>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Enveloppe Annuelle</p>
                                    <p className="text-lg font-black text-white tracking-tight">{formatCurrency(totalMaintenanceEnveloppe)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Dispo en Caisse</p>
                                    <p className="text-lg font-black text-white tracking-tight">{formatCurrency(totalMaintenanceBudget)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Allocation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        title: "Maintenance & Pièces", 
                        amount: settings.budgetGlobalVehicules, 
                        type: 'MAINTENANCE', 
                        color: 'emerald', 
                        icon: Database,
                        desc: "Entretien général, réparations et pièces détachées"
                    },
                    { 
                        title: "Cartes Carburant", 
                        amount: settings.budgetGlobalCartes, 
                        type: 'FUEL_CARD', 
                        color: 'blue', 
                        icon: PieChart,
                        desc: "Dotations globales pour les cartes Total/Ola/Vv"
                    },
                    { 
                        title: "Bons d'Essence", 
                        amount: settings.budgetGlobalBons, 
                        type: 'FUEL_BON', 
                        color: 'amber', 
                        icon: TrendingUp,
                        desc: "Enveloppe pour les bons de carburant papier"
                    }
                ].map((card) => (
                    <div key={card.type} className="group relative bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className={`w-10 h-10 bg-${card.color}-500/10 rounded-xl flex items-center justify-center border border-${card.color}-500/20`}>
                                    <card.icon className={`w-5 h-5 text-${card.color}-500`} />
                                </div>
                                <button 
                                    onClick={() => openSupplyModal(card.type as any)}
                                    className="p-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-fleet-blue transition-all active:scale-90"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">{card.title}</p>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(card.amount)}</h3>
                                <p className="text-slate-500 text-[11px] mt-1 leading-tight">{card.desc}</p>
                            </div>

                            <button 
                                onClick={() => openSupplyModal(card.type as any)}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border group/btn",
                                    card.color === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white" :
                                    card.color === 'blue' ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-fleet-blue hover:text-white" :
                                    "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-500 hover:text-white"
                                )}
                            >
                                <ArrowUpCircle className="w-3.5 h-3.5" />
                                Approvisionner
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Compact Traceability History */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[30px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                <History className="w-5 h-5 text-fleet-blue" />
                                Flux & Traçabilité
                            </h2>
                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Audit financier en temps réel</p>
                        </div>
                        
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-white hover:text-fleet-blue border border-slate-100 dark:border-slate-700 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm">
                                <Search className="w-3.5 h-3.5" />
                                Recherche
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {history.length > 0 ? (
                            history.map((activity) => (
                                <div key={activity.id} className="group p-4 rounded-[20px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-fleet-blue/5 hover:border-fleet-blue/20 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300",
                                            activity.field === 'MAINTENANCE' ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                                            activity.field === 'FUEL_CARD' ? "bg-blue-50 border-blue-100 text-blue-500" :
                                            "bg-amber-50 border-amber-100 text-amber-500"
                                        )}>
                                            {activity.type === 'INITIAL_DEFINITION' ? <Landmark className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                                                    {activity.field === 'MAINTENANCE' ? "Entretien Flotte" : 
                                                     activity.field === 'FUEL_CARD' ? "Cartes Carburant" : "Bons d'Essence"}
                                                </h4>
                                                <span className={cn(
                                                    "font-bold text-sm tabular-nums",
                                                    activity.type === 'ALLOCATION_VEHICULE' ? "text-amber-600" :
                                                    activity.type === 'INITIAL_DEFINITION' ? "text-slate-900 dark:text-white" : "text-emerald-600"
                                                )}>
                                                    {activity.type === 'ALLOCATION_VEHICULE' ? '-' : activity.type === 'INITIAL_DEFINITION' ? '' : '+'}{formatCurrency(activity.amount)}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-[11px] line-clamp-1">{activity.description}</p>
                                            
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <Clock className="w-3 h-3 text-fleet-blue" />
                                                    {new Date(activity.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </div>
                                                <div className="px-2 py-0.5 rounded-lg bg-slate-100 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {activity.type}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-slate-50/50 rounded-[30px] border-2 border-dashed border-slate-200">
                                <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Aucun flux financier détecté</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Column */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[30px] text-white overflow-hidden relative shadow-lg group/status h-fit">
                         <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-black text-lg tracking-tight uppercase">Santé Budget</h3>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                    <Activity className="w-5 h-5 text-fleet-blue-light" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end px-1 text-[10px]">
                                        <p className="font-bold text-slate-400 uppercase tracking-widest">Maintenance</p>
                                        <span className="font-bold text-emerald-400 uppercase tracking-widest">OK</span>
                                    </div>
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end px-1 text-[10px]">
                                        <p className="font-bold text-slate-400 uppercase tracking-widest">Carburant</p>
                                        <span className="font-bold text-fleet-blue-light uppercase tracking-widest">Actif</span>
                                    </div>
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5">
                                        <div className="h-full bg-fleet-blue rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>
                         </div>
                         <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fleet-blue/10 rounded-full blur-[60px]"></div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 space-y-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Sécurité Actalisée</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                            Les allocations sont protégées par des règles de validation strictes.
                        </p>
                    </div>
                </div>
            </div>

            <GlobalBudgetSupplyModal 
                isOpen={isSupplyModalOpen}
                onClose={() => setIsSupplyModalOpen(false)}
                onSuccess={fetchData}
                type={supplyType}
            />

            <AnnualBudgetConfigModal 
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                onSuccess={fetchData}
                currentSettings={settings}
            />

            <Toaster position="top-right" richColors />
        </div>
    );
}
