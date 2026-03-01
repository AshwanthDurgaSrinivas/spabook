import api from '../lib/api';

export interface ServiceCategory {
    id: number;
    name: string;
    description?: string;
    image?: string;
    displayOrder: number;
}

export interface Service {
    id: number;
    name: string;
    description?: string;
    shortDescription?: string;
    durationMinutes: number;
    basePrice: number;
    capacity?: number; // max simultaneous bookings (1=exclusive, >1=group/class)
    categoryId?: number;
    category?: ServiceCategory;
    status?: 'active' | 'inactive' | 'draft';
    isActive?: boolean;
    imageUrls?: string[];
    isPackage?: boolean;
    isAddon?: boolean;
    popularityScore?: number;
}

export const serviceService = {
    getServices: async () => {
        const response = await api.get<Service[]>('/services');
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get<ServiceCategory[]>('/services/categories');
        return response.data;
    },

    getServiceById: async (id: number) => {
        const response = await api.get<Service>(`/services/${id}`);
        return response.data;
    },

    createService: async (data: any) => {
        const response = await api.post<Service>('/services', data);
        return response.data;
    },

    updateService: async (id: number, data: any) => {
        const response = await api.put<Service>(`/services/${id}`, data);
        return response.data;
    },

    createCategory: async (data: any) => {
        const response = await api.post<ServiceCategory>('/services/categories', data);
        return response.data;
    },

    deleteService: async (id: number) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    }
};
