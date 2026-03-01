import api from '@/lib/api';
import type { DashboardStats, RevenueData, ServicePerformance, EmployeePerformance } from '@/types';

export const analyticsService = {
    getDashboardStats: async () => {
        const response = await api.get<{ stats: DashboardStats, revenueData: RevenueData[] }>('/analytics/dashboard');
        return response.data;
    },

    getServicePerformance: async () => {
        const response = await api.get<ServicePerformance[]>('/analytics/services');
        return response.data;
    },

    getEmployeePerformance: async () => {
        const response = await api.get<EmployeePerformance[]>('/analytics/employees');
        return response.data;
    }
};
