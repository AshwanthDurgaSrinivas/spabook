import api from '../lib/api';

export interface Room {
    id: number;
    name: string;
    type: string;
    capacity: number;
    status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
    isVip: boolean;
    hourlyRate: number;
    serviceCategoryId?: number | null;
    roomNumber?: number | null;
    serviceCategory?: { id: number; name: string };
}

export const roomService = {
    getRooms: async () => {
        const response = await api.get<Room[]>('/rooms');
        return response.data;
    },

    createRoom: async (data: any) => {
        const response = await api.post<Room>('/rooms', data);
        return response.data;
    },

    updateRoom: async (id: number, data: any) => {
        const response = await api.put<Room>(`/rooms/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: number, status: string) => {
        const response = await api.put<Room>(`/rooms/${id}`, { status });
        return response.data;
    }
};
