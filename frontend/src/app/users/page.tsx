"use strict";

import {
    UserCog,
    Plus,
    Shield,
    UserCheck,
    UserX,
    Key,
    ShieldAlert,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const users = [
    { id: 1, name: "Administrateur", email: "admin@fleet.com", role: "ADMIN", status: "ACTIF" },
    { id: 2, name: "Amadou Sylla", email: "amadou.s@fleet.com", role: "GESTIONNAIRE", status: "ACTIF" },
    { id: 3, name: "Salif O.", email: "salif.o@fleet.com", role: "VUE_SEULE", status: "ACTIF" },
];

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="card-premium">
                <div className="flex items-center gap-4 mb-8 justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Rechercher un membre..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-none text-sm outline-none focus:ring-2 focus:ring-fleet-blue/20" />
                    </div>
                    <button className="btn-primary shrink-0 text-xs py-2">
                        <Plus className="w-4 h-4" />
                        Ajouter un utilisateur
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <div key={user.id} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-fleet-blue/10 flex items-center justify-center text-fleet-blue font-bold text-lg group-hover:bg-fleet-blue group-hover:text-white transition-colors">
                                    {user.name[0]}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black p-1 rounded uppercase tracking-widest",
                                    user.role === 'ADMIN' ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                                )}>{user.role}</span>
                            </div>

                            <h3 className="font-bold text-slate-800 dark:text-white">{user.name}</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1 mb-6">{user.email}</p>

                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Actif</span>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-fleet-blue transition-colors">
                                        <Key className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-rose-500 transition-colors">
                                        <UserX className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/20 flex items-start gap-4">
                <ShieldAlert className="w-5 h-5 text-amber-500 mt-1" />
                <div>
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500">Rappel de sécurité</h4>
                    <p className="text-xs text-amber-700/80 mt-1 font-medium">Seuls les administrateurs peuvent modifier les rôles et réinitialiser les mots de passe. Toute action est enregistrée dans l'historique global.</p>
                </div>
            </div>
        </div>
    );
}
