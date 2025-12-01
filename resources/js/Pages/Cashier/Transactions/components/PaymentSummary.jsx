import { memo } from "react";
import { History } from "lucide-react";
import TextField from "./TextField";

function PaymentSummary({
    payment,
    onPaymentChange,
    notes,
    onNotesChange,
    totals,
    discountOptions = [],
    selectedDiscount,
    onSelectDiscount,
    philHealthOptions = [],
    selectedPhilHealth,
    onSelectPhilHealth,
    errors = {},
}) {
    const handlePaymentChange = (field) => (e) =>
        onPaymentChange(field, e.target.value);

    const discountOptionsSafe = [
        { id: "none", name: "No Discount", rate: 0 },
        ...discountOptions,
    ];

    const philHealthOptionsSafe = [
        { id: "none", name: "No PhilHealth", coverage_rate: 0 },
        ...philHealthOptions,
    ];

    return (
        <section className="rounded-xl bg-white p-6 shadow space-y-4">
            <header className="flex items-center gap-2">
                <History className="h-5 w-5 text-red-600" />
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Payment Summary
                    </h2>
                    <p className="text-sm text-gray-500">
                        Confirm tendered amount, discounts, and method
                    </p>
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        Payment Method
                    </label>
                    <select
                        value={payment.method}
                        onChange={handlePaymentChange("method")}
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    >
                        <option value="cash">Cash</option>
                    </select>
                </div>

                <TextField
                    label="Amount Paid"
                    type="text"
                    inputMode="decimal"
                    value={payment.amount_tendered}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers and decimal point
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            handlePaymentChange("amount_tendered")(e);
                        }
                    }}
                    error={errors["payment.amount_tendered"]}
                    style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                    }}
                />
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700">
                    Base Discount
                </label>
                <select
                    value={selectedDiscount?.id || "none"}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "none") {
                            onSelectDiscount({
                                id: "none",
                                name: "No Discount",
                                rate: 0,
                            });
                        } else {
                            const next = discountOptions.find(
                                (opt) => String(opt.id) === String(value)
                            );
                            if (next) onSelectDiscount(next);
                        }
                    }}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                    {discountOptionsSafe.map((option) => {
                        // Remove any existing percentage from the name
                        const cleanName = option.name.replace(
                            /\s*\(\d+(?:\.\d+)?%\)\s*$/,
                            ""
                        );
                        const displayName =
                            option.rate > 0
                                ? `${cleanName} (${parseFloat(option.rate)}%)`
                                : cleanName;

                        return (
                            <option key={option.id} value={option.id}>
                                {displayName}
                            </option>
                        );
                    })}
                </select>
                {selectedDiscount?.description && (
                    <p className="mt-1 text-xs text-gray-500">
                        {selectedDiscount.description}
                    </p>
                )}
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700">
                    PhilHealth Coverage
                </label>
                <select
                    value={selectedPhilHealth?.id || "none"}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "none") {
                            onSelectPhilHealth({
                                id: "none",
                                name: "No PhilHealth",
                                coverage_rate: 0,
                            });
                        } else {
                            const next = philHealthOptions.find(
                                (opt) => String(opt.id) === String(value)
                            );
                            if (next) onSelectPhilHealth(next);
                        }
                    }}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                    {philHealthOptionsSafe.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}{" "}
                            {option.coverage_rate > 0
                                ? `(${parseFloat(option.coverage_rate)}%)`
                                : ""}
                        </option>
                    ))}
                </select>
                {selectedPhilHealth?.description &&
                    selectedPhilHealth?.id !== "none" && (
                        <p className="mt-1 text-xs text-gray-500">
                            {selectedPhilHealth.description}
                        </p>
                    )}
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
                <dl className="space-y-2 text-sm text-gray-700">
                    <SummaryRow
                        label="Total Fee"
                        value={formatCurrency(totals.gross)}
                    />
                    {totals.discount > 0 && (
                        <SummaryRow
                            label="Discount"
                            value={`-₱${Number(
                                totals.discount || 0
                            ).toLocaleString()}`}
                            valueClass="text-red-600"
                        />
                    )}
                    {totals.philhealthCoverage > 0 && (
                        <SummaryRow
                            label="PhilHealth Coverage"
                            value={`-₱${Number(
                                totals.philhealthCoverage || 0
                            ).toLocaleString()}`}
                            valueClass="text-blue-600"
                        />
                    )}
                    <SummaryRow
                        label="Net Total"
                        value={formatCurrency(totals.net)}
                        valueClass="font-semibold text-gray-900"
                    />
                    <SummaryRow
                        label="Amount Paid"
                        value={formatCurrency(totals.tendered)}
                    />
                    <SummaryRow
                        label="Change Due"
                        value={formatCurrency(totals.change)}
                        valueClass="text-emerald-600"
                    />
                    <SummaryRow
                        label="Balance"
                        value={formatCurrency(totals.balance)}
                        valueClass="text-red-600"
                    />
                </dl>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700">
                    Notes (optional)
                </label>
                <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="Add remarks or instructions for lab staff"
                />
            </div>

            <button
                type="submit"
                className="w-full rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-red-700"
            >
                Confirm Transaction & Queue Patient
            </button>
        </section>
    );
}

export default memo(PaymentSummary);

function SummaryRow({ label, value, valueClass }) {
    return (
        <div className="flex justify-between">
            <dt>{label}</dt>
            <dd className={valueClass}>{value}</dd>
        </div>
    );
}

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}
