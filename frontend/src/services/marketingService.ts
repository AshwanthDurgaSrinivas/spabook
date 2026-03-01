import api from '../lib/api';
import type { MarketingCampaign, EmailTemplate, MarketingAutomation } from '@/types';

export interface Coupon {
    id: number;
    code: string;
    description: string;
    value: number;
    minPurchaseAmount: number;
    discountType: 'percentage' | 'fixed_amount';
    startDate: string;
    endDate: string;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    membershipId?: number | null;
    isMembersOnly?: boolean;
}

export const marketingService = {
    // Coupons
    getCoupons: async () => {
        const response = await api.get<Coupon[]>('/marketing/coupons');
        return response.data;
    },

    createCoupon: async (data: any) => {
        const response = await api.post<Coupon>('/marketing/coupons', data);
        return response.data;
    },

    updateCoupon: async (id: number, data: any) => {
        const response = await api.put<Coupon>(`/marketing/coupons/${id}`, data);
        return response.data;
    },

    deleteCoupon: async (id: number) => {
        const response = await api.delete(`/marketing/coupons/${id}`);
        return response.data;
    },

    validateCoupon: async (code: string, cartTotal: number) => {
        const response = await api.post('/marketing/coupons/validate', { code, cartTotal });
        return response.data;
    },

    // Campaigns
    getCampaigns: async () => {
        const response = await api.get<MarketingCampaign[]>('/marketing/campaigns');
        return response.data;
    },

    createCampaign: async (data: Partial<MarketingCampaign>) => {
        const response = await api.post<MarketingCampaign>('/marketing/campaigns', data);
        return response.data;
    },

    deleteCampaign: async (id: string) => {
        const response = await api.delete(`/marketing/campaigns/${id}`);
        return response.data;
    },

    // Templates
    getTemplates: async () => {
        const response = await api.get<EmailTemplate[]>('/marketing/templates');
        return response.data;
    },

    createTemplate: async (data: Partial<EmailTemplate>) => {
        const response = await api.post<EmailTemplate>('/marketing/templates', data);
        return response.data;
    },

    // Automations
    getAutomations: async () => {
        const response = await api.get<MarketingAutomation[]>('/marketing/automations');
        return response.data;
    },

    createAutomation: async (data: Partial<MarketingAutomation>) => {
        const response = await api.post<MarketingAutomation>('/marketing/automations', data);
        return response.data;
    }
};
