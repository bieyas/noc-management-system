'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/Loading';
import { deviceAPI, customerAPI, paymentAPI, alertAPI } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/helpers';
import { useSocket, useDeviceStatus, useAlerts } from '@/lib/hooks/useSocket';
import {
    Users,
    Server,
    DollarSign,
    Bell,
    TrendingUp,
    Activity,
    Wifi,
    WifiOff,
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
    const { isConnected } = useSocket();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Real-time device status updates
    useDeviceStatus((data: any) => {
        console.log('Device status update:', data);
        if (data.status) {
            fetchDashboardData();
        }
    });

    // Real-time alert notifications
    useAlerts((alert: any) => {
        console.log('New alert:', alert);
        toast.error(`New Alert: ${alert.title}`);
        if (alert.severity === 'critical') {
            fetchDashboardData();
        }
    });

    const fetchDashboardData = async () => {
        console.log('=== Starting dashboard fetch ===');
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found!');
            window.location.href = '/auth/login';
            return;
        }

        try {
            const [customersRes, devicesRes, paymentsRes, alertsRes] = await Promise.all([
                customerAPI.getAll().catch(e => ({ data: [] })),
                deviceAPI.getStats().catch(e => ({ data: { total: 0, online: 0 } })),
                paymentAPI.getStats().catch(e => ({ data: { totalRevenue: 0, pendingCount: 0 } })),
                alertAPI.getStats().catch(e => ({ data: { critical: 0 } })),
            ]);

            const customers = Array.isArray(customersRes?.data) ? customersRes.data : [];
            const deviceStats = devicesRes?.data || {};
            const paymentStats = paymentsRes?.data || {};
            const alertStats = alertsRes?.data || {};

            setStats({
                totalCustomers: customers.length || 0,
                activeCustomers: customers.filter((c: any) => c.status === 'active').length || 0,
                totalDevices: deviceStats.total || 0,
                onlineDevices: deviceStats.online || 0,
                totalRevenue: paymentStats.totalRevenue || 0,
                pendingPayments: paymentStats.pendingCount || 0,
                criticalAlerts: alertStats.critical || 0,
            });
        } catch (error: any) {
            console.error('Dashboard error:', error);
            toast.error('Failed to load dashboard data');
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
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Welcome to NOC Management System</h2>
                            <p className="mt-2 text-blue-100">Monitor your network in real-time</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                            {isConnected ? (
                                <>
                                    <Wifi className="w-5 h-5" />
                                    <span className="text-sm font-medium">Live</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-5 h-5" />
                                    <span className="text-sm font-medium">Offline</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Customers"
                        value={stats?.totalCustomers || 0}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                        trend={{ value: 12, isPositive: true }}
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
                        trend={{ value: 8, isPositive: true }}
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
                            <span className="text-gray-600">Real-time Updates</span>
                            <span className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
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
