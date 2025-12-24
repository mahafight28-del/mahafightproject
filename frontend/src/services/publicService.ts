import api from './api';

export interface ProductImage {
  id: string;
  fileName: string;
  url: string;
  isDefault: boolean;
  displayOrder: number;
}

export interface PublicProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  brand?: string;
  imageUrl?: string;
  inStock: boolean;
  images: ProductImage[];
}

export const publicService = {
  async getProducts(): Promise<PublicProduct[]> {
    const response = await api.get('/public/products');
    return response.data;
  },

  async getProduct(id: string): Promise<PublicProduct> {
    const response = await api.get(`/public/products/${id}`);
    return response.data;
  }
};