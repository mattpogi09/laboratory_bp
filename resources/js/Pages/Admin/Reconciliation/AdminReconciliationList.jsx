import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import EmptyState from "@/Components/EmptyState";
import LoadingOverlay from "@/Components/LoadingOverlay";
import { cn } from "@/lib/utils";
import {
    TrendingDown,
    TrendingUp,
    CheckCircle,
    Search,
    Eye,
    Filter,
    Wallet,
} from "lucide-react";

export default function Index({ auth, reconciliations, filters, stats }) {
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [isSearching, setIsSearching] = useState(false);

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

    return (
        <DashboardLayout auth={auth}>
            <Head title="Cash Reconciliation - Admin" />
            <LoadingOverlay show={isSearching} message="Searching..." />

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
                    <div className="bg-green-50 p-6 rounded-lg shadow-sm ring-1 ring-green-200">
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
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg shadow-sm ring-1 ring-blue-200">
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
                    </div>
                    <div className="bg-red-50 p-6 rounded-lg shadow-sm ring-1 ring-red-200">
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
                    </div>
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
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                                    Transactions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reconciliations.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-0 py-0">
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
                                            {getStatusBadge(reconciliation)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center">
                                            <Link
                                                href={route(
                                                    "admin.reconciliation.show",
                                                    reconciliation.id
                                                )}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                {
                                                    reconciliation.transaction_count
                                                }
                                            </Link>
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
        </DashboardLayout>
    );
}
