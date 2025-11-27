// MikroTik API client
export const mikrotikAPI = {
  // Test connection before saving
  testConnection: (data: {
    ipAddress: string;
    port: number;
    username: string;
    password: string;
  }) => apiClient.post('/mikrotik/test-connection', data),

  // Connect to device
  connect: (deviceId: number) =>
    apiClient.post(`/mikrotik/${deviceId}/connect`),

  // Disconnect from device
  disconnect: (deviceId: number) =>
    apiClient.post(`/mikrotik/${deviceId}/disconnect`),

  // Get connection status
  getConnectionStatus: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/connection-status`),

  // Get system resources
  getResources: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/resources`),

  // Get interfaces
  getInterfaces: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/interfaces`),

  // Get interface traffic
  getInterfaceTraffic: (deviceId: number, interfaceName: string) =>
    apiClient.get(`/mikrotik/${deviceId}/interfaces/${interfaceName}/traffic`),

  // Get IP addresses
  getIpAddresses: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/ip-addresses`),

  // Get DHCP leases
  getDhcpLeases: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/dhcp-leases`),

  // Get PPPoE sessions
  getPppoeSessions: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/pppoe-sessions`),

  // Get wireless clients
  getWirelessClients: (deviceId: number) =>
    apiClient.get(`/mikrotik/${deviceId}/wireless-clients`),

  // Get logs
  getLogs: (deviceId: number, limit?: number) =>
    apiClient.get(`/mikrotik/${deviceId}/logs`, { params: { limit } }),

  // Execute command
  executeCommand: (deviceId: number, command: string, params?: any[]) =>
    apiClient.post(`/mikrotik/${deviceId}/command`, { command, params }),
};
