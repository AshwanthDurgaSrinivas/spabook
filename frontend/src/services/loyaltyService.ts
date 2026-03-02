import api from '../lib/api';

export interface LoyaltyTier {
    id: number;
    name: string;
    minSpent: number;
    minPoints?: number; // Added for compatibility
    pointsMultiplier: number;
    discountPercentage?: number; // Added for compatibility
    discountPercent?: number; // Added for compatibility
    benefits: any; // JSONB
    color: string;
    earnRatio: number;
    redeemValue: number;
    minBillForRedemption: number;
    description?: string;
}

export interface CustomerLoyalty {
    customerId: number;
    tierId: number;
    tier: LoyaltyTier;
    currentPoints: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalSpent: number;
    customer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface PointsTransaction {
    id: number;
    customerId: number;
    points: number;
    type: 'earned' | 'redeemed' | 'adjusted';
    reason: string;
    createdAt: string;
    customer?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export const loyaltyService = {
    // Tiers
    getTiers: async () => {
        const response = await api.get<LoyaltyTier[]>('/loyalty/tiers');
        return response.data;
    },

    getAllLoyalties: async () => {
        const response = await api.get<CustomerLoyalty[]>('/loyalty/all');
        return response.data;
    },

    createTier: async (data: any) => {
        const response = await api.post<LoyaltyTier>('/loyalty/tiers', data);
        return response.data;
    },

    updateTier: async (id: number, data: any) => {
        const response = await api.put<LoyaltyTier>(`/loyalty/tiers/${id}`, data);
        return response.data;
    },

    deleteTier: async (id: number) => {
        const response = await api.delete(`/loyalty/tiers/${id}`);
        return response.data;
    },

    // Customer Loyalty
    getMyLoyalty: async () => {
        const response = await api.get<CustomerLoyalty>('/loyalty/me');
        return response.data;
    },

    getCustomerLoyalty: async (customerId: number) => {
        const response = await api.get<CustomerLoyalty>(`/loyalty/${customerId}`);
        return response.data;
    },

    adjustPoints: async (customerId: number, points: number, reason: string) => {
        const response = await api.post<CustomerLoyalty>(`/loyalty/${customerId}/adjust`, { points, reason });
        return response.data;
    },

    getTransactions: async () => {
        const response = await api.get<PointsTransaction[]>('/loyalty/transactions');
        return response.data;
    }
};
