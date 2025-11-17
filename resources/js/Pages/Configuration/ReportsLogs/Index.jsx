import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Calendar, DollarSign, Package, Shield, FileText, Download } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function ReportsLogsIndex() {
    const [activeTab, setActiveTab] = useState('financial');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const financialData = [
        {
            date: '2024-10-29',
            patient: 'Juan Dela Cruz',
            service: 'Complete Blood Count',
            amount: 250.00,
            discount: -50.00,
            netAmount: 200.00,
            payment: 'Cash'
        },
        {
            date: '2024-10-28',
            patient: 'Pedro Garcia',
            service: 'Complete Blood Count',
            amount: 250.00,
            discount: -50.00,
            netAmount: 200.00,
            payment: 'Cash'
        },
        {
            date: '2024-10-27',
            patient: 'Jose Lopez',
            service: 'Complete Blood Count',
            amount: 250.00,
            discount: -50.00,
            netAmount: 200.00,
            payment: 'Cash'
        },
        {
            date: '2024-10-26',
            patient: 'Sofia Ramos',
            service: 'Complete Blood Count',
            amount: 250.00,
            discount: -50.00,
            netAmount: 200.00,
            payment: 'Cash'
        }
    ];

    const inventoryLogs = [
        {
            date: '2024-10-28',
            item: 'Blood Collection Tubes',
            type: 'OUT',
            quantity: 30,
            reason: 'CBC tests',
            performedBy: 'KuyaDats (Staff)'
        },
        {
            date: '2024-10-28',
            item: 'Test Strips (Glucose)',
            type: 'OUT',
            quantity: 15,
            reason: 'Blood sugar tests',
            performedBy: 'Al (Staff)'
        },
        {
            date: '2024-10-27',
            item: 'Alcohol Swabs',
            type: 'IN',
            quantity: 1000,
            reason: 'Monthly Purchase',
            performedBy: 'Admin'
        },
        {
            date: '2024-10-26',
            item: 'Gloves (Medium)',
            type: 'OUT',
            quantity: 50,
            reason: 'Used for patient care',
            performedBy: 'KuyaDats (Staff)'
        },
        {
            date: '2024-10-25',
            item: 'Blood Collection Tubes',
            type: 'IN',
            quantity: 500,
            reason: 'Weekly Restock',
            performedBy: 'Admin'
        },
        {
            date: '2024-10-24',
            item: 'Syringes (5ml)',
            type: 'OUT',
            quantity: 25,
            reason: 'Blood collection',
            performedBy: 'Al (Staff)'
        },
        {
            date: '2024-10-23',
            item: 'Cotton Balls',
            type: 'IN',
            quantity: 800,
            reason: 'Bulk Purchase',
            performedBy: 'Admin'
        }
    ];

    const auditLogs = [
        {
            timestamp: '2024-10-29 14:23:45',
            user: 'Admin',
            action: 'User Created',
            details: 'Created new user: Jun',
            severity: 'info'
        },
        {
            timestamp: '2024-10-29 10:15:30',
            user: 'Jun (Cashier)',
            action: 'User Login',
            details: 'Successful login from IP: 192.168.1.45',
            severity: 'info'
        },
        {
            timestamp: '2024-10-28 16:45:12',
            user: 'Admin',
            action: 'Service Price Updated',
            details: 'Updated price for Complete Blood Count from ₱200 to ₱250',
            severity: 'warning'
        },
        {
            timestamp: '2024-10-28 11:22:08',
            user: 'KuyaDats (Staff)',
            action: 'Inventory Adjusted',
            details: 'Adjusted stock for Blood Collection Tubes: -30 units',
            severity: 'info'
        },
        {
            timestamp: '2024-10-27 09:30:55',
            user: 'Admin',
            action: 'Discount Created',
            details: 'Created new discount: Employee Discount (15%)',
            severity: 'info'
        },
        {
            timestamp: '2024-10-26 15:10:33',
            user: 'Unknown',
            action: 'Failed Login Attempt',
            details: 'Failed login for admin@bpdiagnostic.com from IP: 203.184.45.12',
            severity: 'critical'
        }
    ];

    const labReports = [
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-001',
            patient: 'Juan Dela Cruz',
            testName: 'Complete Blood Count',
            performedBy: 'KuyaDats (Lab)',
            status: 'Released'
        },
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-002',
            patient: 'Maria Santos',
            testName: 'Urinalysis',
            performedBy: 'Al (Lab)',
            status: 'Released'
        },
        {
            date: 'Nov 5, 2025',
            transactionId: 'TXN-003',
            patient: 'Juan Dela Cruz',
            testName: 'Cholesterol',
            performedBy: 'KuyaDats (Lab)',
            status: 'Completed'
        },
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-004',
            patient: 'Jose Rizal',
            testName: 'Blood Typing',
            performedBy: 'Al (Lab)',
            status: 'Processing'
        },
        {
            date: 'Nov 4, 2025',
            transactionId: 'TXN-005',
            patient: 'Ana Reyes',
            testName: 'Lipid Profile',
            performedBy: 'KuyaDats (Lab)',
            status: 'Released'
        }
    ];

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'text-red-400';
            case 'warning':
                return 'text-yellow-400';
            case 'info':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Released':
                return 'bg-emerald-500/10 text-emerald-400';
            case 'Completed':
                return 'bg-blue-500/10 text-blue-400';
            case 'Processing':
                return 'bg-yellow-500/10 text-yellow-400';
            default:
                return 'bg-gray-500/10 text-gray-400';
        }
    };

    const totals = {
        revenue: 3780.00,
        discounts: 420.00,
        transactions: 8
    };

    return (
        <DashboardLayout>
            <Head title="Reports & Logs" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Reports & Logs</h1>
                <p className="text-gray-600">Financial reports, inventory logs, and security audit trails</p>
            </div>

            {/* Date Filter */}
            <div className="mb-6 flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">From:</span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-gray-400 rounded text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">To:</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-gray-400 rounded text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                    Generate Report
                </Button>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                            activeTab === 'financial'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <DollarSign className="h-4 w-4" />
                        Financial Report
                        {activeTab === 'financial' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                            activeTab === 'inventory'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Package className="h-4 w-4" />
                        Inventory Log
                        {activeTab === 'inventory' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                            activeTab === 'audit'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Shield className="h-4 w-4" />
                        Audit Log
                        {activeTab === 'audit' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('lab')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                            activeTab === 'lab'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        Lab Report
                        {activeTab === 'lab' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'financial' && (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-2xl font-semibold text-emerald-600">₱{totals.revenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Total Discounts</p>
                            <p className="text-2xl font-semibold text-yellow-600">₱{totals.discounts.toFixed(2)}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Transactions</p>
                            <p className="text-2xl font-semibold text-gray-900">{totals.transactions}</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Service</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Discount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Net Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {financialData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.patient}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.service}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">₱{item.amount.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-yellow-600">-₱{Math.abs(item.discount).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-emerald-600">₱{item.netAmount.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-blue-600">{item.payment}</td>
                                        </tr>
                                    ))}
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
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.item}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                log.type === 'IN' 
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-red-500/10 text-red-600'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.performedBy}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{log.reason}</td>
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
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Severity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {auditLogs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.timestamp}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.user}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.action}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{log.details}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-sm font-medium ${getSeverityColor(log.severity)}`}>
                                                {log.severity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'lab' && (
                <>
                    <div className="mb-6 flex justify-between items-center">
                        <div className="grid grid-cols-4 gap-4 flex-1">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Total Tests</p>
                                <p className="text-2xl font-semibold text-gray-900">7</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Released</p>
                                <p className="text-2xl font-semibold text-emerald-600">4</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                                <p className="text-2xl font-semibold text-yellow-600">2</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                <p className="text-2xl font-semibold text-blue-600">1</p>
                            </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white ml-4">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transaction ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Test Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Performed By</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {labReports.map((report, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900">{report.date}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{report.transactionId}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{report.patient}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{report.testName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{report.performedBy}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors">
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
