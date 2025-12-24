import api from './api';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface PlaceOrderRequest {
  items: OrderItem[];
  shippingAddress: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  notes?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface CustomerRegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const customerService = {
  async registerCustomer(data: CustomerRegisterRequest): Promise<void> {
    await api.post('/auth/register-customer', data);
  },

  async placeOrder(data: PlaceOrderRequest): Promise<CustomerOrder> {
    const response = await api.post('/customer/orders', data);
    return response.data;
  },

  async getMyOrders(): Promise<CustomerOrder[]> {
    const response = await api.get('/customer/orders');
    return response.data;
  },

  async getOrder(orderId: string): Promise<CustomerOrder> {
    const response = await api.get(`/customer/orders/${orderId}`);
    return response.data;
  }
};