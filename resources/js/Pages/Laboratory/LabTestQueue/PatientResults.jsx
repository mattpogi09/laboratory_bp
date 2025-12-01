import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    Search,
    Send,
    FileText,
    Bell,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    AlertTriangle,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SendResultsModal from "./SendResultsModal";
import NotifyPatientModal from "./NotifyPatientModal";
import LoadingOverlay from "@/Components/LoadingOverlay";

export default function PatientResults({ auth, transactions, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [incompleteTests, setIncompleteTests] = useState([]);
    const [errorAction, setErrorAction] = useState(null); // 'send' or 'notify'
    const [isSearching, setIsSearching] = useState(false);
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
    const [sortOrder, setSortOrder] = useState(filters.sort_order || "desc");

    // Debounced search - wait 300ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== filters.search) {
                setIsSearching(true);
                router.get(
                    route("lab-test-queue.patient-results"),
                    {
                        search: searchQuery,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        onFinish: () => setIsSearching(false),
                    }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (column) => {
        const newSortOrder =
            sortBy === column && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(newSortOrder);

        router.get(
            route("lab-test-queue.patient-results"),
            {
                search: searchQuery,
                sort_by: column,
                sort_order: newSortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSendResults = (transaction) => {
        // Check if there are any pending or processing tests BEFORE opening modal
        const incomplete =
            transaction.tests?.filter((test) => {
                const status = (test.status || "").toLowerCase();
                return status === "pending" || status === "processing";
            }) || [];

        if (incomplete.length > 0) {
            // Show error modal with incomplete tests
            setIncompleteTests(incomplete);
            setSelectedTransaction(transaction);
            setErrorAction("send");
            setShowErrorModal(true);
            return;
        }

        // All tests completed, open send modal
        setSelectedTransaction(transaction);
        setShowSendModal(true);
    };

    const handleNotifyPatient = (transaction) => {
        // Check if there are any pending or processing tests BEFORE opening modal
        const incomplete =
            transaction.tests?.filter((test) => {
                const status = (test.status || "").toLowerCase();
                return status === "pending" || status === "processing";
            }) || [];

        if (incomplete.length > 0) {
            // Show error modal with incomplete tests
            setIncompleteTests(incomplete);
            setSelectedTransaction(transaction);
            setErrorAction("notify");
            setShowErrorModal(true);
            return;
        }

        // All tests completed, open notify modal
        setSelectedTransaction(transaction);
        setShowNotifyModal(true);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Patient Results" />

            {isSearching && <LoadingOverlay message="Searching..." />}

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Patient Results
                </h1>
                <p className="text-gray-600">
                    Send completed test results to patients
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by transaction code, patient name, or email..."
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Results Table */}
            <div className="rounded-xl bg-white shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() =>
                                        handleSort("transaction_number")
                                    }
                                >
                                    <div className="flex items-center gap-1 wrap text-nowrap">
                                        Transaction Code
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("patient_name")}
                                >
                                    <div className="flex items-center gap-1">
                                        Full Name
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tests
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("created_at")}
                                >
                                    <div className="flex items-center gap-1 ">
                                        Date
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider wrap text-nowrap">
                                    Completed Tests
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {transactions.data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        {searchQuery
                                            ? "No results found for your search."
                                            : "No patients with completed tests."}
                                    </td>
                                </tr>
                            ) : (
                                transactions.data?.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.transaction_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {transaction.patient_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 wrap text-nowrap">
                                                {transaction.tests
                                                    ?.map(
                                                        (test, idx) =>
                                                            test.test_name
                                                    )
                                                    .join(", ")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {transaction.patient_email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {transaction.created_at}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(() => {
                                                const incompleteTests =
                                                    transaction.tests?.filter(
                                                        (test) => {
                                                            const status = (
                                                                test.status ||
                                                                ""
                                                            ).toLowerCase();
                                                            return (
                                                                status ===
                                                                    "pending" ||
                                                                status ===
                                                                    "processing"
                                                            );
                                                        }
                                                    ) || [];
                                                const allCompleted =
                                                    incompleteTests.length ===
                                                        0 &&
                                                    transaction.tests &&
                                                    transaction.tests.length >
                                                        0;

                                                if (allCompleted) {
                                                    return (
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            All Completed
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                            {
                                                                incompleteTests.length
                                                            }{" "}
                                                            Pending
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm font-medium text-gray-900">
                                                {transaction.completed_tests_count ||
                                                    0}{" "}
                                                /{" "}
                                                {transaction.total_tests_count ||
                                                    transaction.tests?.length ||
                                                    0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleSendResults(
                                                            transaction
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Send Results
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleNotifyPatient(
                                                            transaction
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                                >
                                                    <Bell className="h-4 w-4" />
                                                    Notify Patient
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() =>
                                    router.get(transactions.prev_page_url)
                                }
                                disabled={!transactions.prev_page_url}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() =>
                                    router.get(transactions.next_page_url)
                                }
                                disabled={!transactions.next_page_url}
                                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {transactions.from}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {transactions.to}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {transactions.total}
                                    </span>{" "}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() =>
                                            router.get(
                                                transactions.prev_page_url
                                            )
                                        }
                                        disabled={!transactions.prev_page_url}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                                        {transactions.current_page} /{" "}
                                        {transactions.last_page}
                                    </span>
                                    <button
                                        onClick={() =>
                                            router.get(
                                                transactions.next_page_url
                                            )
                                        }
                                        disabled={!transactions.next_page_url}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Send Results Modal */}
            {selectedTransaction && (
                <SendResultsModal
                    show={showSendModal}
                    transaction={selectedTransaction}
                    onClose={() => {
                        setShowSendModal(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}

            {/* Notify Patient Modal */}
            {selectedTransaction && (
                <NotifyPatientModal
                    show={showNotifyModal}
                    transaction={selectedTransaction}
                    onClose={() => {
                        setShowNotifyModal(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}

            {/* Error Modal for Incomplete Tests */}
            {showErrorModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                            onClick={() => {
                                setShowErrorModal(false);
                                setIncompleteTests([]);
                                setSelectedTransaction(null);
                                setErrorAction(null);
                            }}
                        />

                        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
                            {/* Error Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Cannot{" "}
                                            {errorAction === "send"
                                                ? "Send Results"
                                                : "Notify Patient"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Some tests are not completed
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowErrorModal(false);
                                        setIncompleteTests([]);
                                        setSelectedTransaction(null);
                                        setErrorAction(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Error Content */}
                            <div className="px-6 py-4">
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        Patient:
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        {selectedTransaction.patient_name}
                                    </p>
                                </div>

                                <p className="text-sm text-gray-700 mb-4">
                                    The following tests are not yet completed.
                                    Please process them first before{" "}
                                    {errorAction === "send"
                                        ? "sending the results"
                                        : "sending the notification"}
                                    :
                                </p>

                                <div className="space-y-2 mb-4">
                                    {incompleteTests.map((test, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {test.test_name}
                                                </span>
                                            </div>
                                            <span
                                                className={cn(
                                                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase",
                                                    test.status === "processing"
                                                        ? "bg-yellow-200 text-yellow-900"
                                                        : "bg-red-200 text-red-900"
                                                )}
                                            >
                                                {test.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        <strong>Note:</strong> Go to Lab Test
                                        Queue to complete the pending tests
                                        before{" "}
                                        {errorAction === "send"
                                            ? "sending results"
                                            : "sending notification"}{" "}
                                        to the patient.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowErrorModal(false);
                                        setIncompleteTests([]);
                                        setSelectedTransaction(null);
                                        setErrorAction(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
