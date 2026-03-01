
import api from '@/lib/api';

export interface SpaPackage {
    id: number;
    name: string;
    description: string;
    price: number | string;
    originalPrice?: number | string;
    duration: string;
    features: string[];
    serviceIds: number[];
    isPopular: boolean;
    isActive: boolean;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const packageService = {
    getPackages: async (includeInactive = false): Promise<SpaPackage[]> => {
        const response = await api.get(`/packages?includeInactive=${includeInactive}`);
        return response.data;
    },

    getPackageById: async (id: number): Promise<SpaPackage> => {
        const response = await api.get(`/packages/${id}`);
        return response.data;
    },

    createPackage: async (data: Partial<SpaPackage>): Promise<SpaPackage> => {
        const response = await api.post('/packages', data);
        return response.data;
    },

    updatePackage: async (id: number, data: Partial<SpaPackage>): Promise<SpaPackage> => {
        const response = await api.put(`/packages/${id}`, data);
        return response.data;
    },

    deletePackage: async (id: number): Promise<void> => {
        await api.delete(`/packages/${id}`);
    }
};
