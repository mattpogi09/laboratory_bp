import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import EmptyState from "@/Components/EmptyState";
import LoadingOverlay from "@/Components/LoadingOverlay";
import Modal from "@/Components/Modal";
import { cn } from "@/lib/utils";
import {
    TrendingDown,
    TrendingUp,
    CheckCircle,
    Search,
    Eye,
    Filter,
    Wallet,
    Trash2,
    AlertTriangle,
    FileText,
} from "lucide-react";

export default function Index({ auth, reconciliations, filters, stats }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [isSearching, setIsSearching] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedReconciliation, setSelectedReconciliation] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // Debounced search with 300ms delay
    useEffect(() => {
        // Skip if this is the initial mount or search hasn't changed
        if (search === (filters.search || "")) return;

        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                route("admin.reconciliation.index"),
                { search, status },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [search]);

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        setIsSearching(true);
        router.get(
            route("admin.reconciliation.index"),
            { search, status: newStatus },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    const getStatusBadge = (reconciliation) => {
        if (reconciliation.variance == 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Balanced
                </span>
            );
        } else if (reconciliation.variance > 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-700">
                    <TrendingUp className="h-3 w-3" />
                    Overage
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-700">
                    <TrendingDown className="h-3 w-3" />
                    Shortage
                </span>
            );
        }
    };

    const handleDelete = (reconciliation) => {
        setSelectedReconciliation(reconciliation);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(
            route("admin.reconciliation.destroy", selectedReconciliation.id),
            {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedReconciliation(null);
                },
                onFinish: () => setIsDeleting(false),
            }
        );
    };

    const handleApprove = (reconciliation) => {
        setSelectedReconciliation(reconciliation);
        setShowApproveModal(true);
    };

    const confirmApprove = () => {
        setIsApproving(true);
        router.post(
            route("admin.reconciliation.approve", selectedReconciliation.id),
            {},
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    setSelectedReconciliation(null);
                },
                onFinish: () => setIsApproving(false),
            }
        );
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Cash Reconciliation - Admin" />
            <LoadingOverlay show={isSearching} message="Searching..." />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                    <p className="text-sm text-green-800">{flash.success}</p>
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-800">{flash.error}</p>
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Cash Reconciliation Monitoring
                </h1>
                <p className="text-gray-600">
                    View and monitor all cash reconciliations
                </p>
            </div>

            {/* Summary Stats */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
                        <p className="text-sm text-gray-600 mb-1">
                            Total Reconciliations
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.total_reconciliations}
                        </p>
                    </div>
                    <button
                        onClick={() => handleStatusChange("balanced")}
                        className={`text-left p-6 rounded-lg shadow-sm ring-1 transition-all ${
                            status === "balanced"
                                ? "bg-green-100 ring-2 ring-green-500 scale-105"
                                : "bg-green-50 ring-green-200 hover:bg-green-100 hover:scale-102"
                        }`}
                    >
                        <p className="text-sm text-green-700 mb-1">Balanced</p>
                        <p className="text-2xl font-bold text-green-900">
                            {stats.balanced_count}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            {stats.total_reconciliations > 0
                                ? (
                                      (stats.balanced_count /
                                          stats.total_reconciliations) *
                                      100
                                  ).toFixed(1)
                                : 0}
                            % accuracy
                        </p>
                        {status === "balanced" && (
                            <p className="text-xs text-green-700 mt-2 font-medium">
                                ✓ Filtered
                            </p>
                        )}
                    </button>
                    <button
                        onClick={() => handleStatusChange("overage")}
                        className={`text-left p-6 rounded-lg shadow-sm ring-1 transition-all ${
                            status === "overage"
                                ? "bg-blue-100 ring-2 ring-blue-500 scale-105"
                                : "bg-blue-50 ring-blue-200 hover:bg-blue-100 hover:scale-102"
                        }`}
                    >
                        <p className="text-sm text-blue-700 mb-1">
                            Total Overage
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                            ₱
                            {parseFloat(stats.total_overage).toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {stats.overage_count} occurrences
                        </p>
                        {status === "overage" && (
                            <p className="text-xs text-blue-700 mt-2 font-medium">
                                ✓ Filtered
                            </p>
                        )}
                    </button>
                    <button
                        onClick={() => handleStatusChange("shortage")}
                        className={`text-left p-6 rounded-lg shadow-sm ring-1 transition-all ${
                            status === "shortage"
                                ? "bg-red-100 ring-2 ring-red-500 scale-105"
                                : "bg-red-50 ring-red-200 hover:bg-red-100 hover:scale-102"
                        }`}
                    >
                        <p className="text-sm text-red-700 mb-1">
                            Total Shortage
                        </p>
                        <p className="text-2xl font-bold text-red-900">
                            ₱
                            {parseFloat(stats.total_shortage).toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            {stats.shortage_count} occurrences
                        </p>
                        {status === "shortage" && (
                            <p className="text-xs text-red-700 mt-2 font-medium">
                                ✓ Filtered
                            </p>
                        )}
                    </button>
                </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 relative">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by date or cashier..."
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="h-10 pl-10 pr-10 py-2 border border-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="balanced">Balanced</option>
                            <option value="overage">Overage</option>
                            <option value="shortage">Shortage</option>
                        </select>
                    </div>
                    {(filters.search || filters.status) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setStatus("");
                                router.get(route("admin.reconciliation.index"));
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                    Date
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                    Cashier
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-gray-700">
                                    Expected
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-gray-700">
                                    Actual
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-gray-700">
                                    Variance
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-700">
                                    Status
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reconciliations.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-0 py-0">
                                        <EmptyState
                                            icon={Wallet}
                                            title="No Reconciliation Records"
                                            description="No reconciliation records found."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                reconciliations.data.map((reconciliation) => (
                                    <tr
                                        key={reconciliation.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                                            {new Date(
                                                reconciliation.reconciliation_date
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                                            {reconciliation.cashier.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                                            ₱
                                            {parseFloat(
                                                reconciliation.expected_cash
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                                            ₱
                                            {parseFloat(
                                                reconciliation.actual_cash
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td
                                            className={`whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-medium ${
                                                reconciliation.variance == 0
                                                    ? "text-green-600"
                                                    : reconciliation.variance >
                                                      0
                                                    ? "text-blue-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {reconciliation.variance > 0
                                                ? "+"
                                                : ""}
                                            ₱
                                            {parseFloat(
                                                reconciliation.variance
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {getStatusBadge(reconciliation)}
                                                {reconciliation.correction_requested &&
                                                    !reconciliation.is_approved && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Correction Requested
                                                        </span>
                                                    )}
                                                {reconciliation.is_approved && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Approved Request
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route(
                                                        "admin.reconciliation.show",
                                                        reconciliation.id
                                                    )}
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                                {reconciliation.correction_requested &&
                                                    !reconciliation.is_approved && (
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    reconciliation
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Approve
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {reconciliations.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                            {reconciliations.prev_page_url && (
                                <Link
                                    href={reconciliations.prev_page_url}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </Link>
                            )}
                            {reconciliations.next_page_url && (
                                <Link
                                    href={reconciliations.next_page_url}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {reconciliations.from || 0}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {reconciliations.to || 0}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {reconciliations.total}
                                    </span>{" "}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                    aria-label="Pagination"
                                >
                                    {reconciliations.links.map(
                                        (link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || "#"}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                    link.active
                                                        ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                                } ${
                                                    index === 0
                                                        ? "rounded-l-md"
                                                        : ""
                                                } ${
                                                    index ===
                                                    reconciliations.links
                                                        .length -
                                                        1
                                                        ? "rounded-r-md"
                                                        : ""
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )
                                    )}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Delete Reconciliation
                            </h3>
                            <div className="mt-3 text-sm text-gray-600 space-y-2">
                                <p>
                                    Are you sure you want to delete this
                                    reconciliation? This action cannot be
                                    undone.
                                </p>
                                {selectedReconciliation && (
                                    <div className="mt-4 rounded-lg bg-gray-50 p-3 space-y-1">
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {new Date(
                                                selectedReconciliation.reconciliation_date
                                            ).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Cashier:</strong>{" "}
                                            {
                                                selectedReconciliation.cashier
                                                    ?.name
                                            }
                                        </p>
                                        <p>
                                            <strong>Variance:</strong> ₱
                                            {parseFloat(
                                                selectedReconciliation.variance
                                            ).toFixed(2)}
                                        </p>
                                        {selectedReconciliation.correction_requested && (
                                            <p className="text-amber-700">
                                                <strong>Reason:</strong>{" "}
                                                {
                                                    selectedReconciliation.correction_reason
                                                }
                                            </p>
                                        )}
                                    </div>
                                )}
                                <p className="mt-3 text-amber-700 font-medium">
                                    ⚠️ The cashier will be able to create a new
                                    reconciliation after deletion.
                                </p>
                            </div>
                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    disabled={isDeleting}
                                >
                                    {isDeleting
                                        ? "Deleting..."
                                        : "Delete Reconciliation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Approve Correction Modal */}
            <Modal
                show={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Approve Correction Request
                            </h3>
                            <div className="mt-3 text-sm text-gray-600 space-y-2">
                                <p>
                                    By approving this request, the cashier will
                                    be able to re-reconcile for this date. The
                                    current reconciliation will be removed.
                                </p>
                                {selectedReconciliation && (
                                    <div className="mt-4 rounded-lg bg-gray-50 p-3 space-y-1">
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {new Date(
                                                selectedReconciliation.reconciliation_date
                                            ).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Cashier:</strong>{" "}
                                            {
                                                selectedReconciliation.cashier
                                                    ?.name
                                            }
                                        </p>
                                        <p>
                                            <strong>Current Variance:</strong> ₱
                                            {parseFloat(
                                                selectedReconciliation.variance
                                            ).toFixed(2)}
                                        </p>
                                        {selectedReconciliation.correction_reason && (
                                            <p className="text-amber-700">
                                                <strong>Reason:</strong>{" "}
                                                {
                                                    selectedReconciliation.correction_reason
                                                }
                                            </p>
                                        )}
                                    </div>
                                )}
                                <p className="mt-3 text-green-700 font-medium">
                                    ✓ The cashier will be notified and can
                                    re-reconcile immediately.
                                </p>
                            </div>
                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={isApproving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApprove}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    disabled={isApproving}
                                >
                                    {isApproving
                                        ? "Approving..."
                                        : "Approve Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
