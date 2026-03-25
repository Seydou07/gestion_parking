"use client";

import { useState, useEffect, useCallback } from 'react';
import { Maintenance, Vehicle, Alert, MaintenanceFormData, Driver, Mission, FuelCard, FuelVoucher } from '@/types/api';
import { mockVehicles, mockMissions, mockChauffeurs } from '@/data/mockData';


import { api } from '@/lib/api';

export function useVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.vehicles.getAll() as Vehicle[];
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateVehicle = async (id: number, data: Partial<Vehicle>) => {
        try {
            await api.vehicles.update(id, data);
            refresh();
        } catch (error) {
            console.error('Failed to update vehicle:', error);
        }
    };

    return { vehicles, updateVehicle, loading, refresh };
}

export function useMaintenances() {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState(true);
    const { refresh: refreshVehicles } = useVehicles();

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.maintenance.getAll() as Maintenance[];
            setMaintenances(data);
        } catch (error) {
            console.error('Failed to fetch maintenances:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addMaintenance = async (formData: MaintenanceFormData) => {
        try {
            await api.maintenance.create(formData);
            refresh();
            refreshVehicles();
        } catch (error) {
            console.error('Failed to add maintenance:', error);
        }
    };

    const updateMaintenance = async (id: number, data: Partial<Maintenance>) => {
        try {
            await api.maintenance.update(id, data);
            refresh();
        } catch (error) {
            console.error('Failed to update maintenance:', error);
        }
    };

    const deleteMaintenance = async (id: number) => {
        try {
            await api.maintenance.delete(id);
            refresh();
        } catch (error) {
            console.error('Failed to delete maintenance:', error);
        }
    };

    const marquerRetourGarage = async (maintenanceId: number) => {
        const maint = maintenances.find(m => m.id === maintenanceId);
        if (maint) {
            await updateMaintenance(maintenanceId, { statut: 'TERMINEE' });
            await api.vehicles.update(maint.vehiculeId, { statut: 'DISPONIBLE' });
            refresh();
            refreshVehicles();
        }
    };

    return { 
        maintenances, 
        loading,
        add: addMaintenance, 
        update: updateMaintenance, 
        remove: deleteMaintenance,
        marquerRetourGarage,
        refresh
    };
}

export function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.alerts.getAll() as Alert[];
            setAlerts(data);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const markRead = async (id: number) => {
        try {
            await api.alerts.markRead(id);
            refresh();
        } catch (error) {
            console.error('Failed to mark alert as read:', error);
        }
    };

    return { alerts, loading, markRead, refresh };
}

export function useBudgets() {
    const { vehicles } = useVehicles();

    const getBudgetVehicule = (vehicleId: number) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return null;
        return {
            montantAlloue: vehicle.budgetAlloue || 0,
            montantConsomme: vehicle.budgetConsomme || 0
        };
    };

    return { getBudgetVehicule };
}
export function useDrivers() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.drivers.getAll() as Driver[];
            setDrivers(data);
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateDriver = async (id: number, data: any) => {
        try {
            await api.drivers.update(id, data);
            refresh();
        } catch (error) {
            console.error('Failed to update driver:', error);
        }
    };

    return { drivers, loading, updateDriver, refresh };
}

export function useMissions() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.missions.getAll() as Mission[];
            setMissions(data);
        } catch (error) {
            console.error('Failed to fetch missions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { missions, loading, refresh };
}export function useFuelCards() {
    const [cards, setCards] = useState<FuelCard[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.fuel.getCards() as FuelCard[];
            setCards(data);
        } catch (error) {
            console.error('Failed to fetch fuel cards:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { cards, loading, refresh };
}

export function useFuelVouchers() {
    const [vouchers, setVouchers] = useState<FuelVoucher[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.fuel.getVouchers() as FuelVoucher[];
            setVouchers(data);
        } catch (error) {
            console.error('Failed to fetch fuel vouchers:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { vouchers, loading, refresh };
}

export function useStats() {
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const [dash, monthly] = await Promise.all([
                api.stats.getDashboard(),
                api.stats.getMonthlyExpenses(new Date().getFullYear())
            ]);
            setDashboardStats(dash);
            setMonthlyExpenses(monthly as any[]);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { dashboardStats, monthlyExpenses, loading, refresh };
}
export function useSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.settings.get();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { settings, loading, refresh };
}
