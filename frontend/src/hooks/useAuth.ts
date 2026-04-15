"use client";

import { useState, useEffect, useCallback } from "react";
import { UserRole } from "@/types/api";

export interface DashboardUser {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: UserRole;
}

export function useAuth() {
    const [user, setUser] = useState<DashboardUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("fleet_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: DashboardUser) => {
        localStorage.setItem("fleet_user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("fleet_user");
        setUser(null);
    };

    const isAdmin = user?.role === "ADMIN";
    const isGestionnaire = user?.role === "GESTIONNAIRE";
    const isUtilisateur = user?.role === "UTILISATEUR";

    return {
        user,
        loading,
        login,
        logout,
        isAdmin,
        isGestionnaire,
        isUtilisateur,
        canEdit: isAdmin || isGestionnaire,
        canViewBudget: isAdmin || isGestionnaire,
    };
}
