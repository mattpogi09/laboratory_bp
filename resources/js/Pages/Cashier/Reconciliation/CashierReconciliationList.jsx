import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import EmptyState from "@/Components/EmptyState";
import LoadingOverlay from "@/Components/LoadingOverlay";
import { cn } from "@/lib/utils";
import {
    CalendarDays,
    TrendingDown,
    TrendingUp,
    CheckCircle,
    Search,
    Eye,
    FileText,
} from "lucide-react";

export default function Index({ auth, reconciliations, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    // Check if today is already reconciled and NOT approved
    const today = new Date().toISOString().split("T")[0];
    const isTodayReconciled = reconciliations.data?.some((rec) => {
        const recDate = new Date(rec.reconciliation_date)
            .toISOString()
            .split("T")[0];
        return recDate === today && !rec.is_approved;
    });

    // Debounced search with 300ms delay
    useEffect(() => {
        // Skip if this is the initial mount or search hasn't changed
        if (search === (filters.search || "")) return;

        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                route("cashier.reconciliation.index"),
                { search },
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

    const handleSearch = (e) => {
        e.preventDefault();
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
            <Head title="Cash Reconciliation" />
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
                    Cash Reconciliation
                </h1>
                <p className="text-gray-600">
                    End-of-day cash counting and variance tracking
                </p>
            </div>

            <section className="mt-10 rounded-xl bg-white p-6 shadow">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Cash Reconciliation
                        </h2>
                        <p className="text-sm text-gray-500">
                            Track queue tickets, discounts, payments, and print
                            receipts anytime.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <form
                            onSubmit={handleSearch}
                            className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-gray-900 px-3 py-2"
                        >
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by date or cashier..."
                                className="flex-1 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                            />
                        </form>
                        <Link
                            href={route("cashier.reconciliation.create")}
                            className={`inline-flex items-center wrap text-nowrap gap-1 rounded-lg border px-3 py-4 text-xs font-semibold transition ${
                                isTodayReconciled
                                    ? "border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "border-gray-900 bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                            disabled={isTodayReconciled}
                            title={
                                isTodayReconciled
                                    ? "Today's reconciliation has already been completed"
                                    : "Create new reconciliation"
                            }
                        >
                            <CalendarDays className="h-4 w-6" />
                            Reconcile Today
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Cashier</th>
                                <th className="px-4 py-3">Expected</th>
                                <th className="px-4 py-3">Actual</th>
                                <th className="px-4 py-3">Variance</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Transactions</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reconciliations.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-0">
                                        <EmptyState
                                            icon={FileText}
                                            title="No Reconciliation Records"
                                            description="No reconciliation records found. Start by reconciling today's cash."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                reconciliations.data.map((reconciliation) => (
                                    <tr
                                        key={reconciliation.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {new Date(
                                                reconciliation.reconciliation_date
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {reconciliation.cashier.name}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900">
                                            ₱
                                            {parseFloat(
                                                reconciliation.expected_cash
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900">
                                            ₱
                                            {parseFloat(
                                                reconciliation.actual_cash
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td
                                            className={cn(
                                                "px-4 py-3 font-semibold",
                                                reconciliation.variance == 0
                                                    ? "text-green-600"
                                                    : reconciliation.variance >
                                                      0
                                                    ? "text-blue-600"
                                                    : "text-red-600"
                                            )}
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
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(reconciliation)}
                                                {reconciliation.correction_requested &&
                                                    !reconciliation.is_approved && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                                            <FileText className="h-3 w-3" />
                                                            Pending Review
                                                        </span>
                                                    )}
                                                {reconciliation.is_approved && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Approved
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {reconciliation.transaction_count}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={route(
                                                    "cashier.reconciliation.show",
                                                    reconciliation.id
                                                )}
                                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600"
                                            >
                                                View Details
                                                <Eye className="h-3 w-3" />
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
                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
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
            </section>
        </DashboardLayout>
    );
}
