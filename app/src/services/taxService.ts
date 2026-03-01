import api from '../lib/api';

export interface Tax {
    id: number;
    name: string;
    rate: number;
    isActive: boolean;
}

export const taxService = {
    getTaxes: async (): Promise<Tax[]> => {
        const response = await api.get('/taxes');
        return response.data;
    },
    getPublicTaxes: async (): Promise<Tax[]> => {
        const response = await api.get('/taxes/public');
        return response.data;
    },
    createTax: async (data: Partial<Tax>): Promise<Tax> => {
        const response = await api.post('/taxes', data);
        return response.data;
    },
    updateTax: async (id: number, data: Partial<Tax>): Promise<Tax> => {
        const response = await api.put(`/taxes/${id}`, data);
        return response.data;
    },
    deleteTax: async (id: number): Promise<void> => {
        await api.delete(`/taxes/${id}`);
    }
};
