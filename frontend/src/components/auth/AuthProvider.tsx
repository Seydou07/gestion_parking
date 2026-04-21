"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/api';
import { api } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('fleet_token');

            if (storedToken) {
                try {
                    const userData = await api.auth.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to restore session", error);
                    localStorage.removeItem('fleet_token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('fleet_token', token);
        try {
            const userData = await api.auth.getMe();
            setUser(userData);
            router.push('/dashboard');
        } catch (error) {
            localStorage.removeItem('fleet_token');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('fleet_token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
