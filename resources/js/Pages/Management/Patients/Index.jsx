import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import LoadingOverlay from '@/Components/LoadingOverlay';
import { Search, Eye, Edit, Plus, UserCheck, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import PatientDetailsModal from './PatientDetailsModal';
import EditPatientModal from './EditPatientModal';
import CreatePatientModal from './CreatePatientModal';

export default function PatientsIndex({ auth, patients = { data: [], links: [] }, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const userRole = auth.user.role;
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search with 300ms delay
    useEffect(() => {
        // Skip if this is the initial mount or search hasn't changed
        if (searchQuery === (filters.search || '')) return;
        
        setIsSearching(true);
        const timer = setTimeout(() => {
            const params = { search: searchQuery || undefined };
            if (filters.sort_by) params.sort_by = filters.sort_by;
            if (filters.sort_order) params.sort_order = filters.sort_order;
            
            router.get(
                route('patients.index'),
                params,
                { 
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsSearching(false)
                }
            );
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [searchQuery]);

    const handleSort = (column) => {
        const newOrder = filters.sort_by === column && filters.sort_order === 'asc' ? 'desc' : 'asc';
        const params = { sort_by: column, sort_order: newOrder };
        if (searchQuery) params.search = searchQuery;
        
        setIsLoading(true);
        router.get(
            route('patients.index'),
            params,
            { 
                preserveState: true, 
                preserveScroll: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

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
            <LoadingOverlay show={isLoading} message="Loading..." />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Patient Management</h1>
                <p className="text-gray-600">{patients.total || 0} total patients</p>
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex gap-4 relative">
                {isSearching && <LoadingOverlay message="Searching..." />}
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
            {patients.data?.length > 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors" onClick={() => handleSort('id')}>
                                        Patient ID ↕
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors" onClick={() => handleSort('first_name')}>
                                        Name ↕
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Age/Gender</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Address</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors" onClick={() => handleSort('created_at')}>
                                        Last Visit ↕
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Tests</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {patients.data.map((patient) => (
                                <tr 
                                    key={patient.id}
                                    className="hover:bg-gray-50 transition-colors"
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
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                            {patient.total_tests} tests
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewPatient(patient)}
                                                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditPatient(patient)}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.visit(patients.prev_page_url)}
                                disabled={!patients.prev_page_url}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {patients.current_page} / {patients.last_page}
                            </span>
                            <button
                                onClick={() => router.visit(patients.next_page_url)}
                                disabled={!patients.next_page_url}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            Showing {patients.from || 0} to {patients.to || 0} of {patients.total || 0} patients
                        </div>
                    </div>
                </div>
            </div>
            ) : (
                <div className="rounded-lg bg-white shadow-md">
                    <EmptyState 
                        icon={UserCheck}
                        title={searchQuery ? "No Matching Patients" : "No Patients Found"}
                        description={searchQuery ? `No patients match "${searchQuery}". Try different search terms.` : "No patient records exist yet. Patient data will appear here once they are registered in the system."}
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
