"use client";

import { useState, useEffect } from "react";
import {
    UserCog,
    Plus,
    Shield,
    UserCheck,
    UserX,
    Key,
    ShieldAlert,
    Search,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { UserFormModal } from "@/components/users/UserFormModal";
import { ChangePasswordModal } from "@/components/users/ChangePasswordModal";
import { UserRole } from "@/types/api";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.users.getAll();
            setUsers(data);
        } catch (error) {
            toast.error("Impossible de charger les utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleActive = async (user: any) => {
        try {
            await api.users.toggleActive(user.id);
            toast.success(`Statut de ${user.prenom} mis à jour`);
            fetchUsers();
        } catch (error) {
            toast.error("Erreur lors de la modification du statut");
        }
    };

    const handleUpdateRole = async (user: any, newRole: UserRole) => {
        try {
            await api.users.updateRole(user.id, newRole);
            toast.success(`Rôle de ${user.prenom} mis à jour en ${newRole}`);
            fetchUsers();
        } catch (error) {
            toast.error("Erreur lors du changement de rôle");
        }
    };

    const openPasswordModal = (user: any) => {
        setSelectedUser(user);
        setIsPasswordOpen(true);
    };

    const filteredUsers = users.filter(user => 
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-fleet-blue" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card-premium">
                <div className="flex items-center gap-4 mb-8 justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un membre..." 
                            className="w-full pl-11 pr-4 h-11 rounded-2xl bg-slate-50 border-none text-sm outline-none focus:ring-2 focus:ring-fleet-blue/20 dark:bg-slate-900 shadow-inner" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsCreateOpen(true)}
                        className="btn-primary shrink-0 text-[10px] font-black uppercase tracking-widest px-6 h-11 rounded-2xl shadow-xl shadow-fleet-blue/20"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau Compte
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className={cn(
                            "p-6 rounded-[30px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden",
                            !user.actif && "opacity-75 grayscale-[0.5]"
                        )}>
                            {!user.actif && (
                                <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-bl-xl">
                                    Compte Désactivé
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-lg",
                                    user.actif ? "bg-fleet-blue/10 text-fleet-blue group-hover:bg-fleet-blue group-hover:text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    {user.nom[0]}{user.prenom[0]}
                                </div>
                                <select 
                                    className={cn(
                                        "text-[9px] font-black px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-fleet-blue/20 outline-none uppercase tracking-widest cursor-pointer",
                                        user.role === 'ADMIN' ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10" : "bg-blue-50 text-blue-500 dark:bg-blue-500/10"
                                    )}
                                    value={user.role}
                                    onChange={(e) => handleUpdateRole(user, e.target.value as UserRole)}
                                >
                                    <option value="ADMIN">Administrateur</option>
                                    <option value="GESTIONNAIRE">Gestionnaire</option>
                                    <option value="UTILISATEUR">Utilisateur</option>
                                </select>
                            </div>

                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight uppercase leading-none">{user.prenom} {user.nom}</h3>
                            <div className="mt-1 mb-8 space-y-0.5">
                                <p className="text-[10px] font-black text-fleet-blue uppercase tracking-widest">{user.username}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", user.actif ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", user.actif ? "text-emerald-600" : "text-slate-400")}>
                                        {user.actif ? "Connecté" : "Hors-ligne"}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openPasswordModal(user)}
                                        className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl text-slate-400 hover:text-amber-500 transition-all shadow-sm"
                                        title="Changer mot de passe"
                                    >
                                        <Key className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleToggleActive(user)}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-all shadow-sm",
                                            user.actif 
                                                ? "bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                                                : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                                        )}
                                        title={user.actif ? "Désactiver" : "Réactiver"}
                                    >
                                        {user.actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[30px] border border-amber-100 dark:border-amber-800/20 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-white dark:bg-amber-500/20 rounded-2xl shadow-sm">
                    <ShieldAlert className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-tight">Zone de Sécurité Critique</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1 font-bold leading-relaxed">
                        En tant qu'administrateur, vos actions impactent l'accès au système. La désactivation d'un compte bloque l'accès immédiat. Les changements de mot de passe sont effectifs instantanément.
                    </p>
                </div>
            </div>

            <UserFormModal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                onSuccess={fetchUsers} 
            />

            {selectedUser && (
                <ChangePasswordModal 
                    isOpen={isPasswordOpen} 
                    onClose={() => setIsPasswordOpen(false)} 
                    user={selectedUser} 
                />
            )}

            <Toaster position="top-right" richColors />
        </div>
    );
}
