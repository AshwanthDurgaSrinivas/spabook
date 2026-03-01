import api from '../lib/api';

export interface Employee {
    id: number;
    userId?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    department: string;
    designation: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        status: 'active' | 'inactive';
    };
    commissionRate: number;
    profileImage?: string;
    requiredHours?: number;
    status?: 'active' | 'inactive';
    role?: 'admin' | 'manager' | 'receptionist' | 'therapist' | 'employee' | 'super_admin';
    geofenceBypass?: boolean;
    geofenceId?: number | null;
}

export interface AttendanceRecord {
    id: number;
    employeeId: number;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    breakMinutes?: number;
    lastBreakStart?: string;
    status: 'present' | 'absent' | 'leave' | 'half_day' | 'late';
    notes?: string;
    employee?: {
        id: number;
        firstName?: string;
        lastName?: string;
        email?: string;
        designation?: string;
        user?: {
            firstName: string;
            lastName: string;
            email: string;
        };
    };
}

export const employeeService = {
    // Employees
    getEmployees: async () => {
        const response = await api.get<Employee[]>('/employees');
        return response.data;
    },

    getEmployeeById: async (id: number) => {
        const response = await api.get<Employee>(`/employees/${id}`);
        return response.data;
    },

    createEmployee: async (data: any) => {
        const response = await api.post<Employee>('/employees', data);
        return response.data;
    },

    updateEmployee: async (id: number, data: any) => {
        const response = await api.put<Employee>(`/employees/${id}`, data);
        return response.data;
    },

    deleteEmployee: async (id: number) => {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    },

    // Attendance
    checkIn: async (coords?: { latitude: number, longitude: number }) => {
        const response = await api.post<AttendanceRecord>('/attendance/check-in', coords);
        return response.data;
    },

    checkOut: async (coords?: { latitude: number, longitude: number }) => {
        const response = await api.post<AttendanceRecord>('/attendance/check-out', coords);
        return response.data;
    },

    getAttendance: async (date?: string) => {
        const response = await api.get<AttendanceRecord[]>('/attendance', { params: { date } });
        return response.data;
    },

    toggleBreak: async () => {
        const response = await api.post<AttendanceRecord>('/attendance/toggle-break');
        return response.data;
    },

    getTodayStatus: async () => {
        const response = await api.get<AttendanceRecord>('/attendance/today-status');
        return response.data;
    },

    getMyAttendance: async () => {
        const response = await api.get<{ records: AttendanceRecord[], stats: { present: number, absent: number, leaves: number, requiredHours: number } }>('/attendance/my-attendance');
        return response.data;
    },
    updateAttendanceStatus: async (id: number, status: string, notes?: string) => {
        const response = await api.put<AttendanceRecord>(`/attendance/${id}/status`, { status, notes });
        return response.data;
    }
};
