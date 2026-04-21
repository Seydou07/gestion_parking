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
        const storedToken = localStorage.getItem("fleet_token");
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, userData: DashboardUser) => {
        localStorage.setItem("fleet_token", token);
        localStorage.setItem("fleet_user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("fleet_token");
        localStorage.removeItem("fleet_user");
        document.cookie = "fleet_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        setUser(null);
    };

    const isRootAdmin = user?.role === "ROOT_ADMIN";
    const isAdmin = user?.role === "ADMIN" || isRootAdmin;
    const isGestionnaire = user?.role === "GESTIONNAIRE";
    const isUser = user?.role === "USER";

    return {
        user,
        loading,
        login,
        logout,
        isRootAdmin,
        isAdmin,
        isGestionnaire,
        isUser,
        canEdit: isAdmin || isGestionnaire,
        canViewBudget: isAdmin || isGestionnaire,
    };
}
