"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    useEffect(() => {
        const width = isSidebarOpen ? '288px' : '80px';
        document.documentElement.style.setProperty('--sidebar-width', width);
    }, [isSidebarOpen]);

    // Si on est sur la page de connexion, on ne charge PAS la sidebar ni le conteneur du dashboard
    if (isLoginPage) {
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--sidebar-width', '0px');
        }
        return <main className="w-full h-full">{children}</main>;
    }

    // Sinon, on charge le layout complet de l'application FleetGuardian
    return (
        <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Overlay pour le sidebar en mode mobile/tablette */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <Sidebar isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
                <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto w-full h-full animate-fade-in pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
