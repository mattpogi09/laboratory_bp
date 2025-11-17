import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { DollarSign, Users, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CashierDashboard({ auth }) {
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
            title: 'Pending Payments', 
            value: '5', 
            icon: Clock,
            color: 'bg-amber-500'
        },
        { 
            title: 'Transactions', 
            value: '18', 
            icon: FileText,
            color: 'bg-purple-500'
        }
    ];

    const patients = [
        { 
            id: 'P2024-001',
            name: 'Juan Dela Cruz',
            contact: '0917-123-4567',
            age: 45,
            gender: 'Male',
            lastVisit: '2024-10-28',
            action: 'View'
        },
        { 
            id: 'P2024-002',
            name: 'Maria Santos',
            contact: '0918-234-5678',
            age: 32,
            gender: 'Female',
            lastVisit: '2024-10-30',
            action: 'View'
        },
        { 
            id: 'P2024-003',
            name: 'Pedro Garcia',
            contact: '0919-345-6789',
            age: 28,
            gender: 'Male',
            lastVisit: '2024-11-01',
            action: 'View'
        },
        { 
            id: 'P2024-004',
            name: 'Ana Reyes',
            contact: '0920-456-7890',
            age: 50,
            gender: 'Female',
            lastVisit: '2024-10-25',
            action: 'View'
        },
        { 
            id: 'P2024-005',
            name: 'Carlos Lopez',
            contact: '0921-567-8901',
            age: 38,
            gender: 'Male',
            lastVisit: '2024-10-20',
            action: 'View'
        }
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Cashier Panel" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Patient Management</h1>
                <p className="text-gray-600">Manage patient records and contact information</p>
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

            {/* Patient Management Table */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Patient Management</h2>
                            <p className="text-sm text-gray-600 mt-1">{patients.length} total patients</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            + Add User
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Search patients by name, ID, or contact..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Patient ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Age/Gender
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Last Visit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {patients.map((patient, index) => (
                                <tr key={index} className="hover:bg-gray-100 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{patient.id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                            <div className="text-sm text-gray-500">{patient.contact}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{patient.age} / {patient.gender}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{patient.contact}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{patient.lastVisit}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                            {patient.action}
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
