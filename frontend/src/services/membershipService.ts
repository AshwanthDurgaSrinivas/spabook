import api from '../lib/api';

export interface MembershipPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    discountPercentage: number;
    benefits: any;
    isActive: boolean;
}

export interface CustomerMembership {
    id: number;
    customerId: number;
    planId: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
    autoRenew: boolean;
    plan?: MembershipPlan;
    customer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export const membershipService = {
    // Plans
    getPlans: async () => {
        const response = await api.get<MembershipPlan[]>('/memberships');
        return response.data;
    },

    createPlan: async (data: any) => {
        const response = await api.post<MembershipPlan>('/memberships', data);
        return response.data;
    },

    updatePlan: async (id: number, data: any) => {
        const response = await api.put<MembershipPlan>(`/memberships/${id}`, data);
        return response.data;
    },

    deletePlan: async (id: number) => {
        const response = await api.delete(`/memberships/${id}`);
        return response.data;
    },

    // Subscriptions
    assignMembership: async (customerId: number, planId: number, startDate?: string) => {
        const response = await api.post<CustomerMembership>('/memberships/assign', { customerId, planId, startDate });
        return response.data;
    },

    getAllSubscriptions: async () => {
        const response = await api.get<CustomerMembership[]>('/memberships/all/subscriptions');
        return response.data;
    },

    getMyMembership: async () => {
        const response = await api.get<CustomerMembership>('/memberships/my/subscription');
        return response.data;
    },

    subscribeToPlan: async (planId: number) => {
        const response = await api.post('/memberships/subscribe', { planId });
        return response.data;
    },

    createOrder: async (planId: number) => {
        const response = await api.post('/memberships/create-order', { planId });
        return response.data;
    },

    verifyPayment: async (data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        planId: number;
    }) => {
        const response = await api.post('/memberships/verify-payment', data);
        return response.data;
    },

    cancelSubscription: async () => {
        const response = await api.post('/memberships/cancel');
        return response.data;
    }
};
