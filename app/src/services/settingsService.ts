
import api from '../lib/api';

export interface Setting {
    id: number;
    key: string;
    value: string;
    description: string;
    isEncrypted: boolean;
}

export const settingsService = {
    getSettings: async () => {
        const response = await api.get<Setting[]>('/settings');
        return response.data;
    },

    updateSetting: async (key: string, value: string) => {
        const response = await api.post('/settings', { key, value });
        return response.data;
    },

    getPublicSettings: async () => {
        const response = await api.get<Record<string, string>>('/settings/public');
        return response.data;
    },

    testSMTP: async (data: any) => {
        const response = await api.post('/settings/test-smtp', data);
        return response.data;
    }
};
