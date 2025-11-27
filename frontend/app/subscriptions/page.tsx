'use client';

import { useState, useEffect } from 'react';
import { subscriptionAPI, customerAPI } from '@/lib/api/client';
import { Subscription, SubscriptionStats } from '@/lib/api/subscriptions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
    Package,
    TrendingUp,
    Users,
    DollarSign,
    AlertCircle,
    Calendar,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    const [formData, setFormData] = useState({
        customerId: 0,
        planName: '',
        planType: 'basic' as const,
        bandwidth: 10,
        price: 0,
        billingCycle: 'monthly' as const,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        autoRenew: true,
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;

            const [subsRes, customersRes] = await Promise.all([
                subscriptionAPI.getAll(params),
                customerAPI.getAll(),
            ]);

            const subsData = subsRes?.data || subsRes || [];
            const customersData = customersRes?.data || customersRes || [];

            // Calculate stats from subscriptions data
            const now = new Date();
            const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            const statsData: SubscriptionStats = {
                total: subsData.length,
                active: subsData.filter((s: any) => s.status === 'active').length,
                expired: subsData.filter((s: any) => s.status === 'expired').length,
                suspended: subsData.filter((s: any) => s.status === 'suspended').length,
                totalRevenue: subsData.reduce((sum: number, s: any) => sum + (s.price || 0), 0),
                monthlyRevenue: subsData
                    .filter((s: any) => s.status === 'active' && s.billingCycle === 'monthly')
                    .reduce((sum: number, s: any) => sum + (s.price || 0), 0),
                expiringThisWeek: subsData.filter((s: any) => {
                    const endDate = new Date(s.endDate);
                    return endDate <= oneWeekFromNow && endDate > now;
                }).length,
                expiringThisMonth: subsData.filter((s: any) => {
                    const endDate = new Date(s.endDate);
                    return endDate <= oneMonthFromNow && endDate > now;
                }).length,
            };

            // Map customer names
            const subscriptionsWithCustomers = subsData.map((sub: Subscription) => {
                const customer = customersData.find((c: any) => c.id === sub.customerId);
                return {
                    ...sub,
                    customerName: customer?.name || 'Unknown Customer',
                };
            });

            setSubscriptions(subscriptionsWithCustomers);
            setStats(statsData);
            setCustomers(customersData);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSubscription) {
                await subscriptionAPI.update(String(editingSubscription.id), formData);
                toast.success('Subscription updated successfully');
            } else {
                await subscriptionAPI.create(formData);
                toast.success('Subscription created successfully');
            }
            setShowAddModal(false);
            setEditingSubscription(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to save subscription:', error);
            toast.error('Failed to save subscription');
        }
    };

    const handleEdit = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setFormData({
            customerId: subscription.customerId,
            planName: subscription.planName,
            planType: subscription.planType as 'basic',
            bandwidth: subscription.bandwidth,
            price: subscription.price,
            billingCycle: subscription.billingCycle as 'monthly',
            startDate: subscription.startDate.split('T')[0],
            endDate: subscription.endDate.split('T')[0],
            autoRenew: subscription.autoRenew,
            notes: subscription.notes || '',
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this subscription?')) return;

        try {
            await subscriptionAPI.delete(String(id));
            toast.success('Subscription deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Failed to delete subscription:', error);
            toast.error('Failed to delete subscription');
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await subscriptionAPI.update(String(id), { status });
            toast.success(`Subscription ${status}`);
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const resetForm = () => {
        setFormData({
            customerId: 0,
            planName: '',
            planType: 'basic',
            bandwidth: 10,
            price: 0,
            billingCycle: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            autoRenew: true,
            notes: '',
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'default' } = {
            active: 'success',
            pending: 'warning',
            expired: 'danger',
            suspended: 'default',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const getPlanTypeBadge = (type: string) => {
        const variants: { [key: string]: 'success' | 'info' | 'warning' | 'default' } = {
            basic: 'default',
            business: 'info',
            enterprise: 'success',
            custom: 'warning',
        };
        return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const calculateDaysRemaining = (endDate: string) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subscriptions Management</h1>
                    <p className="text-gray-500 mt-1">Manage customer subscription plans and billing</p>
                </div>
                <Button onClick={() => { setShowAddModal(true); setEditingSubscription(null); resetForm(); }} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Subscription
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Subscriptions</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                <p className="text-xs text-green-600 mt-1">{stats.active} active</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.monthlyRevenue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Total: {formatCurrency(stats.totalRevenue)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Expiring This Week</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expiringThisWeek}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stats.expiringThisMonth} this month
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Inactive</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.expired + stats.suspended}
                                </p>
                                <p className="text-xs text-red-600 mt-1">{stats.expired} expired</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search subscriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <Button variant="secondary" onClick={fetchData} className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Subscriptions Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bandwidth</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        No subscriptions found
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((subscription) => {
                                    const daysRemaining = calculateDaysRemaining(subscription.endDate);
                                    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

                                    return (
                                        <tr key={subscription.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {subscription.customerName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{subscription.planName}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPlanTypeBadge(subscription.planType)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{subscription.bandwidth} Mbps</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(subscription.price)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {subscription.billingCycle}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className={`text-sm ${isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                                                        {new Date(subscription.endDate).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                                {daysRemaining > 0 && (
                                                    <span className={`text-xs ${isExpiringSoon ? 'text-orange-600' : 'text-gray-500'}`}>
                                                        {daysRemaining} days left
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(subscription.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(subscription)}
                                                        className="p-1"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {subscription.status === 'active' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(subscription.id, 'suspended')}
                                                            className="p-1 text-orange-600"
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {subscription.status === 'suspended' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(subscription.id, 'active')}
                                                            className="p-1 text-green-600"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(subscription.id)}
                                                        className="p-1 text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {editingSubscription ? 'Edit Subscription' : 'New Subscription'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Customer *
                                        </label>
                                        <select
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value={0}>Select Customer</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Plan Name *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.planName}
                                            onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                            placeholder="e.g., Premium Package"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Plan Type *
                                        </label>
                                        <select
                                            value={formData.planType}
                                            onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="basic">Basic</option>
                                            <option value="business">Business</option>
                                            <option value="enterprise">Enterprise</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bandwidth (Mbps) *
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.bandwidth}
                                            onChange={(e) => setFormData({ ...formData, bandwidth: parseInt(e.target.value) })}
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price (IDR) *
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Billing Cycle *
                                        </label>
                                        <select
                                            value={formData.billingCycle}
                                            onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date *
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date *
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.autoRenew}
                                            onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Auto-renew subscription</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Additional notes..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1">
                                        {editingSubscription ? 'Update Subscription' : 'Create Subscription'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => { setShowAddModal(false); setEditingSubscription(null); resetForm(); }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
