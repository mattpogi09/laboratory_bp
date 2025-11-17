import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { DollarSign, Users, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    const stats = [
        { 
            title: 'Total Revenue Today', 
            value: '₱12,450.00', 
            icon: DollarSign,
            color: 'bg-emerald-500'
        },
        { 
            title: 'Patients Today', 
            value: '24', 
            icon: Users,
            color: 'bg-blue-500'
        },
        { 
            title: 'Low Stock Items', 
            value: '3', 
            icon: AlertTriangle,
            color: 'bg-amber-500'
        },
        { 
            title: 'Pending Tests', 
            value: '6', 
            icon: Clock,
            color: 'bg-purple-500'
        }
    ];

    const lowStockItems = [
        { name: 'Blood Collection Tubes', current: 45, total: 100 },
        { name: 'Gloves (Disposable)', current: 147, total: 200 },
        { name: 'Alcohol Swabs', current: 120, total: 300 },
        { name: 'Test Strips (Glucose)', current: 23, total: 50 }
    ];

    const pendingTasks = [
        { 
            patient: 'Juan Dela Cruz',
            test: 'Complete Blood Count',
            time: '7:00 AM'
        },
        {
            patient: 'Maria Santos',
            test: 'Urinalysis',
            time: '8:30 AM'
        },
        {
            patient: 'Pedro Garcia',
            test: 'Liver Profile',
            time: '9:00 AM'
        },
        {
            patient: 'Ana Reyes',
            test: 'Chest X-Ray',
            time: '10:15 AM'
        }
    ];

    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Items */}
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

                {/* Pending Tasks */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
                    <div className="divide-y divide-gray-200">
                        {pendingTasks.map((task, index) => (
                            <div key={index} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{task.patient}</p>
                                    <p className="text-sm text-gray-600">{task.test}</p>
                                </div>
                                <span className="text-sm text-gray-500">{task.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
