import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import { Search, Eye, Edit, Plus, UserCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import PatientDetailsModal from './PatientDetailsModal';
import EditPatientModal from './EditPatientModal';
import CreatePatientModal from './CreatePatientModal';

export default function PatientsIndex({ auth, patients = { data: [], links: [] } }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const userRole = auth.user.role;

    const patientsData = patients.data || [];

    const filteredPatients = patientsData.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                <p className="text-gray-600">{patients.total || 0} total patients</p>
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Address</th>
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
                                    <td className="px-4 py-3 text-sm text-gray-900">{patient.patient_id}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                            <div className="text-sm text-gray-500">{patient.email || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {patient.age} / {patient.gender}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{patient.contact}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{patient.address || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{patient.last_visit}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                                            {patient.total_tests} tests
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
                <Pagination links={patients.links} />
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
            <CreatePatientModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            
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
                        userRole={userRole}
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
