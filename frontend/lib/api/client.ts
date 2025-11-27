import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
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
  
  getById: (id: string) =>
    apiClient.get(`/payments/${id}`),
  
  create: (data: any) =>
    apiClient.post('/payments', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/payments/${id}`, data),
  
  process: (id: string, data: any) =>
    apiClient.put(`/payments/${id}/process`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/payments/${id}`),
  
  getStats: (params?: any) =>
    apiClient.get('/payments/stats', { params }),
  
  getMonthlyRevenue: (params?: any) =>
    apiClient.get('/payments/revenue/monthly', { params }),
};

// Alert API
export const alertAPI = {
  getAll: (params?: any) =>
    apiClient.get('/alerts', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/alerts/${id}`),
  
  create: (data: any) =>
    apiClient.post('/alerts', data),
  
  acknowledge: (id: string) =>
    apiClient.put(`/alerts/${id}/acknowledge`),
  
  resolve: (id: string, data?: any) =>
    apiClient.put(`/alerts/${id}/resolve`, data),
  
  dismiss: (id: string) =>
    apiClient.put(`/alerts/${id}/dismiss`),
  
  delete: (id: string) =>
    apiClient.delete(`/alerts/${id}`),
  
  getStats: () =>
    apiClient.get('/alerts/stats'),
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
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    apiClient.get('/dashboard/stats'),
};
