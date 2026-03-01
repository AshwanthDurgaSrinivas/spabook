
import api from '../lib/api';

export interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
    isActive: boolean;
}

export interface SupportTicket {
    id: number;
    userId: number;
    subject: string;
    message: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    adminNote?: string;
    createdAt: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export const helpService = {
    getFAQs: async () => {
        const response = await api.get<FAQ[]>('/help/faqs');
        return response.data;
    },

    adminGetFAQs: async () => {
        const response = await api.get<FAQ[]>('/help/admin/faqs');
        return response.data;
    },

    createFAQ: async (data: Partial<FAQ>) => {
        const response = await api.post<FAQ>('/help/faqs', data);
        return response.data;
    },

    updateFAQ: async (id: number, data: Partial<FAQ>) => {
        const response = await api.put<FAQ>(`/help/faqs/${id}`, data);
        return response.data;
    },

    deleteFAQ: async (id: number) => {
        await api.delete(`/help/faqs/${id}`);
    },

    createTicket: async (data: { subject: string; message: string; priority?: string }) => {
        const response = await api.post<SupportTicket>('/help/tickets', data);
        return response.data;
    },

    getMyTickets: async () => {
        const response = await api.get<SupportTicket[]>('/help/tickets/my');
        return response.data;
    },

    adminGetAllTickets: async () => {
        const response = await api.get<SupportTicket[]>('/help/admin/tickets');
        return response.data;
    },

    adminUpdateTicket: async (id: number, data: Partial<SupportTicket>) => {
        const response = await api.put<SupportTicket>(`/help/tickets/${id}`, data);
        return response.data;
    }
};
