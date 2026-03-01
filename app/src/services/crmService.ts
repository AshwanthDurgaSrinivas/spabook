import api from '../lib/api';

export interface CRMAnalytics {
    metrics: {
        totalCustomers: number;
        activeCustomers: number;
        avgLTV: number;
        retentionRate: number;
    };
    segments: Array<{
        value: string;
        label: string;
        count: number;
    }>;
    rfm: Array<{
        name: string;
        count: number;
    }>;
    funnel: Array<{
        stage: string;
        count: number;
        percentage: number;
    }>;
    recentActivities: Array<{
        id: number;
        type: string;
        description: string;
        user: string;
        timestamp: string;
    }>;
    campaigns: {
        email: {
            sent: string | number;
            opened: string | number;
            clicked: string | number;
        };
        sms: {
            sent: string | number;
            delivered: string | number;
        };
        list: any[];
    };
}

export const crmService = {
    getAnalytics: async (): Promise<CRMAnalytics> => {
        const response = await api.get('/crm/analytics');
        return response.data;
    },
    sendCampaign: async (campaignId: number): Promise<{ message: string, count: number }> => {
        const response = await api.post(`/crm/campaigns/${campaignId}/send`);
        return response.data;
    },
    getCustomersBySegment: async (segmentValue: string): Promise<any[]> => {
        const response = await api.get(`/crm/segments/${segmentValue}/customers`);
        return response.data;
    },
    sendSegmentCampaign: async (segmentValue: string, subject: string, message: string): Promise<{ message: string, count: number }> => {
        const response = await api.post(`/crm/segments/${segmentValue}/campaign`, { subject, message });
        return response.data;
    }
};
