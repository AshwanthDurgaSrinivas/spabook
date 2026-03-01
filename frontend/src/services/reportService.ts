import api from '@/lib/api';

export interface Report {
    id: number;
    name: string;
    type: string;
    parameters: any;
    format: string;
    status: 'pending' | 'completed' | 'failed';
    filePath?: string;
    createdBy?: number;
    lastRunAt?: string;
    scheduleFrequency: 'daily' | 'weekly' | 'monthly' | 'none';
    nextRunAt?: string;
    createdAt: string;
}

export const reportService = {
    getReports: async () => {
        const response = await api.get<Report[]>('/reports');
        return response.data;
    },

    createReport: async (reportData: Partial<Report>) => {
        const response = await api.post<Report>('/reports', reportData);
        return response.data;
    },

    deleteReport: async (id: number) => {
        const response = await api.delete(`/reports/${id}`);
        return response.data;
    }
};
