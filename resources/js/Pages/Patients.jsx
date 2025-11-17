import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import EmptyState from '@/Components/EmptyState';
import { Search, Eye, UserCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Patients() {
    const [searchQuery, setSearchQuery] = useState('');

    const patients = [
        {
            id: 'P2024-001',
            name: 'Juan Dela Cruz',
            email: 'juan@email.com',
            age: 45,
            gender: 'Male',
            contact: '0917-123-4567',
            lastVisit: '2024-10-28',
            totalTests: 5
        },
        {
            id: 'P2024-002',
            name: 'Maria Santos',
            email: 'maria@email.com',
            age: 32,
            gender: 'Female',
            contact: '0918-234-5678',
            lastVisit: '2024-10-30',
            totalTests: 3
        },
        {
            id: 'P2024-003',
            name: 'Pedro Garcia',
            email: 'pedro@email.com',
            age: 28,
            gender: 'Male',
            contact: '0919-345-6789',
            lastVisit: '2024-11-01',
            totalTests: 7
        },
        {
            id: 'P2024-004',
            name: 'Ana Reyes',
            email: 'ana@email.com',
            age: 55,
            gender: 'Female',
            contact: '0920-456-7890',
            lastVisit: '2024-10-25',
            totalTests: 12
        },
        {
            id: 'P2024-005',
            name: 'Carlos Lopez',
            email: 'carlos@email.com',
            age: 38,
            gender: 'Male',
            contact: '0921-567-8901',
            lastVisit: '2024-10-20',
            totalTests: 2
        }
    ];

    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact.includes(searchQuery)
    );

    return (
        <DashboardLayout>
            <Head title="Patient Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Patient Management</h1>
                <p className="text-gray-400">{patients.length} total patients</p>
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search patients by name, ID, or contact..."
                        className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add New Patient
                </Button>
            </div>

            {/* Patients Table */}
            {filteredPatients.length > 0 ? (
            <div className="rounded-lg border border-white/10 bg-[#1a1f37] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Patient ID</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Age/Gender</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Contact</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Last Visit</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total Tests</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredPatients.map((patient) => (
                                <tr 
                                    key={patient.id}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-white">{patient.id}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="text-sm font-medium text-white">{patient.name}</div>
                                            <div className="text-sm text-gray-400">{patient.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">
                                        {patient.age} / {patient.gender}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">{patient.contact}</td>
                                    <td className="px-4 py-3 text-sm text-white">{patient.lastVisit}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400">
                                            {patient.totalTests} tests
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-white"
                                            onClick={() => {/* Handle view patient */}}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            ) : (
                <div className="rounded-lg bg-white/5 border border-white/10">
                    <EmptyState 
                        icon={UserCheck}
                        title="No Patients Found"
                        description="No patient records exist yet. Patient data will appear here once they are registered in the system."
                    />
                </div>
            )}
        </DashboardLayout>
    );
}