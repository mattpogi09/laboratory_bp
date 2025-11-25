import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhilippinePeso , Users, AlertTriangle, Clock, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import LineChartComponent from '@/Components/Charts/LineChartComponent';
import BarChartComponent from '@/Components/Charts/BarChartComponent';
import DoughnutChartComponent from '@/Components/Charts/DoughnutChartComponent';

export default function Dashboard({ 
    auth, 
    stats, 
    period, 
    pendingTasks, 
    lowStockItems, 
    revenueChartData, 
    testStatusData,
    dailyRevenue,
    topTests = [],
    alerts = []
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || 'day');

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        router.get(route('dashboard'), { period: newPeriod }, { preserveState: true });
    };

    const getPeriodLabel = (period) => {
        const labels = {
            day: 'Today',
            week: 'This Week',
            month: 'This Month',
            year: 'This Year',
        };
        return labels[period] || 'Today';
    };

    const statsCards = [
        { 
            title: `Total Revenue ${getPeriodLabel(selectedPeriod)}`, 
            value: `₱${stats.totalRevenue}`, 
            trend: stats.revenueTrend,
            icon: PhilippinePeso,
            color: 'bg-emerald-500',
            route: 'reports-logs'
        },
        { 
            title: `Patients ${getPeriodLabel(selectedPeriod)}`, 
            value: stats.patientsCount, 
            trend: stats.patientsTrend,
            icon: Users,
            color: 'bg-blue-500',
            route: 'patients.index'
        },
        { 
            title: 'Low Stock Items', 
            value: stats.lowStockItems, 
            icon: AlertTriangle,
            color: 'bg-amber-500',
            route: 'inventory'
        },
        { 
            title: 'Pending Tests', 
            value: stats.pendingTests, 
            icon: Clock,
            color: 'bg-purple-500',
            route: 'reports-logs'
        }
    ];

    // Prepare data for Evil Charts (Recharts format)
    const revenueLineData = revenueChartData.map(item => ({
        label: item.label,
        value: item.value
    }));

    const dailyRevenueBarData = dailyRevenue.map(item => ({
        label: item.date,
        value: item.revenue
    }));

    const testStatusDoughnutData = [
        { name: 'Pending', value: testStatusData.pending },
        { name: 'Processing', value: testStatusData.processing },
        { name: 'Completed', value: testStatusData.completed },
        { name: 'Released', value: testStatusData.released },
    ];

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

            {/* Alerts Banner */}
            {alerts && alerts.length > 0 && (
                <div className="mb-6 space-y-3">
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={cn(
                                "rounded-lg p-4 flex items-center justify-between",
                                alert.type === 'critical' ? 'bg-red-50 border border-red-200' :
                                alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                                'bg-blue-50 border border-blue-200'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className={cn(
                                    "h-5 w-5",
                                    alert.type === 'critical' ? 'text-red-600' :
                                    alert.type === 'warning' ? 'text-amber-600' :
                                    'text-blue-600'
                                )} />
                                <span className={cn(
                                    "text-sm font-medium",
                                    alert.type === 'critical' ? 'text-red-900' :
                                    alert.type === 'warning' ? 'text-amber-900' :
                                    'text-blue-900'
                                )}>{alert.message}</span>
                            </div>
                            <Link
                                href={route(alert.route)}
                                className={cn(
                                    "text-sm font-medium hover:underline flex items-center gap-1",
                                    alert.type === 'critical' ? 'text-red-700' :
                                    alert.type === 'warning' ? 'text-amber-700' :
                                    'text-blue-700'
                                )}
                            >
                                {alert.action}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                    <Link
                        key={index}
                        href={route(stat.route)}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                                <div className={cn("p-3 rounded-lg transition-transform duration-300 group-hover:scale-110", stat.color)}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600 whitespace-nowrap">{stat.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                        {stat.trend !== undefined && (
                                            <span className={cn(
                                                "text-xs font-medium flex items-center gap-0.5",
                                                stat.trend > 0 ? 'text-green-600' : 
                                                stat.trend < 0 ? 'text-red-600' : 'text-gray-500'
                                            )}>
                                                {stat.trend > 0 ? (
                                                    <><TrendingUp className="h-3 w-3" /> {stat.trend}%</>
                                                ) : stat.trend < 0 ? (
                                                    <><TrendingDown className="h-3 w-3" /> {Math.abs(stat.trend)}%</>
                                                ) : (
                                                    '0%'
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Top Performing Tests */}
            {topTests && topTests.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Tests</h2>
                    <div className="space-y-3">
                        {topTests.map((test, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-50 text-blue-600'
                                    )}>
                                        #{index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-900">{test.name}</p>
                                        <p className="text-xs text-gray-500">{test.count} tests ordered</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-emerald-600">₱{test.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenue Trend - {getPeriodLabel(selectedPeriod)}
                    </h2>
                    <div style={{ height: '300px' }}>
                        <LineChartComponent 
                            data={revenueLineData} 
                            dataKey="value" 
                            nameKey="label" 
                            color="#10b981" 
                        />
                    </div>
                </div>

                {/* Test Status Distribution */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Status Distribution</h2>
                    <div style={{ height: '300px' }}>
                        <DoughnutChartComponent data={testStatusDoughnutData} />
                    </div>
                </div>
            </div>

            {/* Daily Revenue Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days Revenue</h2>
                <div style={{ height: '300px' }}>
                    <BarChartComponent 
                        data={dailyRevenueBarData} 
                        dataKey="value" 
                        nameKey="label" 
                        color="#3b82f6" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Items */}
                {lowStockItems && lowStockItems.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Low Stock Items</h2>
                            <Link
                                href={route('inventory')}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {lowStockItems.map((item, index) => {
                                const percentage = item.minimum_stock > 0 
                                    ? Math.round((item.current_stock / item.minimum_stock) * 100) 
                                    : 0;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="font-medium text-gray-900 block">{item.name}</span>
                                                <span className="text-sm text-gray-600">Current Stock: {item.current_stock} {item.unit}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {percentage}%
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-2.5 rounded-full transition-all duration-300",
                                                    percentage <= 20 ? "bg-red-500" :
                                                    percentage <= 40 ? "bg-orange-500" :
                                                    percentage <= 60 ? "bg-yellow-500" :
                                                    "bg-emerald-500"
                                                )}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pending Tasks */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Pending Lab Tasks</h2>
                        <Link
                            href={route('reports-logs')}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
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
