'use client';

import { useState, useEffect } from 'react';
import { paymentAPI, customerAPI } from '@/lib/api/client';
import { Payment, PaymentStats } from '@/lib/api/payments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import {
    DollarSign,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Download,
    Plus,
    FileText
} from 'lucide-react';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const [newPayment, setNewPayment] = useState({
        customerId: 0,
        amount: 0,
        paymentMethod: 'transfer',
        description: '',
    });

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [paymentsData, statsData, customersData] = await Promise.all([
                paymentAPI.getAll(statusFilter !== 'all' ? { status: statusFilter } : undefined),
                paymentAPI.getStats(),
                customerAPI.getAll(),
            ]);

            // Map customer names to payments
            const paymentsWithCustomers = paymentsData.map((payment: Payment) => {
                const customer = customersData.find((c: any) => c.id === payment.customerId);
                return {
                    ...payment,
                    customerName: customer?.name || 'Unknown Customer',
                };
            });

            setPayments(paymentsWithCustomers);
            setStats(statsData);
            setCustomers(customersData);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await paymentAPI.create(newPayment);
            setShowAddModal(false);
            setNewPayment({
                customerId: 0,
                amount: 0,
                paymentMethod: 'transfer',
                description: '',
            });
            fetchData();
        } catch (error) {
            console.error('Failed to create payment:', error);
            alert('Failed to create payment');
        }
    };

    const handleGenerateInvoice = async (paymentId: number) => {
        try {
            await paymentAPI.generateInvoice(paymentId);
            alert('Invoice generated successfully');
        } catch (error) {
            console.error('Failed to generate invoice:', error);
            alert('Failed to generate invoice');
        }
    };

    const handleUpdateStatus = async (paymentId: number, newStatus: string) => {
        try {
            await paymentAPI.updateStatus(paymentId, newStatus);
            fetchData();
        } catch (error) {
            console.error('Failed to update payment status:', error);
            alert('Failed to update payment status');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
            completed: 'success',
            pending: 'warning',
            failed: 'error',
            cancelled: 'default',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: string } = {
            transfer: 'Bank Transfer',
            cash: 'Cash',
            credit_card: 'Credit Card',
            e_wallet: 'E-Wallet',
        };
        return labels[method] || method;
    };

    const filteredPayments = payments.filter(payment =>
        (payment.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (payment.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (payment.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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
                    <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                    <p className="text-gray-500 mt-1">Manage customer payments and invoices</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Payment
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.totalRevenue)}
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
                                <p className="text-sm text-gray-500">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.monthlyRevenue)}
                                </p>
                                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {stats.revenueGrowth.toFixed(1)}% growth
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.completedPayments}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.pendingPayments}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
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
                                placeholder="Search by customer, invoice, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Payments Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {payment.invoiceNumber || `INV-${payment.id}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{payment.customerName}</div>
                                            {payment.description && (
                                                <div className="text-xs text-gray-500">{payment.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getPaymentMethodLabel(payment.paymentMethod)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(payment.paymentDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                {payment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(payment.id, 'completed')}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Mark as completed"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(payment.id, 'failed')}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Mark as failed"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleGenerateInvoice(payment.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Generate invoice"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Payment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Payment</h2>
                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer
                                </label>
                                <select
                                    value={newPayment.customerId}
                                    onChange={(e) => setNewPayment({ ...newPayment, customerId: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value={0}>Select customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (IDR)
                                </label>
                                <Input
                                    type="number"
                                    value={newPayment.amount || ''}
                                    onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                                    required
                                    min="0"
                                    step="1000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    value={newPayment.paymentMethod}
                                    onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="transfer">Bank Transfer</option>
                                    <option value="cash">Cash</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="e_wallet">E-Wallet</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <Input
                                    type="text"
                                    value={newPayment.description}
                                    onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                                    placeholder="Payment description..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    Create Payment
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
