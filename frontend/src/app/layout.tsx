import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FleetGuardian - Gestion de Flotte Automobile",
    description: "Application professionnelle de gestion de flotte intelligente",
    icons: {
        icon: '/logo.png',
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="h-full light">
            <body className={`${inter.className} h-full bg-white`}>
                <AppLayout>
                    {children}
                </AppLayout>
            </body>
        </html>
    );
}
