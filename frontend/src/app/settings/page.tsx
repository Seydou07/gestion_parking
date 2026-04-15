"use client";

import { useEffect, useState } from "react";
import {
    Settings,
    Bell,
    Shield,
    Moon,
    Sun,
    Database,
    Save,
    Wallet,
    AlertTriangle,
    Clock,
    CheckCircle2,
    RefreshCw,
    ShieldCheck,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await api.settings.get();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast.error("Impossible de charger les paramètres");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.settings.update(settings);
            toast.success("Paramètres système mis à jour !");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !settings) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-fleet-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold dark:text-slate-400">Initialisation de la configuration...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-fleet-blue/10 rounded-lg">
                            <Settings className="w-6 h-6 text-fleet-blue" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Paramètres</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-11">Configuration globale et préférences du système</p>
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 bg-fleet-blue text-white rounded-2xl font-black flex items-center gap-3 hover:bg-fleet-blue-dark transition-all shadow-xl shadow-fleet-blue/20 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Synchronisation..." : "Enregistrer"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Theme & Appearance */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium transition-all hover:shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                            <Palette className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">Apparence</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group" onClick={toggleTheme}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
                                    {theme === 'dark' ? <Moon className="w-6 h-6 text-indigo-400" /> : <Sun className="w-6 h-6 text-amber-500" />}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-sm">Mode Sombre</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">Interface {theme === 'dark' ? 'Obscure' : 'Claire'}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "w-14 h-8 rounded-full p-1 transition-colors duration-300 relative",
                                theme === 'dark' ? "bg-fleet-blue" : "bg-slate-200 dark:bg-slate-700"
                            )}>
                                <div className={cn(
                                    "w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                    theme === 'dark' ? "translate-x-6" : "translate-x-0"
                                )}></div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                            <div className="flex gap-3">
                                <ShieldCheck className="w-4 h-4 text-fleet-blue mt-0.5" />
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Le mode sombre réduit la fatigue visuelle et économise l'énergie sur les écrans OLED.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Budgets */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium transition-all hover:shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">Budgets Globaux</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget Maintenance Annuel</label>
                                <div className="text-right">
                                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                        {(settings.budgetGlobalVehicules || 0).toLocaleString()} <span className="text-[10px]">{settings.devise}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="range" min="0" max="50000000" step="500000"
                                    value={settings.budgetGlobalVehicules || 0}
                                    onChange={(e) => setSettings({...settings, budgetGlobalVehicules: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-fleet-blue group-hover:h-3 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget Carburant Annuel</label>
                                <div className="text-right">
                                    <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                                        {(settings.budgetGlobalCarburant || 0).toLocaleString()} <span className="text-[10px]">{settings.devise}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="range" min="0" max="100000000" step="1000000"
                                    value={settings.budgetGlobalCarburant || 0}
                                    onChange={(e) => setSettings({...settings, budgetGlobalCarburant: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-fleet-blue group-hover:h-3 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts & Thresholds */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">Alertes & Seuils de Maintenance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervalle de Vidange (KM)</label>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black text-fleet-blue">{settings.seuilVidangeKm} KM</span>
                            </div>
                            <input 
                                type="range" min="1000" max="15000" step="500"
                                value={settings.seuilVidangeKm || 5000}
                                onChange={(e) => setSettings({...settings, seuilVidangeKm: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-fleet-blue"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerte Stock Carburant (%)</label>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black text-fleet-blue">{settings.alerteStockCarburant}%</span>
                            </div>
                            <input 
                                type="range" min="5" max="50" step="5"
                                value={settings.alerteStockCarburant || 10}
                                onChange={(e) => setSettings({...settings, alerteStockCarburant: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-fleet-blue"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anticipation Assurance (Jours)</label>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black text-fleet-blue">{settings.relanceAssuranceJours} Jours</span>
                            </div>
                            <input 
                                type="range" min="5" max="60"
                                value={settings.relanceAssuranceJours || 15}
                                onChange={(e) => setSettings({...settings, relanceAssuranceJours: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-fleet-blue"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anticipation Visite Tech (Jours)</label>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black text-fleet-blue">{settings.relanceVisiteJours} Jours</span>
                            </div>
                            <input 
                                type="range" min="5" max="60"
                                value={settings.relanceVisiteJours || 15}
                                onChange={(e) => setSettings({...settings, relanceVisiteJours: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-fleet-blue"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Toaster position="top-right" richColors />

            <Toaster position="top-right" richColors />
        </div>
    );
}
