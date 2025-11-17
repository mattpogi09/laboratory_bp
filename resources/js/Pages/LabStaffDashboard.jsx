import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { TestTube, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LabStaffDashboard({ auth }) {
    const stats = [
        { 
            title: 'Pending Tests', 
            value: '1', 
            icon: AlertCircle,
            color: 'bg-red-500'
        },
        { 
            title: 'In Progress', 
            value: '1', 
            icon: Clock,
            color: 'bg-amber-500'
        },
        { 
            title: 'Completed Today', 
            value: '0', 
            icon: CheckCircle,
            color: 'bg-blue-500'
        },
        { 
            title: 'Total Queue', 
            value: '2', 
            icon: TestTube,
            color: 'bg-purple-500'
        }
    ];

    const activeQueue = [
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-001',
            patientName: 'Juan Dela Cruz',
            testName: 'Complete Blood Count',
            status: 'Processing',
            statusColor: 'bg-amber-500/10 text-amber-600',
            action: 'Enter Results'
        },
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-002',
            patientName: 'Maria Santos',
            testName: 'Urinalysis',
            status: 'Pending',
            statusColor: 'bg-red-500/10 text-red-600',
            action: 'Enter Results'
        }
    ];

    const fullHistory = [
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-001',
            patientName: 'Juan Dela Cruz',
            testName: 'Complete Blood Count',
            status: 'Processing',
            statusColor: 'bg-amber-500/10 text-amber-600',
            action: 'Enter Results'
        },
        {
            date: 'Nov 6, 2025',
            transactionId: 'TXN-002',
            patientName: 'Maria Santos',
            testName: 'Urinalysis',
            status: 'Pending',
            statusColor: 'bg-red-500/10 text-red-600',
            action: 'Enter Results'
        }
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Lab Staff Panel" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Lab Test Management</h1>
                <p className="text-gray-600">Manage test results and laboratory workflow</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center">
                            <div className={cn("p-3 rounded-lg", stat.color)}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
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
                        <button className="py-4 px-1 border-b-2 border-blue-500 text-black font-medium text-sm">
                            Active Queue ({activeQueue.length})
                        </button>
                        <button className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-700 font-medium text-sm">
                            Full History ({fullHistory.length})
                        </button>
                    </div>
                </div>

                {/* Active Queue Table */}
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
                            {activeQueue.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-100 transition-colors">
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
                                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                            {test.action}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
