import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (data: any) =>
    apiClient.post('/auth/register', data),
  
  getProfile: () =>
    apiClient.get('/auth/me'),
};

// Customer API
export const customerAPI = {
  getAll: (params?: any) =>
    apiClient.get('/customers', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/customers/${id}`),
  
  create: (data: any) =>
    apiClient.post('/customers', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/customers/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`),
};

// Device API
export const deviceAPI = {
  getAll: (params?: any) =>
    apiClient.get('/devices', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/devices/${id}`),
  
  create: (data: any) =>
    apiClient.post('/devices', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/devices/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/devices/${id}`),
  
  getStats: () =>
    apiClient.get('/devices/stats'),
  
  getLogs: (id: string, params?: any) =>
    apiClient.get(`/devices/${id}/logs`, { params }),
};

// Subscription API
export const subscriptionAPI = {
  getAll: (params?: any) =>
    apiClient.get('/subscriptions', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/subscriptions/${id}`),
  
  create: (data: any) =>
    apiClient.post('/subscriptions', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/subscriptions/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/subscriptions/${id}`),
  
  getExpiring: (params?: any) =>
    apiClient.get('/subscriptions/expiring', { params }),
};

// Payment API
export const paymentAPI = {
  getAll: (params?: any) =>
    apiClient.get('/payments', { params }),
  
  getById: (id: string | number) =>
    apiClient.get(`/payments/${id}`),
  
  create: (data: any) =>
    apiClient.post('/payments', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/payments/${id}`, data),
  
  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/payments/${id}/status`, { status }),
  
  process: (id: string, data: any) =>
    apiClient.put(`/payments/${id}/process`, data),
  
  delete: (id: string | number) =>
    apiClient.delete(`/payments/${id}`),
  
  getStats: (params?: any) =>
    apiClient.get('/payments/stats', { params }),
  
  getMonthlyRevenue: (params?: any) =>
    apiClient.get('/payments/revenue/monthly', { params }),
  
  getByCustomer: (customerId: number) =>
    apiClient.get(`/payments/customer/${customerId}`),
  
  generateInvoice: (paymentId: number) =>
    apiClient.post(`/payments/${paymentId}/invoice`),
};

// Alert API
export const alertAPI = {
  getAll: (params?: any) =>
    apiClient.get('/alerts', { params }),
  
  getById: (id: string | number) =>
    apiClient.get(`/alerts/${id}`),
  
  create: (data: any) =>
    apiClient.post('/alerts', data),
  
  acknowledge: (id: string) =>
    apiClient.put(`/alerts/${id}/acknowledge`),
  
  resolve: (id: string | number, data?: any) =>
    apiClient.put(`/alerts/${id}/resolve`, data),
  
  dismiss: (id: string) =>
    apiClient.put(`/alerts/${id}/dismiss`),
  
  delete: (id: string | number) =>
    apiClient.delete(`/alerts/${id}`),
  
  getStats: () =>
    apiClient.get('/alerts/stats'),
  
  markAsRead: (id: number) =>
    apiClient.patch(`/alerts/${id}/read`),
  
  markMultipleAsRead: (ids: number[]) =>
    apiClient.post('/alerts/mark-read', { ids }),
  
  markAllAsRead: () =>
    apiClient.post('/alerts/mark-all-read'),
};

// Bandwidth API
export const bandwidthAPI = {
  getAll: (params?: any) =>
    apiClient.get('/bandwidth', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/bandwidth/${id}`),
  
  create: (data: any) =>
    apiClient.post('/bandwidth', data),
  
  getCustomerSummary: (customerId: string, params?: any) =>
    apiClient.get(`/bandwidth/customer/${customerId}/summary`, { params }),
  
  getTopConsumers: (params?: any) =>
    apiClient.get('/bandwidth/top', { params }),
  
  getRealtime: () =>
    apiClient.get('/bandwidth/realtime'),
  
  getHistory: (params?: any) =>
    apiClient.get('/bandwidth/history', { params }),
  
  getStats: (params?: any) =>
    apiClient.get('/bandwidth/stats', { params }),
  
  getByCustomer: (customerId: number) =>
    apiClient.get(`/bandwidth/customer/${customerId}`),
  
  getByDevice: (deviceId: number) =>
    apiClient.get(`/bandwidth/device/${deviceId}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    apiClient.get('/dashboard/stats'),
};

// MikroTik API
export const mikrotikAPI = {
  testConnection: (data: { ipAddress: string; port: number; username: string; password: string; useSsl?: boolean }) =>
    apiClient.post('/mikrotik/test-connection', data),
  
  connect: (deviceId: number) =>
    apiClient.post(`/mikrotik/${deviceId}/connect`),
  
  disconnect: (deviceId: number) =>
    apiClient.post(`/mikrotik/${deviceId}/disconnect`),
  
  getConnectionStatus: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/connection-status`),
  
  getResources: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/resources`),
  
  getInterfaces: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/interfaces`),
  
  getInterfaceTraffic: (deviceId: number, interfaceName: string) =>
    apiClient.get(`/mikrotik/${deviceId}/interfaces/${interfaceName}/traffic`),
  
  getIpAddresses: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/ip-addresses`),
  
  getDhcpLeases: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/dhcp-leases`),
  
  getPppoeSessions: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/pppoe-sessions`),
  
  getWirelessClients: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/wireless-clients`),
  
  getLogs: (deviceId: number, limit?: number) =>
    apiClient.get(`/mikrotik/${deviceId}/logs`, { params: { limit } }),
  
  executeCommand: (deviceId: number, command: string, params?: any[]) =>
    apiClient.post(`/mikrotik/${deviceId}/command`, { command, params }),
};
