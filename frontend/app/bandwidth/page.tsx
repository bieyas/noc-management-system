'use client';

import { useState, useEffect } from 'react';
import { bandwidthAPI, customerAPI } from '@/lib/api/client';
import { BandwidthUsage, BandwidthStats, BandwidthHistory } from '@/lib/api/bandwidth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Download,
    Upload,
    Server,
    Users,
    RefreshCw,
    Calendar,
} from 'lucide-react';

export default function BandwidthPage() {
    const [currentUsage, setCurrentUsage] = useState<BandwidthUsage[]>([]);
    const [history, setHistory] = useState<BandwidthHistory[]>([]);
    const [stats, setStats] = useState<BandwidthStats | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [interval, setInterval] = useState<string>('hour');
    const [selectedCustomer, setSelectedCustomer] = useState<number>(0);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchData();

        // Auto-refresh every 10 seconds if enabled
        if (autoRefresh) {
            const refreshInterval = window.setInterval(() => fetchData(), 10000);
            return () => window.clearInterval(refreshInterval);
        }
    }, [interval, selectedCustomer, autoRefresh]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = { interval };
            if (selectedCustomer) params.customerId = selectedCustomer;

            const [currentRes, historyRes, statsRes, customersRes] = await Promise.all([
                bandwidthAPI.getRealtime(),
                bandwidthAPI.getHistory(params),
                bandwidthAPI.getStats(params),
                customerAPI.getAll(),
            ]);

            const currentData = currentRes?.data || currentRes || [];
            const historyData = historyRes?.data || historyRes || [];
            const statsData = statsRes?.data || statsRes || null;
            const customersData = customersRes?.data || customersRes || [];

            // Map customer names
            const usageWithCustomers = currentData.map((usage: BandwidthUsage) => {
                const customer = customersData.find((c: any) => c.id === usage.customerId);
                return {
                    ...usage,
                    customerName: customer?.name || 'Unknown',
                };
            });

            setCurrentUsage(usageWithCustomers);
            setHistory(historyData);
            setStats(statsData);
            setCustomers(customersData);
        } catch (error) {
            console.error('Failed to fetch bandwidth data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatSpeed = (bytesPerSecond: number) => {
        return formatBytes(bytesPerSecond) + '/s';
    };

    const formatChartData = (data: BandwidthHistory[]) => {
        return data.map(item => ({
            time: new Date(item.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            Upload: Math.round(item.upload / 1024 / 1024), // Convert to MB
            Download: Math.round(item.download / 1024 / 1024),
            Total: Math.round(item.total / 1024 / 1024),
        }));
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const chartData = formatChartData(history);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bandwidth Monitoring</h1>
                    <p className="text-gray-500 mt-1">Real-time bandwidth usage and statistics</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={autoRefresh ? 'primary' : 'secondary'}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                    </Button>
                    <Button onClick={fetchData} variant="secondary" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh Now
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Bandwidth</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatBytes(stats.totalBandwidth)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Activity className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Upload</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatBytes(stats.totalUpload)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Avg: {formatSpeed(stats.avgUpload)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Upload className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Download</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatBytes(stats.totalDownload)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Avg: {formatSpeed(stats.avgDownload)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Download className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Peak Upload</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatSpeed(stats.peakUpload)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Peak DL: {formatSpeed(stats.peakDownload)}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={0}>All Customers</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="hour">Last Hour</option>
                            <option value="day">Last 24 Hours</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Bandwidth Chart */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Bandwidth Usage Over Time
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="Download"
                            stackId="1"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.6}
                        />
                        <Area
                            type="monotone"
                            dataKey="Upload"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload vs Download Chart */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Upload vs Download
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Upload"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="Download"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Top Consumers */}
                {stats && stats.topConsumers && stats.topConsumers.length > 0 && (
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Top Bandwidth Consumers
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.topConsumers.slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="customerName" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => formatBytes(value)}
                                />
                                <Bar dataKey="totalUsage" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}
            </div>

            {/* Current Usage Table */}
            <Card>
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Current Usage</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Device
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Upload
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Download
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsage.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No current usage data
                                    </td>
                                </tr>
                            ) : (
                                currentUsage.slice(0, 10).map((usage) => (
                                    <tr key={usage.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {usage.customerName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Server className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {usage.deviceName || `Device ${usage.deviceId}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Upload className="w-3 h-3 text-green-600" />
                                                <span className="text-sm text-gray-900">
                                                    {formatSpeed(usage.upload)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Download className="w-3 h-3 text-purple-600" />
                                                <span className="text-sm text-gray-900">
                                                    {formatSpeed(usage.download)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatSpeed(usage.total)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(usage.timestamp).toLocaleTimeString('id-ID')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
