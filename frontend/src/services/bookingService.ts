import api from '../lib/api';

export interface Booking {
    id: number;
    customerId: number;
    employeeId: number;
    serviceId?: number;
    packageId?: number;
    roomId?: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'reschedule_requested' | 'cancellation_requested';
    paymentStatus?: 'pending' | 'paid' | 'partial';
    totalPrice: number; // Subtotal
    totalAmount: number; // Grand total
    taxes?: Array<{ name: string; rate: number; amount: number }>;
    bookingNumber?: string;
    createdAt?: string;
    totalDuration?: number;
    rescheduleDate?: string;
    rescheduleTime?: string;
    requestedCancelReason?: string;
    pointsEarned?: number;
    pointsRedeemed?: number;
    customer?: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
    therapist?: {
        firstName: string;
        lastName: string;
        user?: {
            firstName: string;
            lastName: string;
        }
    };
    service?: {
        name: string;
        description?: string;
        durationMinutes: number;
        basePrice: number;
    };
    package?: {
        name: string;
        description?: string;
        duration: string;
        price: number;
    };
}

export const bookingService = {
    getBookings: async () => {
        const response = await api.get<Booking[]>('/bookings');
        return response.data;
    },

    createBooking: async (data: any) => {
        const response = await api.post<Booking>('/bookings', data);
        return response.data;
    },

    getBookingById: async (id: number) => {
        const response = await api.get<Booking>(`/bookings/${id}`);
        return response.data;
    },

    updateStatus: async (id: number, status: string) => {
        const response = await api.patch(`/bookings/${id}/status`, { status });
        return response.data;
    },

    updateBooking: async (id: number, data: any) => {
        const response = await api.put(`/bookings/${id}`, data);
        return response.data;
    },

    resendConfirmation: async (id: number) => {
        const response = await api.post(`/bookings/${id}/resend-confirmation`);
        return response.data;
    },

    getAvailability: async (id: number, date: string, isPackage = false): Promise<{ capacity: number; slotCounts: Record<string, number>; blockedRooms?: number }> => {
        const params: any = { date };
        if (isPackage) params.packageId = id;
        else params.serviceId = id;
        const response = await api.get(`/bookings/availability`, { params });
        return response.data;
    },

    requestReschedule: async (id: number, requestedDate: string, requestedTime: string) => {
        const response = await api.post(`/bookings/${id}/request-reschedule`, { requestedDate, requestedTime });
        return response.data;
    },

    requestCancellation: async (id: number, reason?: string) => {
        const response = await api.post(`/bookings/${id}/request-cancellation`, { reason });
        return response.data;
    },

    handleReschedule: async (id: number, action: 'approve' | 'reject') => {
        const response = await api.post(`/bookings/${id}/handle-reschedule`, { action });
        return response.data;
    },

    handleCancellation: async (id: number, action: 'approve' | 'reject') => {
        const response = await api.post(`/bookings/${id}/handle-cancellation`, { action });
        return response.data;
    }
};
