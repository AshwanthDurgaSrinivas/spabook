import api from '../lib/api';

export interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive';
    customerCode?: string;
    segment?: 'vip' | 'regular' | 'new' | 'dormant' | 'at-risk';
    lifetimeValue?: number;
    averageOrderValue?: number;
    totalVisits?: number;
    lastVisitDate?: string;
    avatar?: string;
    totalSpent?: number;
    skinType?: string;
    marketingEmails?: boolean;
    smsNotifications?: boolean;
    language?: string;
    darkMode?: boolean;
}

export const customerService = {
    getCustomers: async () => {
        const response = await api.get<Customer[]>('/customers');
        return response.data;
    },

    getCustomerById: async (id: number) => {
        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    },

    createCustomer: async (data: any) => {
        const response = await api.post<Customer>('/customers', data);
        return response.data;
    },

    updateCustomer: async (id: number, data: any) => {
        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    },

    deleteCustomer: async (id: number) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    }
};
