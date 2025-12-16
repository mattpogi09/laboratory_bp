import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Calculator, Save, AlertTriangle } from "lucide-react";

export default function Create({
    auth,
    expectedCash,
    transactionCount,
    reconciliationDate,
}) {
    const { data, setData, post, processing, errors } = useForm({
        actual_cash: "",
        notes: "",
    });

    const [variance, setVariance] = useState(null);
    const [showVariance, setShowVariance] = useState(false);

    const calculateVariance = () => {
        const actual = parseFloat(data.actual_cash) || 0;
        const expected = parseFloat(expectedCash);
        const diff = actual - expected;
        setVariance(diff);
        setShowVariance(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("cashier.reconciliation.store"));
    };

    const getVarianceStatus = () => {
        if (variance === null) return null;

        if (variance === 0) {
            return (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-green-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                                Perfect! Cash is Balanced
                            </h3>
                            <p className="mt-1 text-sm text-green-700">
                                The cash count matches the system total exactly.
                            </p>
                        </div>
                    </div>
                </div>
            );
        } else if (variance > 0) {
            return (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Cash Overage Detected
                            </h3>
                            <p className="mt-1 text-sm text-blue-700">
                                You have{" "}
                                <span className="font-bold">
                                    ₱
                                    {variance.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>{" "}
                                more than expected. Please double-check your
                                count and verify all transactions.
                            </p>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Cash Shortage Detected
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                You are short by{" "}
                                <span className="font-bold">
                                    ₱
                                    {Math.abs(variance).toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </span>
                                . Please recount your cash and verify all
                                transactions before submitting.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="End-of-Day Reconciliation" />

            <div className="py-4 sm:py-6 lg:py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route("cashier.reconciliation.index")}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Reconciliation
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900">
                            End-of-Day Cash Reconciliation
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {new Date(reconciliationDate).toLocaleDateString(
                                "en-US",
                                {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }
                            )}
                        </p>
                    </div>

                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden">
                        <div className="p-6">
                            {/* Expected Summary */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Today's Summary
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Total Transactions
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {transactionCount}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Expected Cash Total
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            ₱
                                            {parseFloat(
                                                expectedCash
                                            ).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Actual Cash Input */}
                                <div>
                                    <label
                                        htmlFor="actual_cash"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Actual Cash Count{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Count all cash in the drawer and enter
                                        the total amount
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="number"
                                            id="actual_cash"
                                            step="0.01"
                                            min="0"
                                            value={data.actual_cash}
                                            onChange={(e) =>
                                                setData(
                                                    "actual_cash",
                                                    e.target.value
                                                )
                                            }
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="0.00"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={calculateVariance}
                                            disabled={!data.actual_cash}
                                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Calculator className="w-4 h-4 mr-2" />
                                            Calculate
                                        </button>
                                    </div>
                                    {errors.actual_cash && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.actual_cash}
                                        </p>
                                    )}
                                </div>

                                {/* Variance Display */}
                                {showVariance && getVarianceStatus()}

                                {/* Notes */}
                                <div>
                                    <label
                                        htmlFor="notes"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Notes (Optional)
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Add any notes about discrepancies or
                                        special circumstances
                                    </p>
                                    <textarea
                                        id="notes"
                                        rows={4}
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
                                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Example: Found extra ₱20 bill in register, possible from previous day..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                    <Link
                                        href={route(
                                            "cashier.reconciliation.index"
                                        )}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={
                                            processing || !data.actual_cash
                                        }
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Submit Reconciliation
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                            💡 Cash Counting Tips
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>
                                Count all bills and coins from the cash drawer
                            </li>
                            <li>
                                Separate denominations to avoid counting errors
                            </li>
                            <li>Double-check your count before submitting</li>
                            <li>
                                Document any unusual circumstances in the notes
                            </li>
                            <li>
                                If there's a variance, recount before submitting
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
