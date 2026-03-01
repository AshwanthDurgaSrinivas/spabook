
import api from '../lib/api';

export interface ContactRequest {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    createdAt: string;
    updatedAt: string;
}

export const contactService = {
    // Public: Submit contact form
    submitContact: async (data: any) => {
        const response = await api.post('/contacts', data);
        return response.data;
    },

    // Admin/Manager: Get all messages
    getMessages: async () => {
        const response = await api.get<ContactRequest[]>('/contacts');
        return response.data;
    },

    // Admin/Manager: Get single message
    getMessageById: async (id: number) => {
        const response = await api.get<ContactRequest>(`/contacts/${id}`);
        return response.data;
    },

    // Admin/Manager: Update status
    updateStatus: async (id: number, status: 'unread' | 'read' | 'replied') => {
        const response = await api.put<ContactRequest>(`/contacts/${id}/status`, { status });
        return response.data;
    },

    // Admin: Delete message
    deleteMessage: async (id: number) => {
        const response = await api.delete(`/contacts/${id}`);
        return response.data;
    }
};
