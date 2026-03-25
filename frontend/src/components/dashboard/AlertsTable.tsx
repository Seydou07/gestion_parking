"use client";

import { AlertSeverity } from "@/types/api";
import { Bell, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
    id: number;
    message: string;
    severity: AlertSeverity;
    dateCreation: string;
    module: string;
}

const AlertsTable = ({ alerts }: { alerts: Alert[] }) => {
    const getSeverityStyles = (severity: AlertSeverity) => {
        switch (severity) {
            case 'CRITICAL': return { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50/50" };
            case 'WARNING': return { icon: Bell, color: "text-amber-500", bg: "bg-amber-50/50" };
            case 'INFO': return { icon: Info, color: "text-blue-500", bg: "bg-blue-50/50" };
            default: return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50/50" };
        }
    };

    return (
        <div className="card-premium h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-fleet-blue" />
                    Alertes récentes
                </h3>
                <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase">Aujourd'hui</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[400px]">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10 italic">
                        <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                        <p>Aucune alerte en cours</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const { icon: Icon, color, bg } = getSeverityStyles(alert.severity);
                        return (
                            <div key={alert.id} className={cn("p-4 rounded-xl border border-transparent transition-all hover:border-slate-100 dark:hover:border-slate-800 flex items-start gap-4", bg)}>
                                <div className={cn("p-2 rounded-lg", color.replace('text', 'bg').replace('500', '100'))}>
                                    <Icon className={cn("w-4 h-4", color)} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{alert.message}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">{alert.module}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-[10px] text-slate-400 italic">Il y a 2 heures</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button className="mt-4 text-center text-sm font-bold text-fleet-blue hover:text-fleet-blue-dark transition-colors py-2 border-t border-slate-50 dark:border-slate-800">
                Voir tout l'historique
            </button>
        </div>
    );
};

export default AlertsTable;
