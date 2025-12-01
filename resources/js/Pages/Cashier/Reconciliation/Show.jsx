import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import {
    ArrowLeft,
    TrendingDown,
    TrendingUp,
    CheckCircle,
    Calendar,
    User,
    FileText,
    AlertTriangle,
} from "lucide-react";

export default function Show({ auth, reconciliation, transactions }) {
    const { flash } = usePage().props;
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [correctionReason, setCorrectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRequestCorrection = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            route(
                "cashier.reconciliation.request-correction",
                reconciliation.id
            ),
            { reason: correctionReason },
            {
                onSuccess: () => {
                    setShowCorrectionModal(false);
                    setCorrectionReason("");
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };
    const getStatusBadge = () => {
        if (reconciliation.variance == 0) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Balanced
                </span>
            );
        } else if (reconciliation.variance > 0) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Overage
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    Shortage
                </span>
            );
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Reconciliation Details" />

            <div className="py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                            <p className="text-sm text-green-800">
                                {flash.success}
                            </p>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                            <p className="text-sm text-red-800">
                                {flash.error}
                            </p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route("cashier.reconciliation.index")}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Reconciliation
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Reconciliation Details
                                </h2>
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
                            <div className="flex items-center gap-3">
                                {getStatusBadge()}
                                {!reconciliation.correction_requested &&
                                    !reconciliation.is_approved && (
                                        <button
                                            onClick={() =>
                                                setShowCorrectionModal(true)
                                            }
                                            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                                        >
                                            <AlertTriangle className="h-4 w-4" />
                                            Request Correction
                                        </button>
                                    )}
                                {reconciliation.correction_requested &&
                                    !reconciliation.is_approved && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                                            <AlertTriangle className="h-4 w-4" />
                                            Correction Requested
                                        </span>
                                    )}
                                {reconciliation.is_approved && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                        <CheckCircle className="h-4 w-4" />
                                        Approved
                                    </span>
                                )}
                            </div>
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
                                    From {reconciliation.transaction_count}{" "}
                                    transactions
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
                                <p className="text-sm text-gray-600 mb-1">
                                    Variance
                                </p>
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
                                    {parseFloat(
                                        reconciliation.variance
                                    ).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
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
                                                Date
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
                                                    {
                                                        transaction.patient_full_name
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(
                                                        transaction.created_at
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(
                                                        transaction.created_at
                                                    ).toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                            hour12: true,
                                                        }
                                                    )}
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
                                                colSpan="4"
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
                </div>
            </div>

            {/* Request Correction Modal */}
            <Modal
                show={showCorrectionModal}
                onClose={() => setShowCorrectionModal(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Request Correction
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Submit a correction request to the
                                administrator. Please explain why this
                                reconciliation needs to be corrected.
                            </p>

                            <form
                                onSubmit={handleRequestCorrection}
                                className="mt-4"
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Correction{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                    value={correctionReason}
                                    onChange={(e) =>
                                        setCorrectionReason(e.target.value)
                                    }
                                    rows={4}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                    placeholder="Example: Miscounted the cash, forgot to include some bills..."
                                    required
                                />

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCorrectionModal(false)
                                        }
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                                        disabled={
                                            isSubmitting ||
                                            !correctionReason.trim()
                                        }
                                    >
                                        {isSubmitting
                                            ? "Submitting..."
                                            : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
