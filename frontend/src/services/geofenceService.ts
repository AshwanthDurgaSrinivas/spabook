import api from '../lib/api';
import type { Employee } from './employeeService';

export interface GeofenceLocation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    isActive: boolean;
}

export const geofenceService = {
    getLocations: async () => {
        const response = await api.get<GeofenceLocation[]>('/geofence/locations');
        return response.data;
    },

    createLocation: async (data: Omit<GeofenceLocation, 'id'>) => {
        const response = await api.post<GeofenceLocation>('/geofence/locations', data);
        return response.data;
    },

    updateLocation: async (id: number, data: Partial<GeofenceLocation>) => {
        const response = await api.put<GeofenceLocation>(`/geofence/locations/${id}`, data);
        return response.data;
    },

    deleteLocation: async (id: number) => {
        const response = await api.delete(`/geofence/locations/${id}`);
        return response.data;
    },

    getExceptions: async () => {
        const response = await api.get<Employee[]>('/geofence/exceptions');
        return response.data;
    },

    updateException: async (employeeId: number, geofenceBypass: boolean) => {
        const response = await api.put(`/geofence/exceptions/${employeeId}`, { geofenceBypass });
        return response.data;
    }
};
