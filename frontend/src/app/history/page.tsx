"use client";

import { useEffect, useState } from "react";
import {
    History as HistoryIcon,
    Search,
    Filter,
    Download,
    Activity,
    Fuel,
    MapPin,
    Wrench,
    UserPlus,
    CreditCard,
    Settings
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

type HistoryLog = {
    id: number;
    action: string;
    module: string;
    description: string;
    createdAt: string;
    user?: { nom: string; prenom: string };
};

const CATEGORIES = [
    { id: 'ALL', label: 'Tout', icon: HistoryIcon },
    { id: 'VÉHICULE', label: 'Véhicules', icon: MapPin },
    { id: 'CHAUFFEUR', label: 'Chauffeurs', icon: UserPlus },
    { id: 'FINANCE', label: 'Finance', icon: CreditCard },
    { id: 'MAINTENANCE', label: 'Maintenance', icon: Wrench },
    { id: 'MISSION', label: 'Missions', icon: MapPin },
];

export default function HistoryPage() {
    const [logs, setLogs] = useState<HistoryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await api.history.getAll();
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const getModuleIcon = (module: string) => {
        switch (module.toUpperCase()) {
            case 'MISSION': return MapPin;
            case 'FINANCE': return CreditCard;
            case 'CARBURANT': return Fuel;
            case 'MAINTENANCE': return Wrench;
            case 'CHAUFFEUR': return UserPlus;
            case 'VÉHICULE': return Activity;
            case 'SETTINGS': return Settings;
            default: return Activity;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'ALL' || log.module === filter;
        const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) || 
                             log.action.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <HistoryIcon className="w-8 h-8 text-fleet-blue" />
                        Historique d'Activité
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Trace complète de toutes les actions effectuées</p>
                </div>
                
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={cn(
                            "px-6 py-3 rounded-2xl border-2 flex items-center gap-3 whitespace-nowrap transition-all text-xs font-black uppercase tracking-tight shadow-sm active:scale-95",
                            filter === cat.id
                                ? "bg-fleet-blue border-fleet-blue text-white shadow-xl shadow-fleet-blue/20"
                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-fleet-blue hover:border-fleet-blue/30 hover:bg-slate-50"
                        )}
                    >
                        <cat.icon className={cn("w-4 h-4", filter === cat.id ? "text-white" : "text-fleet-blue")} />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="card-premium">
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher dans les logs..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm outline-none focus:ring-2 focus:ring-fleet-blue/20" 
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-10 h-10 border-4 border-fleet-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-400 font-bold text-sm">Chargement de l'audit...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <HistoryIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold">Aucun log trouvé</p>
                    </div>
                ) : (
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-100 before:via-slate-200 before:to-transparent dark:before:from-slate-800 dark:before:via-slate-700">
                        {filteredLogs.map((log) => {
                            const Icon = getModuleIcon(log.module);
                            return (
                                <div key={log.id} className="relative flex items-center gap-10 group">
                                    <div className="absolute left-0 w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 flex items-center justify-center z-10 transition-colors group-hover:bg-fleet-blue group-hover:text-white shadow-sm">
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="ml-14 flex-1 p-5 rounded-2xl border border-slate-50 dark:border-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all bg-white dark:bg-slate-900 overflow-hidden relative group/card">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-lg bg-fleet-blue/10 text-fleet-blue text-[10px] font-black uppercase tracking-widest leading-none">
                                                    {log.module}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Activity className="w-3 h-3" />
                                                    {log.action}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{formatDate(log.createdAt)}</span>
                                        </div>
                                        
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{log.description}</p>

                                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                    {log.user ? `${log.user.prenom[0]}${log.user.nom[0]}` : "AD"}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    Exécuté par <span className="text-slate-900 dark:text-white">{log.user ? `${log.user.prenom} ${log.user.nom}` : "Administrateur"}</span>
                                                </span>
                                            </div>
                                            <button className="text-[10px] font-black text-fleet-blue opacity-0 group-hover/card:opacity-100 transition-opacity">DÉTAILS →</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
