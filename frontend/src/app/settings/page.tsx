"use client";

import { useEffect, useState } from "react";
import {
    Settings,
    Bell,
    Shield,
    Globe,
    Moon,
    Sun,
    Database,
    Smartphone,
    ChevronRight,
    Save,
    Building2,
    DollarSign,
    AlertTriangle,
    Clock,
    Landmark,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";

export default function SettingsPage() {
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
            toast.success("Paramètres enregistrés avec succès !");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !settings) return (
        <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-fleet-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 font-bold">Chargement des paramètres...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-fleet-blue" />
                        Configuration Système
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Gérez les préférences globales de votre flotte</p>
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                >
                    <Save className={cn("w-4 h-4", saving && "animate-spin")} />
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation Section */}
                <div className="lg:col-span-1 space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-xl bg-fleet-blue/10 text-fleet-blue font-bold flex items-center justify-between border border-fleet-blue/20">
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5" />
                            Configuration Générale
                        </div>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl text-slate-500 font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5" />
                            Notifications (Bientôt)
                        </div>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Enterprise Identity */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <h3 className="font-bold text-lg mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">Identité de l'Entreprise</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nom de l'Organisation</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={settings.nomEntreprise || ""}
                                        onChange={(e) => setSettings({...settings, nomEntreprise: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-fleet-blue/20" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Devise Principale</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={settings.devise || "FCFA"}
                                        onChange={(e) => setSettings({...settings, devise: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-fleet-blue/20" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thresholds & Maintenance */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <h3 className="font-bold text-lg mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">Seuils d'Alerte & Maintenance</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerte Stock Carburant (L)</label>
                                        <span className="text-xs font-black text-fleet-blue">{settings.alerteStockCarburant} L</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" max="200" step="10"
                                        value={settings.alerteStockCarburant || 50}
                                        onChange={(e) => setSettings({...settings, alerteStockCarburant: parseInt(e.target.value)})}
                                        className="w-full accent-fleet-blue cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervalle Vidange (KM)</label>
                                        <span className="text-xs font-black text-fleet-blue">{settings.seuilVidangeKm} KM</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1000" max="15000" step="500"
                                        value={settings.seuilVidangeKm || 5000}
                                        onChange={(e) => setSettings({...settings, seuilVidangeKm: parseInt(e.target.value)})}
                                        className="w-full accent-fleet-blue cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relance Assurance (Jours)</label>
                                        <span className="text-xs font-black text-fleet-blue">{settings.relanceAssuranceJours} Jours</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" max="60"
                                        value={settings.relanceAssuranceJours || 15}
                                        onChange={(e) => setSettings({...settings, relanceAssuranceJours: parseInt(e.target.value)})}
                                        className="w-full accent-fleet-blue cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relance Visite Tech. (Jours)</label>
                                        <span className="text-xs font-black text-fleet-blue">{settings.relanceVisiteJours} Jours</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" max="60"
                                        value={settings.relanceVisiteJours || 15}
                                        onChange={(e) => setSettings({...settings, relanceVisiteJours: parseInt(e.target.value)})}
                                        className="w-full accent-fleet-blue cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-800 dark:text-amber-400">Note sur les alertes</p>
                                <p className="text-[10px] text-amber-700/70 dark:text-amber-500/70 font-medium">Ces seuils déterminent quand les pastilles de couleur et les notifications de rappel apparaîtront sur votre tableau de bord.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
