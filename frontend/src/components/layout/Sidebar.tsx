"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Car,
    Users,
    MapPin,
    Fuel,
    Wrench,
    History,
    BarChart3,
    UserCog,
    Settings,
    Bell,
    LogOut,
    ShieldCheck,
    ChevronRight,
    Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const pathname = usePathname();
    const { isUtilisateur } = useAuth();

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Véhicules", icon: Car, href: "/vehicles" },
        { name: "Chauffeurs", icon: Users, href: "/drivers" },
        { name: "Missions", icon: MapPin, href: "/missions" },
        { name: "Carburant", icon: Fuel, href: "/fuel" },
        { name: "Maintenance", icon: Wrench, href: "/maintenance" },
        { name: "Historique", icon: History, href: "/history" },
        { name: "Budget & Stats", icon: BarChart3, href: "/budget" },
        { name: "Utilisateurs", icon: UserCog, href: "/users" },
        { name: "Paramètres", icon: Settings, href: "/settings" },
    ];

    const isAllowed = (name: string) => {
        if (!isUtilisateur) return true;
        return name === "Véhicules" || name === "Chauffeurs";
    };

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 lg:relative h-screen flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm z-50 transition-all duration-300 overflow-hidden",
            isOpen ? "w-72 translate-x-0" : "w-20 lg:w-20 -translate-x-full lg:translate-x-0"
        )}>
            {/* Brand Logo Header */}
            <div className={cn(
                "h-16 flex items-center border-b border-slate-200 dark:border-slate-800 flex-shrink-0 transition-all duration-300",
                isOpen ? "px-4 gap-2" : "justify-center"
            )}>
                <div className="w-9 h-9 rounded-xl bg-fleet-blue flex items-center justify-center flex-shrink-0 shadow-lg border border-white/20">
                    <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                {isOpen && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-lg font-black text-fleet-blue dark:text-fleet-blue-light tracking-tight leading-tight">FleetGuardian</span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Gestion de Flotte</span>
                    </div>
                )}
            </div>


            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto pt-4 space-y-1 scrollbar-hide no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    const allowed = isAllowed(item.name);
                    
                    return (
                        <Link
                            key={item.href}
                            href={allowed ? item.href : "#"}
                            onClick={(e) => !allowed && e.preventDefault()}
                            className={cn(
                                "relative flex items-center gap-3 w-full transition-all font-bold text-sm tracking-tight py-3",
                                isActive 
                                    ? "bg-fleet-blue/[0.04] dark:bg-fleet-blue/10 text-fleet-blue dark:text-fleet-blue-light border-r-4 border-fleet-blue" 
                                    : "text-slate-500/60 dark:text-slate-400/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-fleet-blue dark:hover:text-fleet-blue-light border-r-4 border-transparent",
                                !isOpen && "justify-center px-0",
                                !allowed && "opacity-30 cursor-not-allowed grayscale pointer-events-none"
                            )}
                            style={isOpen ? { paddingLeft: '1.5rem', paddingRight: '1rem' } : {}}
                            title={!isOpen ? item.name : undefined}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 flex-shrink-0 transition-transform",
                                isActive ? "text-fleet-blue dark:text-fleet-blue-light" : "text-slate-400 dark:text-slate-500 group-hover:text-fleet-blue dark:group-hover:text-fleet-blue-light"
                            )} />

                            {isOpen && (
                                <>
                                    <span className="flex-1 truncate uppercase tracking-tight">
                                        {item.name}
                                    </span>
                                    
                                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}

                                    {item.name === "Maintenance" && (
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 ml-1"></span>
                                    )}
                                </>
                            )}
                            
                            {!isOpen && item.name === "Maintenance" && (
                                <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Footer LogOut */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <Link
                    href="/login"
                    className={cn(
                        "flex items-center gap-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-600 transition-all font-bold",
                        isOpen ? "px-4 py-3" : "justify-center p-3"
                    )}
                    title={!isOpen ? "Déconnexion" : undefined}
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" />
                    {isOpen && <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">Déconnexion</span>}
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
