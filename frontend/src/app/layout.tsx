import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FleetGuardian - Gestion de Flotte Automobile",
    description: "Application professionnelle de gestion de flotte intelligente",
    manifest: "/manifest.json",
    appleWebApp: {
        title: "Fleet Guardian",
        statusBarStyle: "default",
        capable: true,
    },
    icons: {
        icon: '/icons/icon-192x192.png',
        apple: '/icons/icon-512x512.png',
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="h-full" suppressHydrationWarning>
            <body className={`${inter.className} h-full`}>
                <ThemeProvider>
                    <AppLayout>
                        {children}
                    </AppLayout>
                </ThemeProvider>
            </body>
        </html>
    );
}
