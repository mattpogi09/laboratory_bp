import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LabTestQueueIndex({ auth }) {
    const [activeTab, setActiveTab] = useState('pending');

    // Stats
    const stats = [
        { 
            label: 'Pending Tests', 
            value: '1',
            icon: AlertCircle,
            bgColor: 'bg-red-500'
        },
        { 
            label: 'In Progress', 
            value: '1',
            icon: Clock,
            bgColor: 'bg-amber-500'
        },
        { 
            label: 'Completed Today', 
            value: '0',
            icon: CheckCircle,
            bgColor: 'bg-blue-500'
        }
    ];

    // Sample data
    const pendingTests = [
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-002',
            patientName: 'Maria Santos',
            testName: 'Urinalysis',
            status: 'Pending',
            statusColor: 'bg-red-500/10 text-red-600',
        }
    ];

    const inProgressTests = [
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-001',
            patientName: 'Juan Dela Cruz',
            testName: 'Complete Blood Count',
            status: 'Processing',
            statusColor: 'bg-amber-500/10 text-amber-600',
        }
    ];

    const completedTests = [];

    const fullHistory = [
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-001',
            patientName: 'Juan Dela Cruz',
            testName: 'Complete Blood Count',
            status: 'Processing',
            statusColor: 'bg-amber-500/10 text-amber-600',
        },
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-002',
            patientName: 'Maria Santos',
            testName: 'Urinalysis',
            status: 'Pending',
            statusColor: 'bg-red-500/10 text-red-600',
        }
    ];

    const getTabData = () => {
        switch(activeTab) {
            case 'pending':
                return pendingTests;
            case 'inProgress':
                return inProgressTests;
            case 'completed':
                return completedTests;
            case 'fullHistory':
                return fullHistory;
            default:
                return pendingTests;
        }
    };

    const getTabCount = (tab) => {
        switch(tab) {
            case 'pending':
                return pendingTests.length;
            case 'inProgress':
                return inProgressTests.length;
            case 'completed':
                return completedTests.length;
            case 'fullHistory':
                return fullHistory.length;
            default:
                return 0;
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Lab Test Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Lab Test Management</h1>
                <p className="text-gray-600">Manage test results and laboratory workflow</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center">
                            <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={cn(
                                "py-4 px-1 border-b-2 font-medium text-sm transition-colors relative",
                                activeTab === 'pending'
                                    ? "border-red-500 text-gray-900"
                                    : "border-transparent text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Pending Tests
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs",
                                    activeTab === 'pending' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                                )}>
                                    {getTabCount('pending')}
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('inProgress')}
                            className={cn(
                                "py-4 px-1 border-b-2 font-medium text-sm transition-colors relative",
                                activeTab === 'inProgress'
                                    ? "border-amber-500 text-gray-900"
                                    : "border-transparent text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                In Progress
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs",
                                    activeTab === 'inProgress' ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"
                                )}>
                                    {getTabCount('inProgress')}
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={cn(
                                "py-4 px-1 border-b-2 font-medium text-sm transition-colors relative",
                                activeTab === 'completed'
                                    ? "border-blue-500 text-gray-900"
                                    : "border-transparent text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Completed Today
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs",
                                    activeTab === 'completed' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                                )}>
                                    {getTabCount('completed')}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Patient Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Test Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {getTabData().length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No tests in this category
                                    </td>
                                </tr>
                            ) : (
                                getTabData().map((test, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{test.date}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{test.transactionId}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{test.patientName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{test.testName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", test.statusColor)}>
                                                {test.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={route('lab-test-queue.enter-results', test.transactionId)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors inline-block"
                                            >
                                                Enter Results
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
