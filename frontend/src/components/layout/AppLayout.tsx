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
        document.documentElement.style.setProperty('--sidebar-width', '0px');
        return <main className="w-full h-full">{children}</main>;
    }

    // Sinon, on charge le layout complet de l'application FleetGuardian
    return (
        <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto w-full h-full animate-fade-in pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
