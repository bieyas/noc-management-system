'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { authAPI, subscriptionAPI, paymentAPI, bandwidthAPI } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
    User,
    CreditCard,
    Wifi,
    FileText,
    Bell,
    LogOut,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerDashboardPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        if (!user || user.role !== 'customer') {
            router.push('/customer/login');
            return;
        }
        fetchDashboardData();
    }, [user, router]);

    const fetchDashboardData = async () => {
        try {
            const [subscriptionRes, paymentsRes, bandwidthRes] = await Promise.all([
                subscriptionAPI.getAll({ customerId: user?.id }).catch(() => ({ data: [] })),
                paymentAPI.getByCustomer(Number(user?.id) || 0).catch(() => ({ data: [] })),
                bandwidthAPI.getByCustomer(Number(user?.id) || 0).catch(() => ({ data: [] })),
            ]);

            const subscriptionData = subscriptionRes?.data || subscriptionRes || [];
            const subscription = Array.isArray(subscriptionData) ? subscriptionData[0] : subscriptionData;
            const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []);
            const bandwidth = Array.isArray(bandwidthRes?.data) ? bandwidthRes.data : (Array.isArray(bandwidthRes) ? bandwidthRes : []);

            setDashboardData({
                subscription,
                recentPayments: payments.slice(0, 5),
                totalPaid: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
                pendingPayments: payments.filter((p: any) => p.status === 'pending').length,
                bandwidthUsage: bandwidth.reduce((sum: number, b: any) => sum + (b.total || 0), 0),
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/customer/login');
        toast.success('Logged out successfully');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const subscription = dashboardData?.subscription;
    const daysUntilExpiry = subscription?.endDate
        ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Welcome back, {user?.fullName || user?.username}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Subscription</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {subscription?.planName || 'No Plan'}
                                    </p>
                                    {daysUntilExpiry > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {daysUntilExpiry} days remaining
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Wifi className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Paid</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0,
                                        }).format(dashboardData?.totalPaid || 0)}
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
                                    <p className="text-sm text-gray-600">Pending Payments</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {dashboardData?.pendingPayments || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Bandwidth Used</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {(dashboardData?.bandwidthUsage / 1024 / 1024 / 1024).toFixed(2)} GB
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Subscription Status */}
                    {subscription && (
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h2>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl font-bold text-gray-900">{subscription.planName}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                                            subscription.status === 'expired' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {subscription.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Started: {new Date(subscription.startDate).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Expires: {new Date(subscription.endDate).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="primary">Renew Subscription</Button>
                                    <Button variant="secondary">Upgrade Plan</Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Recent Payments */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {dashboardData?.recentPayments?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No payments found
                                            </td>
                                        </tr>
                                    ) : (
                                        dashboardData?.recentPayments?.map((payment: any) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {payment.description || 'Payment'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    }).format(payment.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <Button variant="ghost" size="sm">View Invoice</Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">My Profile</h3>
                                    <p className="text-sm text-gray-600">Update account details</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Payment History</h3>
                                    <p className="text-sm text-gray-600">View all transactions</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Bell className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Support</h3>
                                    <p className="text-sm text-gray-600">Get help & submit tickets</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
