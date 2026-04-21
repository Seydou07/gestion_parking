const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

function getAuthHeaders(): Record<string, string> {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('fleet_token');
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
    }
    return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log(`API Request: ${endpoint}`, options.body);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        let errorMessage = error.message || 'API request failed';
        
        // Handle NestJS Validation Errors (Array of objects or strings)
        if (Array.isArray(errorMessage)) {
            const firstError = errorMessage[0];
            if (typeof firstError === 'object' && firstError.constraints) {
                errorMessage = Object.values(firstError.constraints).join(', ');
            } else {
                errorMessage = errorMessage.join(', ');
            }
        } else if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
        }
        
        throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
}

export const api = {
    auth: {
        login: (identifier: string, password: string) =>
            request<{ access_token: string; user: { id: number; nom: string; prenom: string; email: string; role: string } }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ identifier, password }),
            }),
        getMe: () =>
            request<any>('/auth/me'),
    },
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
        updateVoucher: (id: number, data: any) => request(`/fuel/vouchers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
        getSummary: () => request<any>('/budgets/summary'),
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
    },
    users: {
        getAll: () => request<any[]>('/users'),
        create: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
        updateRole: (id: number, role: string) => request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
        updatePassword: (id: number, password: string) => request(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
        toggleActive: (id: number) => request(`/users/${id}/toggle-active`, { method: 'PATCH' }),
        delete: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),
    }
};
