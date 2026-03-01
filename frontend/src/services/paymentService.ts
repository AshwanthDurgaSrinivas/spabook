import api from '../lib/api';

export interface Payment {
    id: number;
    bookingId: number;
    amount: number;
    method: 'cash' | 'card' | 'online';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    paymentDate: string;
    booking?: {
        id: number;
        service: {
            name: string;
        }
    };
}

export const paymentService = {
    getPayments: async () => {
        const response = await api.get<Payment[]>('/payments');
        return response.data;
    },

    getPaymentById: async (id: number) => {
        const response = await api.get<Payment>(`/payments/${id}`);
        return response.data;
    },

    getMyPayments: async () => {
        const response = await api.get<Payment[]>('/payments/my');
        return response.data;
    },

    getMyPaymentStats: async () => {
        const response = await api.get<{
            totalSpent: number;
            pendingAmount: number;
            totalTransactions: number;
            lastTransaction: string | null;
        }>('/payments/my-stats');
        return response.data;
    }
};
