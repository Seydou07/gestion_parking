"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("fleet_theme") as Theme;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        
        const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
        setTheme(initialTheme);
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("fleet_theme", newTheme);
        if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newTheme === "dark");
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className={cn("h-full", !mounted && "invisible")}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
