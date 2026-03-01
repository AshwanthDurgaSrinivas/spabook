import api from '../lib/api';

export interface LeaveRequest {
    id: number;
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: number;
    comment?: string;
    createdAt: string;
    employee?: {
        firstName: string;
        lastName: string;
        role: string;
    };
}

export const leaveService = {
    applyLeave: async (data: { startDate: string; endDate: string; reason: string }) => {
        const response = await api.post<LeaveRequest>('/leaves/apply', data);
        return response.data;
    },

    getMyLeaves: async () => {
        const response = await api.get<LeaveRequest[]>('/leaves/my-leaves');
        return response.data;
    },

    getAllLeaves: async () => {
        const response = await api.get<LeaveRequest[]>('/leaves/all');
        return response.data;
    },

    updateLeaveStatus: async (id: number, status: 'approved' | 'rejected', comment?: string) => {
        const response = await api.put<LeaveRequest>(`/leaves/${id}/status`, { status, comment });
        return response.data;
    }
};
