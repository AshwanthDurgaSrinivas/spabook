import api from '../lib/api';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'system' | 'booking' | 'payment' | 'reminder';
    isRead: boolean;
    userId: number | null;
    createdAt: string;
    updatedAt: string;
}

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get<Notification[]>('/notifications');
        return response.data;
    },

    createNotification: async (data: { title: string; message: string; type?: string; userId?: number }) => {
        const response = await api.post<Notification>('/notifications', data);
        return response.data;
    },

    markAsRead: async (id: number) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.post('/notifications/read-all');
        return response.data;
    }
};
