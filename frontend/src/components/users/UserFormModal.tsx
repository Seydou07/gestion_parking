"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/api";
import { toast } from "sonner";
import { Loader2, UserPlus, UserCircle2, Mail, Shield, Key } from "lucide-react";

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: any; // If provided, we are in edit mode for password or role
}

export function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        username: "",
        email: "",
        role: "GESTIONNAIRE" as UserRole,
        password: "",
    });
    const [isUsernameCustom, setIsUsernameCustom] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                nom: "",
                prenom: "",
                username: "",
                email: "",
                role: "GESTIONNAIRE",
                password: "",
            });
            setIsUsernameCustom(false);
        }
    }, [isOpen]);

    // Auto-generate username logic
    useEffect(() => {
        if (!isUsernameCustom && (formData.nom || formData.prenom)) {
            const p = formData.prenom.toLowerCase().trim();
            const n = formData.nom.toLowerCase().trim().replace(/\s+/g, '');
            if (p && n) {
                setFormData(prev => ({ ...prev, username: `${p}.${n}` }));
            } else if (p) {
                setFormData(prev => ({ ...prev, username: p }));
            } else if (n) {
                setFormData(prev => ({ ...prev, username: n }));
            }
        }
    }, [formData.nom, formData.prenom, isUsernameCustom]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { api } = await import("@/lib/api");
            await api.users.create(formData);
            toast.success("Utilisateur créé avec succès");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-slate-50 dark:bg-slate-900 rounded-[35px]">
                <div className="bg-fleet-blue p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16"></div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <UserPlus className="w-8 h-8" /> Nouveau Compte
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 font-medium">
                            Enregistrez un nouvel utilisateur pour accéder à la plateforme.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom</Label>
                            <div className="relative">
                                <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="nom"
                                    placeholder="Ex: Sylla"
                                    className="pl-12 h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prenom" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prénom</Label>
                            <Input
                                id="prenom"
                                placeholder="Ex: Amadou"
                                className="h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                value={formData.prenom}
                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom d'utilisateur</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Ex: amadou.s"
                                className="h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                value={formData.username}
                                onChange={(e) => {
                                    setIsUsernameCustom(true);
                                    setFormData({ ...formData, username: e.target.value });
                                }}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Professionnel</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="amadou.s@ccva.bf"
                                    className="pl-12 h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-xs"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Privilèges</Label>
                            <Select 
                                value={formData.role} 
                                onValueChange={(v: UserRole) => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger className="h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-fleet-blue" />
                                        <SelectValue placeholder="Rôle" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                                    <SelectItem value="GESTIONNAIRE">Gestionnaire</SelectItem>
                                    <SelectItem value="UTILISATEUR">Utilisateur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pass" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mot de passe</Label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="pass"
                                    type="password"
                                    placeholder="******"
                                    className="pl-12 h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="rounded-2xl h-12 px-10 bg-fleet-blue hover:bg-fleet-blue-dark font-black uppercase text-[10px] tracking-widest shadow-xl shadow-fleet-blue/20">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le compte"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
