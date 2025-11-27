import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatBandwidth(bps: number): string {
  if (bps === 0) return '0 bps';
  const k = 1000;
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  const i = Math.floor(Math.log(bps) / Math.log(k));
  return `${parseFloat((bps / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Device status
    online: 'text-green-600 bg-green-50',
    offline: 'text-red-600 bg-red-50',
    maintenance: 'text-yellow-600 bg-yellow-50',
    
    // Customer status
    active: 'text-green-600 bg-green-50',
    suspended: 'text-orange-600 bg-orange-50',
    inactive: 'text-gray-600 bg-gray-50',
    
    // Payment status
    paid: 'text-green-600 bg-green-50',
    pending: 'text-yellow-600 bg-yellow-50',
    overdue: 'text-red-600 bg-red-50',
    
    // Subscription status
    expired: 'text-red-600 bg-red-50',
    
    // Alert severity
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-blue-600 bg-blue-50',
    info: 'text-gray-600 bg-gray-50',
    
    // Alert status
    new: 'text-blue-600 bg-blue-50',
    acknowledged: 'text-yellow-600 bg-yellow-50',
    resolved: 'text-green-600 bg-green-50',
    dismissed: 'text-gray-600 bg-gray-50',
  };
  
  return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-50';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
