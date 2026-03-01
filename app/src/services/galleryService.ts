import api from '../lib/api';

export interface GalleryItem {
    id: number;
    title: string;
    imageUrl: string;
    category: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export const galleryService = {
    getGalleryItems: async (category?: string, activeOnly: boolean = true) => {
        const response = await api.get<GalleryItem[]>('/gallery', {
            params: { category, activeOnly }
        });
        return response.data;
    },

    createGalleryItem: async (data: Partial<GalleryItem>) => {
        const response = await api.post<GalleryItem>('/gallery', data);
        return response.data;
    },

    updateGalleryItem: async (id: number, data: Partial<GalleryItem>) => {
        const response = await api.put<GalleryItem>(`/gallery/${id}`, data);
        return response.data;
    },

    deleteGalleryItem: async (id: number) => {
        await api.delete(`/gallery/${id}`);
    }
};
