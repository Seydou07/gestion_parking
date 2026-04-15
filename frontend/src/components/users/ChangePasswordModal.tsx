"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Loader2, KeyRound, Lock, AlertCircle } from "lucide-react";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export function ChangePasswordModal({ isOpen, onClose, user }: ChangePasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            return toast.error("Les mots de passe ne correspondent pas");
        }
        if (password.length < 6) {
            return toast.error("Le mot de passe doit faire au moins 6 caractères");
        }

        setLoading(true);
        try {
            const { api } = await import("@/lib/api");
            await api.users.updatePassword(user.id, password);
            toast.success(`Mot de passe de ${user.prenom} mis à jour`);
            setPassword("");
            setConfirm("");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-slate-50 dark:bg-slate-900 rounded-[35px]">
                <div className="bg-amber-500 p-6 text-white relative">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <KeyRound className="w-6 h-6" /> Réinitialisation
                        </DialogTitle>
                        <DialogDescription className="text-amber-50">
                            Changer le code d'accès de {user?.prenom} {user?.nom}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                            L'utilisateur devra utiliser ce nouveau mot de passe lors de sa prochaine connexion. Assurez-vous de lui transmettre de manière sécurisée.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nouveau mot de passe</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="password"
                                className="pl-12 h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmer</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="password"
                                className="pl-12 h-12 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-2xl font-bold"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full rounded-2xl h-12 bg-amber-500 hover:bg-amber-600 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/20">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mettre à jour le mot de passe"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
