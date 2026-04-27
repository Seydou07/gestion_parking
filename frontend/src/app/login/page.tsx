"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    Eye,
    EyeOff,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const identifier = formData.get("identifier") as string;
        const password = formData.get("password") as string;

        try {
            const { api } = await import('@/lib/api');
            const response = await api.auth.login(identifier, password);

            // Stocker le token JWT et les données utilisateur
            localStorage.setItem("fleet_token", response.access_token);
            localStorage.setItem("fleet_user", JSON.stringify(response.user));

            // Définir le cookie pour le middleware (7 jours d'expiration)
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);
            document.cookie = `fleet_token=${response.access_token}; Path=/; Expires=${expires.toUTCString()}; SameSite=Strict; Secure`;

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || "Identifiants invalides. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
            {/* Left side: branding/image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-20">
                <div className="absolute inset-0 z-0 bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-fleet-blue/90 via-slate-900/80 to-black/90 z-10"></div>
                        <Image 
                            src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070&auto=format&fit=crop" 
                            alt="Parking Background" 
                            fill 
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="flex items-center gap-5 mb-12 animate-fade-in">
                        <div className="w-20 h-20 rounded-3xl bg-white p-4 shadow-2xl shadow-white/10 flex items-center justify-center border border-white/20">
                            <ShieldCheck className="w-12 h-12 text-fleet-blue" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter text-white drop-shadow-xl">FleetGuardian</h2>
                            <div className="flex items-center gap-2">
                                <span className="h-1 w-8 bg-fleet-blue-light rounded-full"></span>
                                <p className="text-sm font-bold text-fleet-blue-light uppercase tracking-widest">Premium Fleet Solutions</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 animate-slide-up">
                        <h1 className="text-6xl font-black leading-[1.05] drop-shadow-2xl">
                            Maîtrisez votre <span className="text-fleet-blue-light italic">Flotte</span> avec précision
                        </h1>
                        
                        <p className="text-xl text-white/80 font-medium leading-relaxed max-w-md">
                            Une interface intelligente conçue pour la performance, la sécurité et la transparence totale du FleetGuardian.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <div className="px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
                            <div className="w-10 h-10 rounded-xl bg-fleet-blue-light/20 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-fleet-blue-light" /></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-white/60 font-bold uppercase tracking-tighter">Sécurité</span>
                                <span className="text-sm font-bold">Protocoles Militaires</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
                            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center"><ArrowRight className="w-6 h-6 text-emerald-400" /></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-white/60 font-bold uppercase tracking-tighter">Performance</span>
                                <span className="text-sm font-bold">Temps Réel</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-slate-950">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-fleet-blue/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-fleet-blue/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="w-full max-w-md space-y-10 relative z-10">
                    <div className="text-center lg:hidden mb-12 flex flex-col items-center animate-fade-in">
                        <div className="w-20 h-20 rounded-3xl bg-fleet-blue flex items-center justify-center mb-6 shadow-2xl shadow-fleet-blue/30 scale-110">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Fleet<span className="text-fleet-blue">Guardian</span></h2>
                    </div>

                    <div className="space-y-4 animate-slide-up text-center">
                        <div className="inline-flex px-4 py-1.5 rounded-full bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50 dark:border-blue-900/20 mx-auto backdrop-blur-sm">
                            Accès Sécurisé
                        </div>
                        <h2 className="text-4xl font-black text-fleet-blue-light leading-tight tracking-tighter">Portail de Connexion</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Identifiez-vous pour accéder à la plateforme</p>
                    </div>

                    <div className="w-full max-w-md mx-auto animate-slide-up" style={{ animationDelay: '150ms' }}>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block">Nom d'utilisateur</label>
                                    <div className="relative group/field">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-slate-400 group-focus-within/field:text-fleet-blue-light transition-colors" />
                                        </div>
                                        <input
                                            name="identifier"
                                            type="text"
                                            placeholder="Ex: admin_fleet"
                                            required
                                            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl py-5 pl-14 pr-4 text-sm font-semibold outline-none focus:bg-slate-100 dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block">Mot de passe</label>
                                    <div className="relative group/field">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-slate-400 group-focus-within/field:text-fleet-blue-light transition-colors" />
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl py-5 pl-14 pr-12 text-sm font-semibold outline-none focus:bg-slate-100 dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 inset-y-0 flex items-center text-slate-400 hover:text-fleet-blue-light transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs font-bold animate-shake">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden bg-fleet-blue-light hover:bg-fleet-blue text-white font-black py-5 rounded-2xl shadow-xl shadow-fleet-blue-light/20 transition-all active:scale-[0.98] disabled:opacity-70 group/btn"
                            >
                                <div className="relative flex items-center justify-center gap-3 px-4">
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="tracking-widest capitalize">Se connecter</span>
                                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-8 opacity-50">
                        © 2026 FleetGuardian <span className="mx-2">•</span> Support Technique <span className="text-fleet-blue-light">Disponibilité Totale</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
