export interface Subscription {
    id: number;
    customerId: number;
    planName: string;
    planType: 'basic' | 'business' | 'enterprise' | 'custom';
    bandwidth: number; // Mbps
    price: number;
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'suspended' | 'pending';
    autoRenew: boolean;
    features?: string[];
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    // Relations
    customerName?: string;
}

export interface SubscriptionStats {
    total: number;
    active: number;
    expired: number;
    suspended: number;
    totalRevenue: number;
    monthlyRevenue: number;
    expiringThisWeek: number;
    expiringThisMonth: number;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    type: string;
    bandwidth: number;
    price: number;
    features: string[];
    isActive: boolean;
}
