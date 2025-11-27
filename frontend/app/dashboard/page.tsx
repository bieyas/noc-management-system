'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/Loading';
import { deviceAPI, customerAPI, paymentAPI, alertAPI } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/helpers';
import {
    Users,
    Server,
    DollarSign,
    Bell,
    TrendingUp,
    Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
    totalCustomers: number;
    activeCustomers: number;
    totalDevices: number;
    onlineDevices: number;
    totalRevenue: number;
    pendingPayments: number;
    criticalAlerts: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        console.log('=== Starting dashboard fetch ===');

        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');

        if (!token) {
            console.error('No token found! Redirecting to login...');
            window.location.href = '/auth/login';
            return;
        }

        try {
            console.log('Fetching customers...');
            console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

            const customersRes = await customerAPI.getAll().catch(e => {
                console.error('Customers API error:', e);
                return { data: [] };
            });
            console.log('Customers response:', customersRes);

            console.log('Fetching device stats...');
            const devicesRes = await deviceAPI.getStats().catch(e => {
                console.error('Devices API error:', e);
                return { data: { total: 0, online: 0, offline: 0 } };
            });
            console.log('Devices response:', devicesRes);

            console.log('Fetching payment stats...');
            const paymentsRes = await paymentAPI.getStats().catch(e => {
                console.error('Payments API error:', e);
                return { data: { totalRevenue: 0, pendingCount: 0 } };
            });
            console.log('Payments response:', paymentsRes);

            console.log('Fetching alert stats...');
            const alertsRes = await alertAPI.getStats().catch(e => {
                console.error('Alerts API error:', e);
                return { data: { critical: 0 } };
            });
            console.log('Alerts response:', alertsRes);

            // API client interceptor returns response.data directly
            // So customersRes is actually the data object {success, data}
            const customers = Array.isArray(customersRes?.data) ? customersRes.data : (Array.isArray(customersRes) ? customersRes : []);
            const deviceStats = devicesRes?.data || devicesRes || {};
            const paymentStats = paymentsRes?.data || paymentsRes || {};
            const alertStats = alertsRes?.data || alertsRes || {};

            console.log('Parsed data:', {
                customersCount: customers.length,
                deviceStats,
                paymentStats,
                alertStats
            });

            setStats({
                totalCustomers: customers.length || 0,
                activeCustomers: customers.filter((c: any) => c.status === 'active').length || 0,
                totalDevices: deviceStats.total || 0,
                onlineDevices: deviceStats.online || 0,
                totalRevenue: paymentStats.totalRevenue || 0,
                pendingPayments: paymentStats.pendingCount || 0,
                criticalAlerts: alertStats.critical || 0,
            });

            console.log('=== Dashboard fetch completed ===');
        } catch (error: any) {
            console.error('=== Dashboard FATAL error ===', error);
            toast.error('Gagal memuat data dashboard');
            // Set default stats even on error
            setStats({
                totalCustomers: 0,
                activeCustomers: 0,
                totalDevices: 0,
                onlineDevices: 0,
                totalRevenue: 0,
                pendingPayments: 0,
                criticalAlerts: 0,
            });
        } finally {
            console.log('=== Setting loading to false ===');
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                    <h2 className="text-2xl font-bold">Welcome to NOC Management System</h2>
                    <p className="mt-2 text-blue-100">Monitor your network, manage customers, and track billing in real-time</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Customers"
                        value={stats?.totalCustomers || 0}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                        trend={{
                            value: 12,
                            isPositive: true,
                        }}
                    />

                    <StatCard
                        title="Online Devices"
                        value={`${stats?.onlineDevices || 0}/${stats?.totalDevices || 0}`}
                        icon={<Server className="w-6 h-6" />}
                        color="green"
                    />

                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        icon={<DollarSign className="w-6 h-6" />}
                        color="green"
                        trend={{
                            value: 8,
                            isPositive: true,
                        }}
                    />

                    <StatCard
                        title="Critical Alerts"
                        value={stats?.criticalAlerts || 0}
                        icon={<Bell className="w-6 h-6" />}
                        color="red"
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Customers</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.activeCustomers}</p>
                            </div>
                            <Activity className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Payments</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.pendingPayments}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Device Uptime</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stats?.totalDevices ? Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0}%
                                </p>
                            </div>
                            <Server className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                            <Users className="w-5 h-5" />
                            <span>Add Customer</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors">
                            <Server className="w-5 h-5" />
                            <span>Add Device</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors">
                            <DollarSign className="w-5 h-5" />
                            <span>Create Invoice</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span>View Alerts</span>
                        </button>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Network Monitoring</span>
                            <span className="flex items-center space-x-2 text-green-600">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                <span>Active</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Billing Service</span>
                            <span className="flex items-center space-x-2 text-green-600">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                <span>Running</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Database</span>
                            <span className="flex items-center space-x-2 text-green-600">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                <span>Connected</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
