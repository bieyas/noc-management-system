'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import customerAPI, { Customer, CustomerStats } from '@/lib/api/customerAPI';
import { formatDate } from '@/lib/utils/helpers';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Users, 
  UserCheck, 
  UserX, 
  Signal, 
  SignalZero,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [connectionFilter, setConnectionFilter] = useState<string>('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchCustomers();
        fetchStats();
    }, [statusFilter, connectionFilter, searchTerm]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerAPI.getCustomers({
                status: statusFilter || undefined,
                connectionStatus: connectionFilter || undefined,
                search: searchTerm || undefined,
            });
            setCustomers(response.data || []);
        } catch (error) {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await customerAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            await customerAPI.syncCustomers();
            await fetchCustomers();
            await fetchStats();
            toast.success('Customer status synced successfully');
        } catch (error) {
            toast.error('Failed to sync customer status');
        } finally {
            setSyncing(false);
        }
    };

    const handleViewDetails = async (customer: Customer) => {
        try {
            const response = await customerAPI.getCustomerById(customer.customerId);
            setSelectedCustomer(response.data);
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Failed to load customer details');
        }
    };

    const getConnectionBadge = (status?: string) => {
        if (status === 'online') {
            return (
                <Badge variant="success" className="flex items-center gap-1">
                    <Signal className="w-3 h-3" />
                    Online
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                <SignalZero className="w-3 h-3" />
                Offline
            </Badge>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                        <p className="text-gray-600 mt-1">Manage ISP customers and monitor connection status</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline"
                            onClick={handleSync}
                            disabled={syncing}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync Status'}
                        </Button>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Customer
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <div className="flex items-center">
                                <Users className="h-6 w-6 text-gray-400 mr-3" />
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{stats.total}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <div className="flex items-center">
                                <UserCheck className="h-6 w-6 text-green-400 mr-3" />
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Active</dt>
                                    <dd className="text-2xl font-semibold text-green-600">{stats.active}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <div className="flex items-center">
                                <Signal className="h-6 w-6 text-green-500 mr-3" />
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Online</dt>
                                    <dd className="text-2xl font-semibold text-green-600">{stats.online}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <div className="flex items-center">
                                <SignalZero className="h-6 w-6 text-gray-400 mr-3" />
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Offline</dt>
                                    <dd className="text-2xl font-semibold text-gray-600">{stats.offline}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <div className="flex items-center">
                                <UserX className="h-6 w-6 text-yellow-400 mr-3" />
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Suspended</dt>
                                    <dd className="text-2xl font-semibold text-yellow-600">{stats.suspended}</dd>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>

                        <select
                            value={connectionFilter}
                            onChange={(e) => setConnectionFilter(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        >
                            <option value="">All Connections</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>

                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Customer Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="p-12">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Connection
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Online
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No customers found
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                                                    <div className="text-sm text-gray-500">{customer.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{customer.username || '-'}</div>
                                                <div className="text-sm text-gray-500">{customer.ipAddress || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{customer.planName || '-'}</div>
                                                <div className="text-sm text-gray-500">{customer.bandwidth || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={customer.status === 'active' ? 'success' : 'warning'}>
                                                    {customer.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getConnectionBadge(customer.connectionStatus)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {customer.lastOnline ? formatDate(customer.lastOnline) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(customer)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Detail Modal */}
                {showDetailModal && selectedCustomer && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailModal(false)}></div>
                            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
                                <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Personal Info</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-gray-500">Name:</span> {selectedCustomer.fullName}</div>
                                            <div><span className="text-gray-500">Email:</span> {selectedCustomer.email}</div>
                                            <div><span className="text-gray-500">Phone:</span> {selectedCustomer.phone}</div>
                                            <div><span className="text-gray-500">ID:</span> {selectedCustomer.customerId}</div>
                                        </div>
                                    </div>
                                    
                                    {selectedCustomer.realTimeData && (
                                        <div>
                                            <h3 className="font-semibold text-gray-700 mb-2">Real-time Connection</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-gray-500">Type:</span> {selectedCustomer.realTimeData.connectionType}</div>
                                                <div><span className="text-gray-500">IP:</span> {selectedCustomer.realTimeData.ipAddress}</div>
                                                <div><span className="text-gray-500">MAC:</span> {selectedCustomer.realTimeData.macAddress}</div>
                                                <div><span className="text-gray-500">Uptime:</span> {selectedCustomer.realTimeData.uptime}</div>
                                                <div><span className="text-gray-500">RX:</span> {selectedCustomer.realTimeData.rxBytes}</div>
                                                <div><span className="text-gray-500">TX:</span> {selectedCustomer.realTimeData.txBytes}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
