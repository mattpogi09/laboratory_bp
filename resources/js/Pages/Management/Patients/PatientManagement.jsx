import { useState, useEffect } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import EmptyState from "@/Components/EmptyState";
import Pagination from "@/Components/Pagination";
import LoadingOverlay from "@/Components/LoadingOverlay";
import Modal from "@/Components/Modal";
import {
    Search,
    Eye,
    Edit,
    Plus,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Power,
    PowerOff,
    AlertTriangle,
    CheckCircle,
    X,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import PatientDetailsModal from "./PatientDetailsModal";
import EditPatientModal from "./EditPatientModal";
import CreatePatientModal from "./CreatePatientModal";

export default function PatientsIndex({
    auth,
    patients = { data: [], links: [] },
    filters = {},
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToggleStatusModal, setShowToggleStatusModal] = useState(false);
    const [patientToToggle, setPatientToToggle] = useState(null);

    const userRole = auth.user.role;
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search with 300ms delay
    useEffect(() => {
        // Skip if this is the initial mount or search hasn't changed
        if (searchQuery === (filters.search || "")) return;

        setIsSearching(true);
        const timer = setTimeout(() => {
            const params = { search: searchQuery || undefined };
            if (filters.sort_by) params.sort_by = filters.sort_by;
            if (filters.sort_order) params.sort_order = filters.sort_order;

            router.get(route("patients.index"), params, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            });
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [searchQuery]);

    const handleSort = (column) => {
        const newOrder =
            filters.sort_by === column && filters.sort_order === "asc"
                ? "desc"
                : "asc";
        const params = { sort_by: column, sort_order: newOrder };
        if (searchQuery) params.search = searchQuery;

        setIsLoading(true);
        router.get(route("patients.index"), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleViewPatient = (patient) => {
        setSelectedPatient(patient);
        setShowDetailsModal(true);
    };

    const handleEditPatient = (patient) => {
        setSelectedPatient(patient);
        setShowEditModal(true);
    };

    const handleTogglePatientStatus = (patient) => {
        setPatientToToggle(patient);
        setShowToggleStatusModal(true);
    };

    const { post, processing } = useForm();

    const confirmToggleStatus = () => {
        if (!patientToToggle) return;

        const action = patientToToggle.is_active ? "deactivate" : "activate";

        post(route(`patients.${action}`, patientToToggle.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowToggleStatusModal(false);
                setPatientToToggle(null);
            },
        });
    };
    return (
        <DashboardLayout auth={auth}>
            <Head title="Patient Management" />
            <LoadingOverlay
                show={isLoading || isSearching}
                message={isSearching ? "Searching..." : "Loading..."}
            />

            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Patient Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    {patients.total || 0} total patients
                </p>
            </div>

            {/* Search and Actions */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 relative">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="h-10 sm:h-10 w-full rounded-lg border border-gray-900 bg-white pl-10 pr-4 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Patients Table */}
            {patients.data?.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors whitespace-nowrap"
                                            onClick={() => handleSort("id")}
                                        >
                                            ID ↕
                                        </div>
                                    </th>
                                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                            onClick={() =>
                                                handleSort("first_name")
                                            }
                                        >
                                            Name ↕
                                        </div>
                                    </th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Age/Gender
                                    </th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Contact
                                    </th>
                                    <th className="hidden xl:table-cell px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Address
                                    </th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                            onClick={() =>
                                                handleSort("created_at")
                                            }
                                        >
                                            Last Visit ↕
                                        </div>
                                    </th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                                        Total Tests
                                    </th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {patients.data.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                                            <span className="hidden sm:inline">
                                                {patient.patient_id}
                                            </span>
                                            <span className="sm:hidden">
                                                {
                                                    patient.patient_id.split(
                                                        "-"
                                                    )[1]
                                                }
                                            </span>
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                            <div>
                                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                                                        {patient.name}
                                                    </span>
                                                    {!patient.is_active && (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-gray-700">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 md:hidden">
                                                    {patient.contact_number}
                                                </div>
                                                <div className="hidden md:block text-sm text-gray-500">
                                                    {patient.email || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {patient.age} / {patient.gender}
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {patient.contact_number}
                                        </td>
                                        <td className="hidden xl:table-cell px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                            {patient.address || "N/A"}
                                        </td>
                                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {patient.last_visit}
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                {patient.total_tests}
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell px-4 py-3">
                                            {patient.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewPatient(
                                                            patient
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs sm:text-sm font-medium transition-colors p-1 sm:p-0"
                                                    title="View patient"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="hidden sm:inline">
                                                        View
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditPatient(
                                                            patient
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors p-1 sm:p-0"
                                                    title="Edit patient"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="hidden sm:inline">
                                                        Edit
                                                    </span>
                                                </button>
                                                {userRole === "admin" &&
                                                    (patient.is_active ? (
                                                        <button
                                                            onClick={() =>
                                                                handleTogglePatientStatus(
                                                                    patient
                                                                )
                                                            }
                                                            className="hidden lg:inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
                                                            title="Deactivate patient"
                                                        >
                                                            <PowerOff className="h-4 w-4" />
                                                            <span className="hidden xl:inline">
                                                                Deactivate
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleTogglePatientStatus(
                                                                    patient
                                                                )
                                                            }
                                                            className="hidden lg:inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                                                            title="Activate patient"
                                                        >
                                                            <Power className="h-4 w-4" />
                                                            <span className="hidden xl:inline">
                                                                Activate
                                                            </span>
                                                        </button>
                                                    ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="border-t border-gray-200 px-3 sm:px-4 py-3 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                                <button
                                    onClick={() =>
                                        router.visit(patients.prev_page_url)
                                    }
                                    disabled={!patients.prev_page_url}
                                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Previous
                                    </span>
                                </button>
                                <span className="text-xs sm:text-sm text-gray-600 px-2">
                                    {patients.current_page} /{" "}
                                    {patients.last_page}
                                </span>
                                <button
                                    onClick={() =>
                                        router.visit(patients.next_page_url)
                                    }
                                    disabled={!patients.next_page_url}
                                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                                >
                                    <span className="hidden sm:inline">
                                        Next
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                Showing {patients.from || 0} -{" "}
                                {patients.to || 0} of {patients.total || 0}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg bg-white shadow-md">
                    <EmptyState
                        icon={UserCheck}
                        title={
                            searchQuery
                                ? "No Matching Patients"
                                : "No Patients Found"
                        }
                        description={
                            searchQuery
                                ? `No patients match "${searchQuery}". Try different search terms.`
                                : "No patient records exist yet. Patient data will appear here once they are registered in the system."
                        }
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

            {/* Toggle Status Confirmation Modal */}
            {showToggleStatusModal && patientToToggle && (
                <Modal
                    show={showToggleStatusModal}
                    onClose={() => {
                        setShowToggleStatusModal(false);
                        setPatientToToggle(null);
                    }}
                    maxWidth="sm"
                >
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-lg ${
                                        patientToToggle.is_active
                                            ? "bg-yellow-500/10"
                                            : "bg-green-500/10"
                                    }`}
                                >
                                    {patientToToggle.is_active ? (
                                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                    ) : (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {patientToToggle.is_active
                                        ? "Deactivate"
                                        : "Activate"}{" "}
                                    Patient
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowToggleStatusModal(false);
                                    setPatientToToggle(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-2">
                                {patientToToggle.is_active
                                    ? "This patient will be hidden from cashier and lab staff."
                                    : "This patient will be visible to cashier and lab staff again."}
                            </p>
                            <p className="text-sm text-gray-600">
                                Are you sure you want to{" "}
                                {patientToToggle.is_active
                                    ? "deactivate"
                                    : "activate"}{" "}
                                <span className="text-gray-900 font-medium">
                                    {patientToToggle.name}
                                </span>
                                ?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmToggleStatus}
                                disabled={processing}
                                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 ${
                                    patientToToggle.is_active
                                        ? "bg-yellow-600 hover:bg-yellow-700"
                                        : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {processing
                                    ? patientToToggle.is_active
                                        ? "Deactivating..."
                                        : "Activating..."
                                    : patientToToggle.is_active
                                    ? "Deactivate"
                                    : "Activate"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowToggleStatusModal(false);
                                    setPatientToToggle(null);
                                }}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardLayout>
    );
}
