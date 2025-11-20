import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LabTestQueueIndex({ auth, stats = {}, tests = {} }) {
    const [activeTab, setActiveTab] = useState('pending');

    const tabConfig = {
        pending: {
            label: 'Pending Tests',
            icon: AlertCircle,
            badgeClass: 'bg-red-100 text-red-600',
            headerClass: 'border-red-500',
            statusClass: 'bg-red-500/10 text-red-600',
            dataKey: 'pending',
        },
        in_progress: {
            label: 'In Progress',
            icon: Clock,
            badgeClass: 'bg-amber-100 text-amber-600',
            headerClass: 'border-amber-500',
            statusClass: 'bg-amber-500/10 text-amber-600',
            dataKey: 'in_progress',
        },
        completed: {
            label: 'Completed',
            icon: CheckCircle,
            badgeClass: 'bg-blue-100 text-blue-600',
            headerClass: 'border-blue-500',
            statusClass: 'bg-blue-500/10 text-blue-600',
            dataKey: 'completed',
        },
        full_history: {
            label: 'Full History',
            icon: CheckCircle,
            badgeClass: 'bg-gray-100 text-gray-600',
            headerClass: 'border-gray-300',
            statusClass: 'bg-gray-100 text-gray-600',
            dataKey: 'full_history',
        },
    };

    const dataForTab = tests[tabConfig[activeTab]?.dataKey] || [];

    const counts = {
        pending: tests.pending?.length || 0,
        in_progress: tests.in_progress?.length || 0,
        completed: tests.completed?.length || 0,
        full_history: tests.full_history?.length || 0,
    };

    const statusStyles = {
        pending: 'bg-red-500/10 text-red-600',
        in_progress: 'bg-amber-500/10 text-amber-600',
        completed: 'bg-blue-500/10 text-blue-600',
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Lab Test Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Lab Test Management</h1>
                <p className="text-gray-600">Live queue synced from cashier transactions</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard label="Pending Tests" value={stats.pending || counts.pending} icon={AlertCircle} color="bg-red-500" />
                <StatCard label="In Progress" value={stats.in_progress || counts.in_progress} icon={Clock} color="bg-amber-500" />
                <StatCard label="Completed Today" value={stats.completed_today || counts.completed} icon={CheckCircle} color="bg-blue-500" />
            </div>

            <div className="rounded-xl bg-white shadow">
                <div className="border-b border-gray-200">
                    <div className="flex flex-wrap">
                        {Object.entries(tabConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={cn(
                                    'px-6 py-4 text-sm font-medium transition-colors',
                                    activeTab === key
                                        ? `${config.headerClass} text-gray-900 border-b-2`
                                        : 'border-b-2 border-transparent text-gray-400 hover:text-gray-700'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <config.icon className="h-4 w-4" />
                                    {config.label}
                                    <span className={cn('rounded-full px-2 py-0.5 text-xs', config.badgeClass)}>
                                        {counts[key] || 0}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Queue #</th>
                                <th className="px-6 py-3">Transaction</th>
                                <th className="px-6 py-3">Patient</th>
                                <th className="px-6 py-3">Test</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {dataForTab.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No tests found in this queue.
                                    </td>
                                </tr>
                            ) : (
                                dataForTab.map((test) => (
                                    <tr key={test.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-semibold text-gray-900">
                                            #{test.queue_number || '—'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-gray-900">{test.transaction_number}</div>
                                            <div className="text-xs text-gray-500">{test.created_at}</div>
                                        </td>
                                        <td className="px-6 py-3">{test.patient_name || '—'}</td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-gray-900">{test.test_name}</div>
                                            <div className="text-xs text-gray-500">{test.category}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-1 text-xs font-semibold capitalize',
                                                    statusStyles[test.status] || 'bg-gray-100 text-gray-600'
                                                )}
                                            >
                                                {test.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Link
                                                href={route('lab-test-queue.enter-results', test.id)}
                                                className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
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

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center">
                <div className={cn('rounded-lg p-3 text-white', color)}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
