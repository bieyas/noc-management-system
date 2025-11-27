import { apiClient } from './client';

export interface BandwidthUsage {
  id: number;
  deviceId: number;
  customerId: number;
  customerName?: string;
  deviceName?: string;
  upload: number;
  download: number;
  total: number;
  timestamp: string;
}

export interface BandwidthStats {
  totalUpload: number;
  totalDownload: number;
  totalBandwidth: number;
  avgUpload: number;
  avgDownload: number;
  peakUpload: number;
  peakDownload: number;
  topConsumers: Array<{
    customerId: number;
    customerName: string;
    totalUsage: number;
  }>;
}

export interface BandwidthHistory {
  timestamp: string;
  upload: number;
  download: number;
  total: number;
}

export const bandwidthAPI = {
  // Get current bandwidth usage
  getCurrent: async () => {
    const response = await apiClient.get<BandwidthUsage[]>('/bandwidth/current');
    return response.data;
  },

  // Get bandwidth history
  getHistory: async (params?: {
    customerId?: number;
    deviceId?: number;
    startDate?: string;
    endDate?: string;
    interval?: string; // hour, day, week, month
  }) => {
    const response = await apiClient.get<BandwidthHistory[]>('/bandwidth/history', { params });
    return response.data;
  },

  // Get bandwidth statistics
  getStats: async (params?: {
    customerId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<BandwidthStats>('/bandwidth/stats', { params });
    return response.data;
  },

  // Get bandwidth by customer
  getByCustomer: async (customerId: number) => {
    const response = await apiClient.get<BandwidthUsage[]>(`/bandwidth/customer/${customerId}`);
    return response.data;
  },

  // Get bandwidth by device
  getByDevice: async (deviceId: number) => {
    const response = await apiClient.get<BandwidthUsage[]>(`/bandwidth/device/${deviceId}`);
    return response.data;
  },

  // Get real-time bandwidth (WebSocket alternative)
  getRealtime: async () => {
    const response = await apiClient.get<BandwidthUsage[]>('/bandwidth/realtime');
    return response.data;
  },
};
