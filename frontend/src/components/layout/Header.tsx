"use client";

import { cn } from "@/lib/utils";
import { 
    Bell, 
    User, 
    Menu, 
    ChevronDown,
    LayoutDashboard,
    Car,
    Users,
    MapPin,
    Fuel,
    Wrench,
    History,
    BarChart3,
    UserCog,
    Settings as SettingsIcon,
    LogOut,
    Sun,
    Moon
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === "/dashboard") return { title: "Tableau de Bord", icon: LayoutDashboard };
        if (pathname?.startsWith("/vehicles")) return { title: "Gestion des Véhicules", icon: Car };
        if (pathname?.startsWith("/drivers")) return { title: "Gestion des Chauffeurs", icon: Users };
        if (pathname?.startsWith("/missions")) return { title: "Missions & Affectations", icon: MapPin };
        if (pathname?.startsWith("/fuel")) return { title: "Gestion du Carburant", icon: Fuel };
        if (pathname?.startsWith("/maintenance")) return { title: "Maintenance & Pannes", icon: Wrench };
        if (pathname?.startsWith("/history")) return { title: "Historique Global", icon: History };
        if (pathname === "/budget") return { title: "Budget & Statistiques", icon: BarChart3 };
        if (pathname?.startsWith("/users")) return { title: "Gestion des Utilisateurs", icon: UserCog };
        if (pathname?.startsWith("/settings")) return { title: "Paramètres Système", icon: SettingsIcon };
        return { title: "FleetGuardian", icon: Car };
    };

    const { title, icon: Icon } = getPageTitle();
    const [isDark, setIsDark] = useState(false);

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-2 sm:px-4 sticky top-0 z-40 transition-all duration-300">
            {/* Left side: Toggle */}
            <div className="flex items-center">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-xl text-slate-400 hover:text-fleet-blue hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group mr-1"
                    title="Menu"
                >
                    <Menu className="w-5 h-5 group-active:scale-95 transition-transform" />
                </button>

                <div className="flex items-center gap-2 animate-fade-in pr-4 border-r border-slate-100 dark:border-slate-800 mr-2 sm:mr-4">
                    <div className="w-8 h-8 rounded-lg bg-fleet-blue/5 flex items-center justify-center text-fleet-blue border border-fleet-blue/10">
                        <Icon className="w-4 h-4" />
                    </div>
                    <h1 className="text-sm sm:text-base font-black text-fleet-blue dark:text-fleet-blue-light tracking-tight uppercase">
                        {title}
                    </h1>
                </div>
            </div>

            {/* Right side: Actions & Profile */}
            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Actions & Theme - Grouped - No margin-right to stay close to profile */}
                <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
                    {/* Notifications */}
                    <button className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </button>

                    {/* Theme Toggle */}
                    <button 
                        onClick={() => setIsDark(!isDark)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all"
                        title={isDark ? "Mode Claire" : "Mode Sombre"}
                    >
                        {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Vertical Divider (Subtle gap) */}
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

                {/* User Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <div className="w-8 h-8 rounded-lg bg-fleet-blue/10 flex items-center justify-center text-fleet-blue border border-fleet-blue/20 shadow-sm">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="hidden md:flex flex-col items-start mr-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">Administrateur</span>
                            <span className="text-[10px] text-slate-400 font-medium">Gestionnaire Parc</span>
                        </div>
                        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                    </button>

                    {isUserMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mon Compte</p>
                                </div>
                                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                                    <User className="w-4 h-4 text-slate-400" /> Profil
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                                    <SettingsIcon className="w-4 h-4 text-slate-400" /> Paramètres
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-bold">
                                    <LogOut className="w-4 h-4" /> Déconnexion
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
