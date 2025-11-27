'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deviceAPI, mikrotikAPI } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
    Server,
    Wifi,
    WifiOff,
    Cpu,
    HardDrive,
    Activity,
    Users,
    Network,
    ArrowLeft,
    RefreshCw,
    Terminal,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DeviceDetailPageProps {
    params: {
        id: string;
    };
}

export default function DeviceDetailPage({ params }: DeviceDetailPageProps) {
    const router = useRouter();
    const [device, setDevice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<any>(null);
    const [resources, setResources] = useState<any>(null);
    const [interfaces, setInterfaces] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDevice();
        const interval = setInterval(() => {
            if (device?.type === 'mikrotik') {
                fetchMikrotikData();
            }
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [params.id, device?.type]);

    const fetchDevice = async () => {
        try {
            setLoading(true);
            const response = await deviceAPI.getById(params.id);
            const deviceData = response?.data || response;
            setDevice(deviceData);

            if (deviceData.type === 'mikrotik') {
                await fetchMikrotikData();
            }
        } catch (error) {
            console.error('Failed to fetch device:', error);
            toast.error('Failed to load device');
        } finally {
            setLoading(false);
        }
    };

    const fetchMikrotikData = async () => {
        try {
            // Get connection status
            const statusRes = await mikrotikAPI.getConnectionStatus(parseInt(params.id));
            setConnectionStatus(statusRes?.data || statusRes);

            if (statusRes?.data?.connected || statusRes?.connected) {
                // Get system resources
                const resourcesRes = await mikrotikAPI.getResources(parseInt(params.id));
                setResources(resourcesRes?.data || resourcesRes);

                // Get interfaces
                const interfacesRes = await mikrotikAPI.getInterfaces(parseInt(params.id));
                setInterfaces(interfacesRes?.data || interfacesRes || []);

                // Get DHCP clients
                const leasesRes = await mikrotikAPI.getDhcpLeases(parseInt(params.id));
                setClients(leasesRes?.data || leasesRes || []);

                // Get logs
                const logsRes = await mikrotikAPI.getLogs(parseInt(params.id), 20);
                setLogs(logsRes?.data || logsRes || []);
            }
        } catch (error) {
            console.error('Failed to fetch MikroTik data:', error);
        }
    };

    const handleConnect = async () => {
        try {
            setConnecting(true);
            await mikrotikAPI.connect(parseInt(params.id));
            toast.success('Connected to device');
            await fetchMikrotikData();
        } catch (error: any) {
            console.error('Connection failed:', error);
            toast.error(error?.response?.data?.message || 'Failed to connect');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await mikrotikAPI.disconnect(parseInt(params.id));
            toast.success('Disconnected from device');
            setConnectionStatus({ connected: false });
            setResources(null);
            setInterfaces([]);
            setClients([]);
        } catch (error) {
            console.error('Disconnect failed:', error);
            toast.error('Failed to disconnect');
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatBps = (bps: number) => {
        if (bps === 0) return '0 bps';
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
        const i = Math.floor(Math.log(bps) / Math.log(k));
        return parseFloat((bps / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!device) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">Device not found</h2>
                    <Button onClick={() => router.push('/devices')} className="mt-4">
                        Back to Devices
                    </Button>
                </div>
            </div>
        );
    }

    const isConnected = connectionStatus?.connected;
    const cpuUsage = resources?.cpu || 0;
    const memoryUsed = resources?.memory?.used || 0;
    const memoryTotal = resources?.memory?.total || 0;
    const memoryPercent = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/devices')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{device.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant={device.status === 'online' ? 'success' : 'danger'}>
                                {device.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{device.ipAddress}</span>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-600">{device.type}</span>
                        </div>
                    </div>
                </div>

                {device.type === 'mikrotik' && (
                    <div className="flex items-center gap-3">
                        {isConnected ? (
                            <>
                                <Badge variant="success" className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Connected
                                </Badge>
                                <Button variant="secondary" onClick={handleDisconnect}>
                                    Disconnect
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleConnect}
                                disabled={connecting}
                                className="flex items-center gap-2"
                            >
                                {connecting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Wifi className="w-4 h-4" />
                                        Connect
                                    </>
                                )}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={fetchMikrotikData}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {device.type === 'mikrotik' && isConnected && resources && (
                <>
                    {/* System Resources */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">CPU Usage</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{cpuUsage}%</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Cpu className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${cpuUsage > 80 ? 'bg-red-500' : cpuUsage > 50 ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${cpuUsage}%` }}
                                />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Memory</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {memoryPercent.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatBytes(memoryUsed)} / {formatBytes(memoryTotal)}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Activity className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${memoryPercent > 80
                                            ? 'bg-red-500'
                                            : memoryPercent > 50
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                    style={{ width: `${memoryPercent}%` }}
                                />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Disk Space</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {formatBytes(resources.disk?.free || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Free of {formatBytes(resources.disk?.total || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <HardDrive className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Uptime</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {resources.uptime || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {resources.version || 'Unknown'}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Server className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-4">
                            {['overview', 'interfaces', 'clients', 'logs'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === tab
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Board Name</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {resources.boardName || 'Unknown'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Architecture</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {resources.architecture || 'Unknown'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">RouterOS Version</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {resources.version || 'Unknown'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Total Interfaces</dt>
                                        <dd className="text-sm font-medium text-gray-900">{interfaces.length}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Active Clients</dt>
                                        <dd className="text-sm font-medium text-gray-900">{clients.length}</dd>
                                    </div>
                                </dl>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-500">Interfaces Up</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {interfaces.filter((i) => i.status === 'up').length} /{' '}
                                                {interfaces.length}
                                            </span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{
                                                    width: `${interfaces.length > 0
                                                            ? (interfaces.filter((i) => i.status === 'up').length /
                                                                interfaces.length) *
                                                            100
                                                            : 0
                                                        }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-500">Total RX</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatBytes(
                                                    interfaces.reduce((sum, i) => sum + (i.rxBytes || 0), 0)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-500">Total TX</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatBytes(
                                                    interfaces.reduce((sum, i) => sum + (i.txBytes || 0), 0)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'interfaces' && (
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                RX
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                TX
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                Errors
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {interfaces.map((iface) => (
                                            <tr key={iface.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Network className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {iface.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {iface.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={iface.status === 'up' ? 'success' : 'danger'}>
                                                        {iface.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1 text-sm text-gray-900">
                                                        <TrendingDown className="w-3 h-3 text-blue-600" />
                                                        {formatBytes(iface.rxBytes)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1 text-sm text-gray-900">
                                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                                        {formatBytes(iface.txBytes)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                                                    {iface.rxErrors + iface.txErrors}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'clients' && (
                        <Card>
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Active DHCP Clients ({clients.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Hostname
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                IP Address
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                MAC Address
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Server
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {clients.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    No active clients
                                                </td>
                                            </tr>
                                        ) : (
                                            clients.map((client, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {client.hostname}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {client.address}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {client.macAddress}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {client.server}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant="success">{client.status}</Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'logs' && (
                        <Card>
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
                            </div>
                            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                                {logs.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No logs available</p>
                                ) : (
                                    logs.map((log, index) => (
                                        <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900">{log.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {log.topics} • {log.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}
                </>
            )}

            {device.type !== 'mikrotik' && (
                <Card className="p-8">
                    <div className="text-center">
                        <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Device Type Not Supported
                        </h3>
                        <p className="text-gray-600">
                            Advanced monitoring is currently only available for MikroTik devices.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
