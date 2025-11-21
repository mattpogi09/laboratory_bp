import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhilippinePeso , Users, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard({ 
    auth, 
    stats, 
    period, 
    pendingTasks, 
    lowStockItems, 
    revenueChartData, 
    testStatusData,
    dailyRevenue 
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || 'day');

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        router.get(route('dashboard'), { period: newPeriod }, { preserveState: true });
    };

    const statsCards = [
        { 
            title: `Total Revenue ${getPeriodLabel(selectedPeriod)}`, 
            value: `₱${stats.totalRevenue}`, 
            icon: PhilippinePeso,
            color: 'bg-emerald-500'
        },
        { 
            title: 'Patients Today', 
            value: stats.patientsToday, 
            icon: Users,
            color: 'bg-blue-500'
        },
        { 
            title: 'Low Stock Items', 
            value: stats.lowStockItems, 
            icon: AlertTriangle,
            color: 'bg-amber-500'
        },
        { 
            title: 'Pending Tests', 
            value: stats.pendingTests, 
            icon: Clock,
            color: 'bg-purple-500'
        }
    ];

    // Revenue Line Chart Data
    const revenueLineData = {
        labels: revenueChartData.map(item => item.label),
        datasets: [
            {
                label: 'Revenue',
                data: revenueChartData.map(item => item.value),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Daily Revenue Bar Chart
    const dailyRevenueData = {
        labels: dailyRevenue.map(item => item.date),
        datasets: [
            {
                label: 'Daily Revenue',
                data: dailyRevenue.map(item => item.revenue),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    };

    // Test Status Doughnut Chart
    const testStatusChartData = {
        labels: ['Pending', 'Processing', 'Completed', 'Released'],
        datasets: [
            {
                data: [testStatusData.pending, testStatusData.processing, testStatusData.completed, testStatusData.released],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',  // red
                    'rgba(234, 179, 8, 0.8)',   // yellow
                    'rgba(59, 130, 246, 0.8)',  // blue
                    'rgba(34, 197, 94, 0.8)',   // green
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(234, 179, 8)',
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    function getPeriodLabel(period) {
        const labels = {
            day: 'Today',
            week: 'This Week',
            month: 'This Month',
            year: 'This Year',
        };
        return labels[period] || 'Today';
    }

    return (
        <DashboardLayout auth={auth}>
            <Head title="Dashboard" />

            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
                </div>
                
                {/* Period Filter */}
                <div className="flex gap-2">
                    {['day', 'week', 'month', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePeriodChange(p)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                selectedPeriod === p
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            )}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenue Trend - {getPeriodLabel(selectedPeriod)}
                    </h2>
                    <div style={{ height: '300px' }}>
                        <Line data={revenueLineData} options={chartOptions} />
                    </div>
                </div>

                {/* Test Status Distribution */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Status Distribution</h2>
                    <div style={{ height: '300px' }}>
                        <Doughnut data={testStatusChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Daily Revenue Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days Revenue</h2>
                <div style={{ height: '300px' }}>
                    <Bar data={dailyRevenueData} options={chartOptions} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Items */}
                {lowStockItems && lowStockItems.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Items</h2>
                        <div className="space-y-4">
                            {lowStockItems.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.name}</span>
                                        <span className="text-gray-900">{item.current}/{item.total}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div 
                                            className="h-2 bg-orange-500 rounded-full" 
                                            style={{ width: `${(item.current/item.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Tasks */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
                    <div className="space-y-4">
                        {pendingTasks && pendingTasks.length > 0 ? (
                            pendingTasks.map((task, index) => (
                                <div key={index} className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{task.patient}</p>
                                        <p className="text-sm text-gray-600">{task.test}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{task.time}</p>
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
                                            task.status === 'pending' ? 'bg-red-100 text-red-700' : 
                                            task.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                            task.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                            task.status === 'released' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                        )}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No pending tasks</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
