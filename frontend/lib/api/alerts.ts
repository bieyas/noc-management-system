import { apiClient } from './client';

export interface Alert {
  id: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  source?: string;
  deviceId?: number;
  customerId?: number;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertStats {
  total: number;
  unread: number;
  critical: number;
  resolved: number;
  byType: {
    [key: string]: number;
  };
}

export const alertAPI = {
  // Get all alerts with optional filters
  getAll: async (params?: {
    severity?: string;
    isRead?: boolean;
    isResolved?: boolean;
    type?: string;
  }) => {
    const response = await apiClient.get<Alert[]>('/alerts', { params });
    return response.data;
  },

  // Get alert by ID
  getById: async (id: number) => {
    const response = await apiClient.get<Alert>(`/alerts/${id}`);
    return response.data;
  },

  // Get alert statistics
  getStats: async () => {
    const response = await apiClient.get<AlertStats>('/alerts/stats');
    return response.data;
  },

  // Mark alert as read
  markAsRead: async (id: number) => {
    const response = await apiClient.patch<Alert>(`/alerts/${id}/read`);
    return response.data;
  },

  // Mark multiple alerts as read
  markMultipleAsRead: async (ids: number[]) => {
    const response = await apiClient.post('/alerts/mark-read', { ids });
    return response.data;
  },

  // Mark all alerts as read
  markAllAsRead: async () => {
    const response = await apiClient.post('/alerts/mark-all-read');
    return response.data;
  },

  // Resolve alert
  resolve: async (id: number, notes?: string) => {
    const response = await apiClient.patch<Alert>(`/alerts/${id}/resolve`, { notes });
    return response.data;
  },

  // Delete alert
  delete: async (id: number) => {
    const response = await apiClient.delete(`/alerts/${id}`);
    return response.data;
  },

  // Get recent alerts (last 24 hours)
  getRecent: async () => {
    const response = await apiClient.get<Alert[]>('/alerts/recent');
    return response.data;
  },
};
