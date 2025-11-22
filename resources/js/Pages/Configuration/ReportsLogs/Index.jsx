import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Calendar, DollarSign, Package, Shield, FileText, Download } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function ReportsLogsIndex({
    auth,
    filters = {},
    financial = {},
    labReport = {},
    inventoryLogs = [],
    auditLogs = [],
}) {
    const [activeTab, setActiveTab] = useState('financial');
    const [dateFrom, setDateFrom] = useState(filters.from || '');
    const [dateTo, setDateTo] = useState(filters.to || '');

    const totals = financial.totals || { revenue: 0, discounts: 0, transactions: 0 };
    const financialRows = financial.rows || [];
    const labStats = labReport.stats || { total: 0, pending: 0, processing: 0, completed: 0, released: 0 };
    const labRows = labReport.rows || [];

    const submitFilters = () => {
        router.get(
            route('reports-logs'),
            { from: dateFrom, to: dateTo },
            { preserveState: true, replace: true }
        );
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Reports & Logs" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Reports & Logs</h1>
                <p className="text-gray-600">Financial reports, inventory logs, and security audit trails</p>
            </div>

            <div className="mb-6 flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                <Calendar className="h-5 w-5 text-gray-400" />
                <DateField label="From" value={dateFrom} onChange={setDateFrom} />
                <DateField label="To" value={dateTo} onChange={setDateTo} />
                <Button onClick={submitFilters} className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                    Generate Report
                </Button>
            </div>

            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === 'financial' && (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                        <StatCard label="Total Revenue" value={`₱${Number(totals.revenue).toLocaleString()}`} accent="text-emerald-600" />
                        <StatCard label="Total Discounts" value={`₱${Number(totals.discounts).toLocaleString()}`} accent="text-yellow-600" />
                        <StatCard label="Transactions" value={totals.transactions} />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tests</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gross</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Discount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Net Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {financialRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                                No transactions for this date range.
                                            </td>
                                        </tr>
                                    ) : (
                                        financialRows.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.patient}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{row.tests}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    ₱{Number(row.amount).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-red-600">
                                                    {row.discount_amount > 0
                                                        ? `-₱${Number(row.discount_amount).toLocaleString()}`
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                                                    ₱{Number(row.net_amount).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-blue-600 capitalize">
                                                    {row.payment_method}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'inventory' && (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transaction Code</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Performed By</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {inventoryLogs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.date}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.transactionCode || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.item}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                log.type === 'IN' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.performedBy}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{log.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Timestamp</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {auditLogs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.timestamp}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.user}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-sm font-medium ${severityColor(log.severity)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'lab' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard label="Total Tests" value={labStats.total} />
                        <StatCard label="Pending" value={labStats.pending} accent="text-red-600" />
                        <StatCard label="Processing" value={labStats.processing} accent="text-yellow-600" />
                        <StatCard label="Completed" value={labStats.completed} accent="text-blue-600" />
                        <StatCard label="Released" value={labStats.released} accent="text-green-600" />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Lab Report</p>
                                <p className="text-xs text-gray-500">Live feed from the laboratory queue</p>
                            </div>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-white">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transaction</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Test</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Performed By</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {labRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                                No lab activity in this range.
                                            </td>
                                        </tr>
                                    ) : (
                                        labRows.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.transaction_number}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.patient}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.test_name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.performed_by}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(row.status)}`}>
                                                        {row.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function TabBar({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'financial', label: 'Financial Report', icon: DollarSign },
        { id: 'inventory', label: 'Inventory Log', icon: Package },
        { id: 'audit', label: 'Audit Log', icon: Shield },
        { id: 'lab', label: 'Lab Report', icon: FileText },
    ];

    return (
        <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                            activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, accent = 'text-gray-900' }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
        </div>
    );
}

function DateField({ label, value, onChange }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{label}:</span>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-400 rounded text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
        </div>
    );
}

function severityColor(severity) {
    switch (severity) {
        case 'critical':
            return 'text-red-500';
        case 'warning':
            return 'text-yellow-500';
        case 'info':
        default:
            return 'text-blue-500';
    }
}

function statusBadge(status) {
    switch (status) {
        case 'pending':
            return 'bg-red-500/10 text-red-700';
        case 'processing':
            return 'bg-yellow-500/10 text-yellow-700';
        case 'completed':
            return 'bg-blue-500/10 text-blue-700';
        case 'released':
            return 'bg-green-500/10 text-green-700';
        default:
            return 'bg-gray-500/10 text-gray-700';
    }
}

