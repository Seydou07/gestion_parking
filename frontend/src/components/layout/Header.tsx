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
    Moon,
    AlertTriangle,
    Info,
    Check
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { useAlerts } from "@/hooks/useFleetStore";
import { useRef, useEffect } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const { alerts, markRead } = useAlerts();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    <div className="relative" ref={notificationsRef}>
                        <button 
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className={cn(
                                "p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all relative",
                                isNotificationsOpen && "bg-white dark:bg-slate-700 text-fleet-blue"
                            )}
                        >
                            <Bell className="w-5 h-5" />
                            {alerts.filter(a => !a.lue).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-4 h-4 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                                    {alerts.filter(a => !a.lue).length}
                                </span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        Notifications ({alerts.filter(a => !a.lue).length})
                                    </span>
                                    {alerts.filter(a => !a.lue).length > 0 && (
                                        <button 
                                            onClick={async () => {
                                                const unread = alerts.filter(a => !a.lue);
                                                // Trigger optimistic updates and API requests in parallel
                                                Promise.all(unread.map(a => markRead(a.id)));
                                            }}
                                            className="text-[10px] font-black text-fleet-blue dark:text-fleet-blue-light uppercase tracking-wider hover:underline"
                                        >
                                            Tout marquer lu
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto no-scrollbar py-1">
                                    {alerts.filter(a => !a.lue).length === 0 ? (
                                        <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mb-2">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Aucune nouvelle alerte</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Votre flotte est sous contrôle !</p>
                                        </div>
                                    ) : (
                                        alerts.filter(a => !a.lue).slice(0, 5).map((a) => {
                                            const isCritical = a.severity === 'CRITICAL';
                                            const isWarning = a.severity === 'WARNING';
                                            return (
                                                <div 
                                                    key={a.id} 
                                                    onClick={() => markRead(a.id)}
                                                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/30 last:border-b-0 cursor-pointer transition-colors flex items-start gap-3 group text-left"
                                                >
                                                    <div className={cn(
                                                        "p-2 rounded-lg shrink-0 mt-0.5",
                                                        isCritical ? "bg-red-50 text-red-500 dark:bg-red-900/10" :
                                                        isWarning ? "bg-amber-50 text-amber-500 dark:bg-amber-900/10" :
                                                        "bg-blue-50 text-blue-500 dark:bg-blue-900/10"
                                                    )}>
                                                        {isCritical ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-fleet-blue transition-colors">
                                                            {a.message}
                                                        </p>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                                                            {new Date(a.dateCreation).toLocaleDateString('fr-FR', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markRead(a.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all text-slate-400 hover:text-slate-600 self-center"
                                                        title="Marquer comme lu"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all"
                        title={theme === 'dark' ? "Mode Claire" : "Mode Sombre"}
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Vertical Divider (Subtle gap) */}
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <div className="w-8 h-8 rounded-lg bg-fleet-blue/10 flex items-center justify-center text-fleet-blue border border-fleet-blue/20 shadow-sm">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="hidden md:flex flex-col items-start mr-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">
                                {user ? `${user.prenom} ${user.nom}` : "Administrateur"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium capitalize">
                                {user?.role.toLowerCase() || "Gestionnaire Parc"}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mon Compte</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    window.location.href = "/settings";
                                }}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200"
                            >
                                <User className="w-4 h-4 text-slate-400" /> Profil
                            </button>
                            <button 
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    window.location.href = "/settings";
                                }}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200"
                            >
                                <SettingsIcon className="w-4 h-4 text-slate-400" /> Paramètres
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                            <button 
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    setLogoutModalOpen(true);
                                }}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-bold"
                            >
                                <LogOut className="w-4 h-4" /> Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                open={logoutModalOpen}
                onOpenChange={setLogoutModalOpen}
                onConfirm={() => {
                    logout();
                    window.location.href = "/login";
                }}
                title="Déconnexion"
                description="Êtes-vous sûr de vouloir vous déconnecter de votre session ?"
                confirmText="Se déconnecter"
                variant="danger"
            />
        </header>
    );
};

export default Header;
