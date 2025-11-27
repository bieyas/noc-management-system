'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import { deviceAPI, mikrotikAPI } from '@/lib/api/client';
import { Device } from '@/types';
import { formatDateTime } from '@/lib/utils/helpers';
import { Server, Activity, AlertCircle, Plus, Eye, Edit2, Trash2, X, CheckCircle, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeviceFormData {
    name: string;
    deviceId: string;
    type: 'mikrotik' | 'olt' | 'switch' | 'router' | 'server';
    ipAddress: string;
    location: string;
    description?: string;
    apiConfig?: {
        port: number;
        username: string;
        password: string;
        useSsl: boolean;
    };
}

export default function DevicesPage() {
    const router = useRouter();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
    const [showModal, setShowModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [formData, setFormData] = useState<DeviceFormData>({
        name: '',
        deviceId: '',
        type: 'mikrotik',
        ipAddress: '',
        location: '',
        description: '',
        apiConfig: {
            port: 8728,
            username: '',
            password: '',
            useSsl: false,
        },
    });

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

    const handleOpenModal = (device?: Device) => {
        if (device) {
            setEditingDevice(device);
            setFormData({
                name: device.name,
                deviceId: device.deviceId,
                type: device.type as any,
                ipAddress: device.ipAddress,
                location: device.location,
                description: device.description || '',
                apiConfig: device.apiConfig || {
                    port: 8728,
                    username: '',
                    password: '',
                    useSsl: false,
                },
            });
        } else {
            setEditingDevice(null);
            setFormData({
                name: '',
                deviceId: '',
                type: 'mikrotik',
                ipAddress: '',
                location: '',
                description: '',
                apiConfig: {
                    port: 8728,
                    username: '',
                    password: '',
                    useSsl: false,
                },
            });
        }
        setTestResult(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDevice(null);
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        if (formData.type !== 'mikrotik') {
            toast.error('Connection test only available for MikroTik devices');
            return;
        }

        if (!formData.ipAddress || !formData.apiConfig?.username || !formData.apiConfig?.password) {
            toast.error('Please fill in IP, username, and password');
            return;
        }

        try {
            setTesting(true);
            setTestResult(null);
            const result = await mikrotikAPI.testConnection({
                host: formData.ipAddress,
                port: formData.apiConfig.port,
                username: formData.apiConfig.username,
                password: formData.apiConfig.password,
                useSsl: formData.apiConfig.useSsl,
            });

            setTestResult({
                success: true,
                message: result?.data?.message || 'Connection successful!',
            });
            toast.success('Connection test successful!');
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 'Connection failed';
            setTestResult({
                success: false,
                message: errorMsg,
            });
            toast.error(errorMsg);
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = {
                name: formData.name,
                deviceId: formData.deviceId,
                type: formData.type,
                ipAddress: formData.ipAddress,
                location: formData.location,
                description: formData.description,
            };

            // Add apiConfig for MikroTik devices
            if (formData.type === 'mikrotik' && formData.apiConfig) {
                payload.apiConfig = formData.apiConfig;
            }

            if (editingDevice) {
                await deviceAPI.update(String(editingDevice.id), payload);
                toast.success('Device updated successfully');
            } else {
                await deviceAPI.create(payload);
                toast.success('Device added successfully');
            }

            handleCloseModal();
            fetchDevices();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save device');
        }
    };

    const handleDelete = async (deviceId: number) => {
        if (!confirm('Are you sure you want to delete this device?')) {
            return;
        }

        try {
            await deviceAPI.delete(String(deviceId));
            toast.success('Device deleted successfully');
            fetchDevices();
        } catch (error) {
            toast.error('Failed to delete device');
        }
    };

    const handleViewDetails = (deviceId: number) => {
        router.push(`/devices/${deviceId}`);
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
                    <Button onClick={() => handleOpenModal()}>
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

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenModal(device)}
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(device.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(device.id)}>
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
                        <Button className="mt-4" onClick={() => handleOpenModal()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Device
                        </Button>
                    </div>
                )}

                {/* Add/Edit Device Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {editingDevice ? 'Edit Device' : 'Add New Device'}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Basic Information</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Device Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., Main Router"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Device ID *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.deviceId}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, deviceId: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., CORE-01"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Device Type *
                                            </label>
                                            <select
                                                required
                                                value={formData.type}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        type: e.target.value as any,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="mikrotik">MikroTik Router</option>
                                                <option value="olt">OLT</option>
                                                <option value="switch">Switch</option>
                                                <option value="router">Router</option>
                                                <option value="server">Server</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                IP Address *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.ipAddress}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, ipAddress: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., 192.168.1.1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.location}
                                            onChange={(e) =>
                                                setFormData({ ...formData, location: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Server Room A"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={3}
                                            placeholder="Additional information about this device"
                                        />
                                    </div>
                                </div>

                                {/* MikroTik API Configuration */}
                                {formData.type === 'mikrotik' && (
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-medium text-gray-900">
                                            MikroTik API Configuration
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    API Port *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.apiConfig?.port}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            apiConfig: {
                                                                ...formData.apiConfig!,
                                                                port: parseInt(e.target.value),
                                                            },
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="8728"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Default: 8728 (non-SSL), 8729 (SSL)
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Use SSL
                                                </label>
                                                <div className="flex items-center h-[42px]">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.apiConfig?.useSsl}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                apiConfig: {
                                                                    ...formData.apiConfig!,
                                                                    useSsl: e.target.checked,
                                                                    port: e.target.checked ? 8729 : 8728,
                                                                },
                                                            })
                                                        }
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label className="ml-2 text-sm text-gray-700">
                                                        Enable SSL connection
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Username *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.apiConfig?.username}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            apiConfig: {
                                                                ...formData.apiConfig!,
                                                                username: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="admin"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Password *
                                                </label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.apiConfig?.password}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            apiConfig: {
                                                                ...formData.apiConfig!,
                                                                password: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        {/* Test Connection Button & Result */}
                                        <div className="space-y-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleTestConnection}
                                                disabled={testing}
                                                className="w-full"
                                            >
                                                {testing ? (
                                                    <>
                                                        <LoadingSpinner size="sm" />
                                                        <span className="ml-2">Testing Connection...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wifi className="w-4 h-4 mr-2" />
                                                        Test Connection
                                                    </>
                                                )}
                                            </Button>

                                            {testResult && (
                                                <div
                                                    className={`p-3 rounded-lg flex items-start gap-2 ${testResult.success
                                                            ? 'bg-green-50 text-green-800'
                                                            : 'bg-red-50 text-red-800'
                                                        }`}
                                                >
                                                    {testResult.success ? (
                                                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                    )}
                                                    <p className="text-sm">{testResult.message}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-xs text-blue-800">
                                                <strong>Note:</strong> Password will be encrypted before storage.
                                                Make sure the API service is enabled on your MikroTik device.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="secondary" onClick={handleCloseModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        {editingDevice ? 'Update Device' : 'Add Device'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
