'use client';

import { useState, useEffect } from 'react';
import { alertAPI, Alert, AlertStats } from '@/lib/api/alerts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Check,
    Eye,
    Trash2,
    AlertCircle,
    Info,
    Activity,
} from 'lucide-react';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [stats, setStats] = useState<AlertStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);

    useEffect(() => {
        fetchData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [severityFilter, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {};

            if (severityFilter !== 'all') params.severity = severityFilter;
            if (statusFilter === 'unread') params.isRead = false;
            if (statusFilter === 'resolved') params.isResolved = true;
            if (statusFilter === 'unresolved') params.isResolved = false;

            const [alertsData, statsData] = await Promise.all([
                alertAPI.getAll(params),
                alertAPI.getStats(),
            ]);

            setAlerts(alertsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (alertId: number) => {
        try {
            await alertAPI.markAsRead(alertId);
            fetchData();
        } catch (error) {
            console.error('Failed to mark alert as read:', error);
        }
    };

    const handleMarkSelectedAsRead = async () => {
        if (selectedAlerts.length === 0) return;
        try {
            await alertAPI.markMultipleAsRead(selectedAlerts);
            setSelectedAlerts([]);
            fetchData();
        } catch (error) {
            console.error('Failed to mark alerts as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await alertAPI.markAllAsRead();
            fetchData();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleResolve = async (alertId: number) => {
        try {
            await alertAPI.resolve(alertId);
            fetchData();
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        }
    };

    const handleDelete = async (alertId: number) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;
        try {
            await alertAPI.delete(alertId);
            fetchData();
        } catch (error) {
            console.error('Failed to delete alert:', error);
        }
    };

    const toggleSelectAlert = (alertId: number) => {
        setSelectedAlerts(prev =>
            prev.includes(alertId)
                ? prev.filter(id => id !== alertId)
                : [...prev, alertId]
        );
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'high':
                return <AlertTriangle className="w-5 h-5 text-orange-600" />;
            case 'medium':
                return <Info className="w-5 h-5 text-yellow-600" />;
            case 'low':
                return <Activity className="w-5 h-5 text-blue-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const variants: { [key: string]: 'error' | 'warning' | 'success' | 'default' } = {
            critical: 'error',
            high: 'warning',
            medium: 'warning',
            low: 'default',
            info: 'default',
        };
        return <Badge variant={variants[severity] || 'default'}>{severity.toUpperCase()}</Badge>;
    };

    const filteredAlerts = alerts.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alert.source?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('id-ID', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
                    <p className="text-gray-500 mt-1">Monitor and manage system alerts</p>
                </div>
                {stats && stats.unread > 0 && (
                    <Button onClick={handleMarkAllAsRead} variant="outline" className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Mark All as Read
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Alerts</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Bell className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Unread</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.unread}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Eye className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Critical</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.critical}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Resolved</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search alerts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Severity</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="info">Info</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="unread">Unread</option>
                            <option value="unresolved">Unresolved</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        {selectedAlerts.length > 0 && (
                            <Button onClick={handleMarkSelectedAsRead} className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Mark Selected ({selectedAlerts.length})
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Alerts List */}
            <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No alerts found</p>
                    </Card>
                ) : (
                    filteredAlerts.map((alert) => (
                        <Card
                            key={alert.id}
                            className={`p-4 transition-all ${!alert.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                                } ${alert.isResolved ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    checked={selectedAlerts.includes(alert.id)}
                                    onChange={() => toggleSelectAlert(alert.id)}
                                    className="mt-1"
                                />

                                <div className="flex-shrink-0 mt-1">
                                    {getSeverityIcon(alert.severity)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {alert.title}
                                                </h3>
                                                {getSeverityBadge(alert.severity)}
                                                {!alert.isRead && (
                                                    <Badge variant="default" className="text-xs">New</Badge>
                                                )}
                                                {alert.isResolved && (
                                                    <Badge variant="success" className="text-xs">Resolved</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {alert.source && (
                                                    <span className="flex items-center gap-1">
                                                        <Activity className="w-3 h-3" />
                                                        {alert.source}
                                                    </span>
                                                )}
                                                <span>{formatDate(alert.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {!alert.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(alert.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Mark as read"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {!alert.isResolved && (
                                                <button
                                                    onClick={() => handleResolve(alert.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Resolve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(alert.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
