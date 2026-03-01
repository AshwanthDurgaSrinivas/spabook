import api from '../lib/api';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'manager' | 'receptionist' | 'employee' | 'customer';
}

export interface LoginResponse {
    token: string;
    user: User;
}

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            // Optionally store user info
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (data: any) => {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};
