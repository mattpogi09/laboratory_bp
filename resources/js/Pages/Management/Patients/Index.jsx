import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import EmptyState from '@/Components/EmptyState';
import { Search, Eye, Edit, Plus, UserCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import PatientDetailsModal from './PatientDetailsModal';
import EditPatientModal from './EditPatientModal';

export default function PatientsIndex({ auth }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const patients = [
        {
            id: 'P2024-001',
            name: 'Juan Dela Cruz',
            email: 'juan@email.com',
            age: 45,
            gender: 'Male',
            contact: '0917-123-4567',
            lastVisit: '2024-10-28',
            totalTests: 5,
            tests: [
                { name: 'Complete Blood Count', date: '2024-10-28', status: 'Completed' },
                { name: 'Dengue', date: '2024-08-15', status: 'Completed' },
                { name: 'Blood Uric Acid', date: '2024-08-01', status: 'Released' },
                { name: 'Routine Urinalysis', date: '2024-05-10', status: 'Released' },
                { name: 'Chest X-Ray', date: '2024-08-30', status: 'Released' }
            ]
        },
        {
            id: 'P2024-002',
            name: 'Maria Santos',
            email: 'maria@email.com',
            age: 32,
            gender: 'Female',
            contact: '0918-234-5678',
            lastVisit: '2024-10-30',
            totalTests: 3,
            tests: [
                { name: 'Urinalysis', date: '2024-10-30', status: 'Completed' },
                { name: 'Complete Blood Count', date: '2024-09-15', status: 'Released' },
                { name: 'Lipid Profile', date: '2024-08-20', status: 'Released' }
            ]
        },
        {
            id: 'P2024-003',
            name: 'Pedro Garcia',
            email: 'pedro@email.com',
            age: 28,
            gender: 'Male',
            contact: '0919-345-6789',
            lastVisit: '2024-11-01',
            totalTests: 7,
            tests: [
                { name: 'Lipid Profile', date: '2024-11-01', status: 'Completed' }
            ]
        },
        {
            id: 'P2024-004',
            name: 'Ana Reyes',
            email: 'ana@email.com',
            age: 55,
            gender: 'Female',
            contact: '0920-456-7890',
            lastVisit: '2024-10-25',
            totalTests: 12,
            tests: [
                { name: 'Chest X-Ray', date: '2024-10-25', status: 'Released' }
            ]
        },
        {
            id: 'P2024-005',
            name: 'Carlos Lopez',
            email: 'carlos@email.com',
            age: 38,
            gender: 'Male',
            contact: '0921-567-8901',
            lastVisit: '2024-10-20',
            totalTests: 2,
            tests: [
                { name: 'Blood Sugar', date: '2024-10-20', status: 'Released' }
            ]
        }
    ];

    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact.includes(searchQuery)
    );

    const handleViewPatient = (patient) => {
        setSelectedPatient(patient);
        setShowDetailsModal(true);
    };

    const handleEditPatient = (patient) => {
        setSelectedPatient(patient);
        setShowEditModal(true);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Patient Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Patient Management</h1>
                <p className="text-gray-600">{patients.length} total patients</p>
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search patients by name, ID, or contact..."
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Patient
                </Button>
            </div>

            {/* Patients Table */}
            {filteredPatients.length > 0 ? (
            <div className="rounded-lg border border-gray-500 bg-white overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient ID</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Age/Gender</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Visit</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Tests</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPatients.map((patient) => (
                                <tr 
                                    key={patient.id}
                                    className="hover:bg-gray-300 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900">{patient.id}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                            <div className="text-sm text-gray-500">{patient.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {patient.age} / {patient.gender}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{patient.contact}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{patient.lastVisit}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                                            {patient.totalTests} tests
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewPatient(patient)}
                                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditPatient(patient)}
                                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            ) : (
                <div className="rounded-lg bg-white shadow-md">
                    <EmptyState 
                        icon={UserCheck}
                        title="No Patients Found"
                        description="No patient records exist yet. Patient data will appear here once they are registered in the system."
                    />
                </div>
            )}

            {/* Modals */}
            {selectedPatient && (
                <>
                    <PatientDetailsModal
                        patient={selectedPatient}
                        show={showDetailsModal}
                        onClose={() => {
                            setShowDetailsModal(false);
                            setSelectedPatient(null);
                        }}
                    />
                    <EditPatientModal
                        patient={selectedPatient}
                        show={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedPatient(null);
                        }}
                    />
                </>
            )}
        </DashboardLayout>
    );
}
