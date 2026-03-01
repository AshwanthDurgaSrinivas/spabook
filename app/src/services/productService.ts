import api from '../lib/api';

export interface Product {
    id: number;
    name: string;
    description?: string;
    sku: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    isActive: boolean;
}

export const productService = {
    getProducts: async () => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    createProduct: async (data: any) => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    updateProduct: async (id: number, data: any) => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: number) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    }
};
