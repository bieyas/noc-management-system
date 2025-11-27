'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import { deviceAPI } from '@/lib/api/client';
import { Device } from '@/types';
import { formatDateTime } from '@/lib/utils/helpers';
import { Server, Activity, AlertCircle, Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });

    useEffect(() => {
        fetchDevices();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchDevices, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDevices = async () => {
        try {
            const response: any = await deviceAPI.getAll();
            const devicesData = response.data || [];
            setDevices(devicesData);

            // Calculate stats
            const online = devicesData.filter((d: Device) => d.status === 'online').length;
            const offline = devicesData.filter((d: Device) => d.status === 'offline').length;
            setStats({
                total: devicesData.length,
                online,
                offline,
            });
        } catch (error) {
            toast.error('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (type: string) => {
        return <Server className="w-5 h-5" />;
    };

    const getStatusBadge = (status: string) => {
        if (status === 'online') return <Badge variant="success">Online</Badge>;
        if (status === 'offline') return <Badge variant="danger">Offline</Badge>;
        return <Badge variant="warning">Maintenance</Badge>;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Network Devices</h2>
                        <p className="text-gray-600 mt-1">Monitor your network infrastructure</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Device
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Devices</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            </div>
                            <Server className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Online</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.online}</p>
                            </div>
                            <Activity className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Offline</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.offline}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Devices Grid */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${device.status === 'online' ? 'bg-green-50' :
                                                device.status === 'offline' ? 'bg-red-50' : 'bg-yellow-50'
                                            }`}>
                                            {getDeviceIcon(device.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{device.name}</h3>
                                            <p className="text-sm text-gray-500">{device.deviceId}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(device.status)}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium text-gray-900 capitalize">{device.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">IP Address:</span>
                                        <span className="font-medium text-gray-900">{device.ipAddress}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-medium text-gray-900">{device.location}</span>
                                    </div>
                                    {device.lastSeen && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Seen:</span>
                                            <span className="font-medium text-gray-900">
                                                {formatDateTime(device.lastSeen)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && devices.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No devices found</p>
                        <Button className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Device
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
