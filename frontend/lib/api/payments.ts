import { apiClient } from './client';

export interface Payment {
  id: number;
  customerId: number;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  invoiceNumber?: string;
  description?: string;
  createdAt: string;
}

export interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

export interface CreatePaymentData {
  customerId: number;
  amount: number;
  paymentMethod: string;
  description?: string;
}

export const paymentAPI = {
  // Get all payments with optional filters
  getAll: async (params?: {
    status?: string;
    customerId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<Payment[]>('/payments', { params });
    return response.data;
  },

  // Get payment by ID
  getById: async (id: number) => {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  // Get payment statistics
  getStats: async () => {
    const response = await apiClient.get<PaymentStats>('/payments/stats');
    return response.data;
  },

  // Create new payment
  create: async (data: CreatePaymentData) => {
    const response = await apiClient.post<Payment>('/payments', data);
    return response.data;
  },

  // Update payment status
  updateStatus: async (id: number, status: string) => {
    const response = await apiClient.patch<Payment>(`/payments/${id}/status`, { status });
    return response.data;
  },

  // Delete payment
  delete: async (id: number) => {
    const response = await apiClient.delete(`/payments/${id}`);
    return response.data;
  },

  // Get payments by customer
  getByCustomer: async (customerId: number) => {
    const response = await apiClient.get<Payment[]>(`/payments/customer/${customerId}`);
    return response.data;
  },

  // Generate invoice
  generateInvoice: async (paymentId: number) => {
    const response = await apiClient.post(`/payments/${paymentId}/invoice`);
    return response.data;
  },
};
