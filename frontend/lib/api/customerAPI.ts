import { apiClient } from './client';

export interface Customer {
  id: number;
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  address: any;
  identityNumber: string;
  status: 'active' | 'suspended' | 'inactive' | 'pending';
  serviceType?: 'pppoe' | 'hotspot' | 'static';
  username?: string;
  planName?: string;
  bandwidth?: string;
  ipAddress?: string;
  deviceInfo?: any;
  macAddress?: string;
  lastDeviceType?: string;
  connectionStatus?: 'online' | 'offline' | 'unknown';
  lastOnline?: string;
  monthlyFee?: number;
  billingDay?: number;
  installationDate?: string;
  registrationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  online: number;
  offline: number;
  suspended: number;
  byServiceType: {
    pppoe: number;
    hotspot: number;
  };
}

export interface CustomerDetailResponse {
  success: boolean;
  data: Customer & {
    realTimeData?: {
      connectionType: 'pppoe' | 'hotspot';
      ipAddress: string;
      macAddress: string;
      uptime: string;
      rxBytes: string;
      txBytes: string;
      mikrotikDevice: {
        id: number;
        name: string;
        ipAddress: string;
      };
    };
  };
}

export const customerAPI = {
  // Get all customers
  getCustomers: async (params?: {
    status?: string;
    connectionStatus?: string;
    serviceType?: string;
    search?: string;
  }) => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  // Get customer statistics
  getStats: async () => {
    const response = await apiClient.get('/customers/stats');
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (id: string): Promise<CustomerDetailResponse> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  // Create new customer
  createCustomer: async (data: Partial<Customer>) => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: number, data: Partial<Customer>) => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: number) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },

  // Update customer status
  updateCustomerStatus: async (id: number, status: string) => {
    const response = await apiClient.put(`/customers/${id}/status`, { status });
    return response.data;
  },

  // Sync customer connection status from MikroTik
  syncCustomers: async (deviceId?: number) => {
    const url = deviceId ? `/customers/sync/${deviceId}` : '/customers/sync';
    const response = await apiClient.post(url);
    return response.data;
  },
};

export default customerAPI;
