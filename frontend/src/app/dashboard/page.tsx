"use client";

import {
    Car,
    Users,
    MapPin,
    AlertTriangle,
    TrendingUp,
    Fuel,
    ArrowUpRight
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AlertsTable from "@/components/dashboard/AlertsTable";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { useVehicles, useDrivers, useMaintenances, useAlerts, useMissions, useStats } from "@/hooks/useFleetStore";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function DashboardPage() {
    const { vehicles, loading: loadingVehicles } = useVehicles();
    const { drivers, loading: loadingDrivers } = useDrivers();
    const { maintenances, loading: loadingMaint } = useMaintenances();
    const { alerts, loading: loadingAlerts } = useAlerts();
    const { missions, loading: loadingMissions } = useMissions();
    const { dashboardStats, monthlyExpenses, loading: loadingStats } = useStats();

    const stats = useMemo(() => {
        if (!dashboardStats) return {
            totalVehicules: vehicles.length,
            disponibles: vehicles.filter(v => v.statut === 'DISPONIBLE').length,
            missionsEnCours: vehicles.filter(v => v.statut === 'EN_MISSION').length,
            enPanne: vehicles.filter(v => v.statut === 'HORS_SERVICE').length,
            chauffeursActifs: drivers.filter(d => d.statut === 'EN_MISSION').length,
            totalDepenses: maintenances.reduce((acc, m) => acc + m.cout, 0),
            alertesCritiques: alerts.filter(a => !a.lue).length
        };

        return {
            totalVehicules: dashboardStats.vehicles.total,
            disponibles: dashboardStats.vehicles.available,
            missionsEnCours: dashboardStats.vehicles.inMission,
            enPanne: dashboardStats.vehicles.inMaintenance,
            chauffeursActifs: dashboardStats.drivers.total,
            totalDepenses: dashboardStats.expenses.total30d,
            alertesCritiques: dashboardStats.alertesCritiques || alerts.filter(a => !a.lue).length
        };
    }, [vehicles, drivers, maintenances, alerts, dashboardStats]);

    const fuelData = useMemo(() => {
        return monthlyExpenses.map(item => ({
            month: item.month,
            amount: item.total
        }));
    }, [monthlyExpenses]);

    const missionsData = useMemo(() => {
        return [
            { name: 'En mission', value: stats.missionsEnCours, color: '#0077B6' },
            { name: 'Disponible', value: stats.disponibles, color: '#00B4D8' },
            { name: 'Maintenance', value: vehicles.filter(v => v.statut === 'EN_MAINTENANCE').length, color: '#F43F5E' },
        ];
    }, [stats, vehicles]);

    if (loadingVehicles || loadingDrivers || loadingMaint || loadingAlerts || loadingMissions || loadingStats) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-fleet-blue" />
            </div>
        );
    }
    return (
        <div className="space-y-8 pb-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Dépenses Mensuelles"
                    value={stats.totalDepenses}
                    exactValue={formatCurrency(stats.totalDepenses)}
                    icon={ArrowUpRight}
                    trend={{ value: 5, isPositive: false }}
                    variant="default"
                />
                <StatCard
                    title="Total Véhicules"
                    value={stats.totalVehicules}
                    exactValue={stats.totalVehicules}
                    icon={Car}
                    subtitle={`${stats.disponibles} disponibles`}
                    variant="info"
                    isCurrency={false}
                />
                <StatCard
                    title="Missions en cours"
                    value={stats.missionsEnCours}
                    exactValue={stats.missionsEnCours}
                    icon={MapPin}
                    trend={{ value: 12, isPositive: true }}
                    variant="success"
                    isCurrency={false}
                />
                <StatCard
                    title="Alertes Critiques"
                    value={stats.alertesCritiques}
                    exactValue={stats.alertesCritiques}
                    icon={AlertTriangle}
                    variant="danger"
                    subtitle="Actions requises"
                    isCurrency={false}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="xl:col-span-2 card-premium">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-lg">Consommation Carburant</h3>
                            <p className="text-xs text-slate-400 font-medium">Évolution mensuelle des dépenses (CFA)</p>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Fuel className="w-5 h-5 text-fleet-blue" />
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fuelData}>
                                <defs>
                                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0077B6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0077B6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [formatCurrency(value), 'Dépense']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#0077B6" strokeWidth={3} fillOpacity={1} fill="url(#colorFuel)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Pie */}
                <div className="card-premium flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-lg mb-6 self-start">État du Parc</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={missionsData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {missionsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 w-full flex justify-around">
                        <div>
                            <p className="text-2xl font-bold text-slate-800">18</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Prêts</p>
                        </div>
                        <div className="border-l border-slate-100 pl-4">
                            <p className="text-2xl font-bold text-slate-800">6</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Indisponibles</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AlertsTable alerts={alerts} />

                <div className="card-premium">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Missions Actives</h3>
                        <Users className="w-5 h-5 text-fleet-blue" />
                    </div>
                    <div className="space-y-4">
                        {missions.filter((m: any) => m.statut === 'EN_COURS').length === 0 ? (
                            <p className="text-sm text-slate-400 italic text-center py-4">Aucune mission active</p>
                        ) : (
                            missions.filter((m: any) => m.statut === 'EN_COURS').slice(0, 5).map((m: any) => (
                                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-fleet-blue/20 flex items-center justify-center text-fleet-blue font-bold text-xs">
                                            {m.destination[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold truncate max-w-[150px] uppercase">{m.destination}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {m.chauffeur?.nom} • {m.vehicule?.immatriculation}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-fleet-blue/10 text-fleet-blue uppercase">En cours</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
