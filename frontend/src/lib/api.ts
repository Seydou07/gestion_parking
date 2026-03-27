const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

export const api = {
    vehicles: {
        getAll: () => request('/vehicles'),
        getOne: (id: number) => request(`/vehicles/${id}`),
        create: (data: any) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id: number) => request(`/vehicles/${id}`, { method: 'DELETE' }),
    },
    drivers: {
        getAll: () => request('/drivers'),
        getOne: (id: number) => request(`/drivers/${id}`),
        create: (data: any) => request('/drivers', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id: number) => request(`/drivers/${id}`, { method: 'DELETE' }),
    },
    fuel: {
        getCards: () => request('/fuel/cards'),
        rechargeCard: (id: number, amount: number) => request(`/fuel/cards/${id}/recharge`, { 
            method: 'PATCH', 
            body: JSON.stringify({ amount }) 
        }),
        createCard: (data: any) => request('/fuel/cards', { method: 'POST', body: JSON.stringify(data) }),
        updateCard: (id: number, data: any) => request(`/fuel/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        getVouchers: () => request('/fuel/vouchers'),
        createVoucher: (data: any) => request('/fuel/vouchers', { method: 'POST', body: JSON.stringify(data) }),
        getRecords: () => request('/fuel/records'),
        getVehicleConsumption: (vehicleId: number) => request(`/fuel/stats/vehicle/${vehicleId}`),
    },
    maintenance: {
        getAll: () => request('/maintenance'),
        getOne: (id: number) => request(`/maintenance/${id}`),
        create: (data: any) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/maintenance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id: number) => request(`/maintenance/${id}`, { method: 'DELETE' }),
    },
    missions: {
        getAll: () => request('/missions'),
        getOne: (id: number) => request(`/missions/${id}`),
        create: (data: any) => request('/missions', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/missions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    alerts: {
        getAll: () => request('/alerts'),
        markRead: (id: number) => request(`/alerts/${id}/read`, { method: 'PATCH' }),
    },
    budgets: {
        getVehicleBudget: (vehicleId: number, year?: number) => 
            request<any>(`/budgets/vehicle/${vehicleId}${year ? `?year=${year}` : ''}`),
        allocate: (data: any) => request('/budgets/allocate', { method: 'POST', body: JSON.stringify(data) }),
        supplyGlobal: (data: any) => request('/budgets/global/supply', { method: 'POST', body: JSON.stringify(data) }),
        initializeGlobal: (data: any) => request('/budgets/global/initialize', { method: 'POST', body: JSON.stringify(data) }),
        getGlobalHistory: () => request('/budgets/global/history'),
    },
    stats: {
        getDashboard: () => request('/stats/dashboard'),
        getMonthlyExpenses: (year: number) => request(`/stats/monthly-expenses?year=${year}`),
        getVehicleAnalytics: (vehicleId: number, year?: number) => 
            request(`/stats/vehicle/${vehicleId}${year ? `?year=${year}` : ''}`),
    },
    history: {
        getAll: () => request('/history'),
    },
    settings: {
        get: () => request('/settings'),
        update: (data: any) => request('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    }
};
