// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff' | 'customer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Customer Types
export interface Customer {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  identityNumber: string;
  status: 'active' | 'suspended' | 'inactive';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  subscriptions?: Subscription[];
  devices?: Device[];
}

// Device Types
export interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: 'router' | 'switch' | 'access-point' | 'server' | 'other';
  ipAddress: string;
  macAddress: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  manufacturer?: string;
  model?: string;
  snmpVersion?: 'v1' | 'v2c' | 'v3';
  snmpCommunity?: string;
  customerId?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  logs?: NetworkLog[];
}

// Subscription Types
export interface Subscription {
  id: string;
  customerId: string;
  packageName: string;
  bandwidth: number;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'suspended';
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

// Payment Types
export interface Payment {
  id: string;
  customerId: string;
  subscriptionId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'cash' | 'transfer' | 'e-wallet' | 'credit-card' | 'other';
  status: 'pending' | 'paid' | 'overdue';
  invoiceNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  subscription?: Subscription;
}

// Alert Types
export interface Alert {
  id: string;
  type: 'device-down' | 'device-up' | 'high-latency' | 'bandwidth-exceeded' | 'payment-overdue' | 'subscription-expiring' | 'custom';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  deviceId?: string;
  customerId?: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  device?: Device;
  customer?: Customer;
}

// Network Log Types
export interface NetworkLog {
  id: string;
  deviceId: string;
  logType: 'ping' | 'snmp' | 'system';
  responseTime?: number;
  packetLoss?: number;
  status: 'success' | 'failure';
  message?: string;
  createdAt: string;
  device?: Device;
}

// Bandwidth Usage Types
export interface BandwidthUsage {
  id: string;
  customerId: string;
  deviceId?: string;
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  recordDate: string;
  createdAt: string;
  customer?: Customer;
  device?: Device;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalDevices: number;
  onlineDevices: number;
  totalRevenue: number;
  pendingPayments: number;
  criticalAlerts: number;
  activeSubscriptions: number;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Filters
export interface Filter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}
