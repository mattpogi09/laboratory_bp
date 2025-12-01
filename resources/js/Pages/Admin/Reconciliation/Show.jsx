import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    TrendingDown,
    TrendingUp,
    CheckCircle,
    FileText,
} from "lucide-react";

export default function Show({ auth, reconciliation, transactions }) {
    const getStatusBadge = () => {
        if (reconciliation.variance == 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Balanced
                </span>
            );
        } else if (reconciliation.variance > 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-700">
                    <TrendingUp className="h-4 w-4" />
                    Overage
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-700">
                    <TrendingDown className="h-4 w-4" />
                    Shortage
                </span>
            );
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Reconciliation Details - Admin" />

            {/* Header */}
            <div className="mb-6">
                <Link
                    href={route("admin.reconciliation.index")}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Reconciliation
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Reconciliation Details
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {new Date(
                                reconciliation.reconciliation_date
                            ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    {getStatusBadge()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Expected Cash */}
                    <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
                        <p className="text-sm text-gray-600 mb-1">
                            Expected Cash
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            ₱
                            {parseFloat(
                                reconciliation.expected_cash
                            ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            From {reconciliation.transaction_count} transactions
                        </p>
                    </div>

                    {/* Actual Cash */}
                    <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
                        <p className="text-sm text-gray-600 mb-1">
                            Actual Cash
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            ₱
                            {parseFloat(
                                reconciliation.actual_cash
                            ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Counted by cashier
                        </p>
                    </div>

                    {/* Variance */}
                    <div
                        className={`bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5 ${
                            reconciliation.variance == 0
                                ? "ring-green-200"
                                : reconciliation.variance > 0
                                ? "ring-blue-200"
                                : "ring-red-200"
                        }`}
                    >
                        <p className="text-sm text-gray-600 mb-1">Variance</p>
                        <p
                            className={`text-2xl font-bold ${
                                reconciliation.variance == 0
                                    ? "text-green-600"
                                    : reconciliation.variance > 0
                                    ? "text-blue-600"
                                    : "text-red-600"
                            }`}
                        >
                            {reconciliation.variance > 0 ? "+" : ""}₱
                            {parseFloat(reconciliation.variance).toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {reconciliation.variance == 0
                                ? "Perfect match"
                                : reconciliation.variance > 0
                                ? "Extra cash"
                                : "Missing cash"}
                        </p>
                    </div>

                    {/* Cashier */}
                    <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
                        <p className="text-sm text-gray-600 mb-1">
                            Reconciled By
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                            {reconciliation.cashier.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(
                                reconciliation.created_at
                            ).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Notes Section */}
                {reconciliation.notes && (
                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-900/5">
                        <div className="flex items-start">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                    Notes
                                </h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {reconciliation.notes}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transactions List */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Transactions for this Day
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {transactions.length} paid cash transactions
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Receipt #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {transaction.receipt_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {transaction.patient_full_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(
                                                transaction.created_at
                                            ).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                            ₱
                                            {parseFloat(
                                                transaction.net_total
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 font-bold">
                                    <td
                                        colSpan="3"
                                        className="px-6 py-4 text-sm text-right text-gray-900"
                                    >
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                                        ₱
                                        {parseFloat(
                                            reconciliation.expected_cash
                                        ).toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
