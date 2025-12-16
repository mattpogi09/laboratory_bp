import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import LoadingOverlay from "@/Components/LoadingOverlay";
import EmptyState from "@/Components/EmptyState";
import {
    Calendar,
    PhilippinePeso,
    Package,
    Shield,
    FileText,
    Download,
    Wallet,
} from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function ReportsLogsIndex({
    auth,
    filters = {},
    financial = {},
    labReport = {},
    inventoryLogs = {},
    auditLogs = {},
    reconciliationReport = {},
}) {
    const [activeTab, setActiveTab] = useState(filters.tab || "financial");
    const [dateFrom, setDateFrom] = useState(filters.from || "");
    const [dateTo, setDateTo] = useState(filters.to || "");
    const [selectedPeriod, setSelectedPeriod] = useState(
        filters.period || null
    );
    const [isLoading, setIsLoading] = useState(false);

    const totals = financial.totals || {
        revenue: 0,
        discounts: 0,
        transactions: 0,
    };
    const financialRows = financial.rows || [];
    const labStats = labReport.stats || {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        released: 0,
    };
    const labRows = labReport.rows || [];
    const inventoryData = inventoryLogs.data || [];
    const auditData = auditLogs.data || [];
    const reconciliationData = reconciliationReport.data || [];
    const reconciliationStats = reconciliationReport.stats || {
        total_count: 0,
        balanced_count: 0,
        overage_count: 0,
        shortage_count: 0,
        total_expected: 0,
        total_actual: 0,
        total_overage: 0,
        total_shortage: 0,
        total_variance: 0,
        accuracy_rate: 0,
    };

    const submitFilters = () => {
        setIsLoading(true);
        const params = {};
        if (dateFrom) params.from = dateFrom;
        if (dateTo) params.to = dateTo;
        if (selectedPeriod) params.period = selectedPeriod;

        router.get(route("reports-logs"), params, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        setDateFrom("");
        setDateTo("");
        setIsLoading(true);

        router.get(
            route("reports-logs"),
            { period, tab: activeTab },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const exportLabReportToCSV = () => {
        if (labRows.length === 0) {
            alert("No data to export.");
            return;
        }

        // CSV Headers
        const headers = [
            "Date",
            "Transaction",
            "Patient",
            "Test",
            "Performed By",
            "Status",
        ];

        // Convert data to CSV rows
        const csvRows = labRows.map((row) => {
            const date = row.date || "";
            const transaction = row.transaction_number || "";
            const patient = (row.patient || "").replace(/"/g, '""'); // Escape quotes
            const test = (row.test_name || "").replace(/"/g, '""');
            const performedBy = (row.performed_by || "").replace(/"/g, '""');
            const status = (row.status || "")
                .replace("_", " ")
                .replace(/"/g, '""');

            return `"${date}","${transaction}","${patient}","${test}","${performedBy}","${status}"`;
        });

        // Combine headers and rows
        const csvContent = [
            headers.map((h) => `"${h}"`).join(","),
            ...csvRows,
        ].join("\n");

        // Create BOM for UTF-8 (helps Excel open it correctly)
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        // Create download link
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        // Generate filename with date range if available
        let filename = "lab_report";
        if (dateFrom || dateTo) {
            const fromStr = dateFrom ? dateFrom.replace(/-/g, "") : "all";
            const toStr = dateTo ? dateTo.replace(/-/g, "") : "all";
            filename = `lab_report_${fromStr}_to_${toStr}`;
        } else if (selectedPeriod) {
            filename = `lab_report_${selectedPeriod}`;
        }
        filename += `_${new Date().toISOString().split("T")[0]}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportFinancialReportToCSV = () => {
        if (financialRows.length === 0) {
            alert("No data to export.");
            return;
        }

        // CSV Headers
        const headers = [
            "Date",
            "Transaction Code",
            "Patient",
            "Tests",
            "Gross",
            "Discount",
            "Net Amount",
            "Payment Method",
            "Performed By",
        ];

        // Convert data to CSV rows
        const csvRows = financialRows.map((row) => {
            const date = row.date || "";
            const transaction = (row.transaction_number || "").replace(
                /"/g,
                '""'
            );
            const patient = (row.patient || "").replace(/"/g, '""');
            const tests = (row.tests || "").replace(/"/g, '""');
            const gross = row.amount || 0;
            const discount = row.discount_amount || 0;
            const netAmount = row.net_amount || 0;
            const paymentMethod = (row.payment_method || "").replace(
                /"/g,
                '""'
            );
            const performedBy = (row.performed_by || "Unknown").replace(
                /"/g,
                '""'
            );

            return `"${date}","${transaction}","${patient}","${tests}","${gross}","${discount}","${netAmount}","${paymentMethod}","${performedBy}"`;
        });

        // Combine headers and rows
        const csvContent = [
            headers.map((h) => `"${h}"`).join(","),
            ...csvRows,
        ].join("\n");

        // Create BOM for UTF-8 (helps Excel open it correctly)
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        // Create download link
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        // Generate filename with date range if available
        let filename = "financial_report";
        if (dateFrom || dateTo) {
            const fromStr = dateFrom ? dateFrom.replace(/-/g, "") : "all";
            const toStr = dateTo ? dateTo.replace(/-/g, "") : "all";
            filename = `financial_report_${fromStr}_to_${toStr}`;
        } else if (selectedPeriod) {
            filename = `financial_report_${selectedPeriod}`;
        }
        filename += `_${new Date().toISOString().split("T")[0]}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportReconciliationToCSV = () => {
        if (reconciliationData.length === 0) {
            alert("No data to export.");
            return;
        }

        // CSV Headers
        const headers = [
            "Date",
            "Cashier",
            "Expected Cash",
            "Actual Cash",
            "Variance",
            "Status",
            "Transaction Count",
            "Notes",
            "Reconciled At",
        ];

        // Convert data to CSV rows
        const csvRows = reconciliationData.map((row) => {
            const date = row.date || "";
            const cashier = (row.cashier || "").replace(/"/g, '""');
            const expected = row.expected_cash || 0;
            const actual = row.actual_cash || 0;
            const variance = row.variance || 0;
            const status = (row.variance_type || "").replace(/"/g, '""');
            const transactionCount = row.transaction_count || 0;
            const notes = (row.notes || "")
                .replace(/"/g, '""')
                .replace(/\n/g, " ");
            const reconciledAt = row.created_at || "";

            return `"${date}","${cashier}","${expected}","${actual}","${variance}","${status}","${transactionCount}","${notes}","${reconciledAt}"`;
        });

        // Add summary statistics
        const summaryRows = [
            "",
            `"Summary Statistics"`,
            `"Total Reconciliations","${reconciliationStats.total_count}"`,
            `"Balanced","${reconciliationStats.balanced_count} (${reconciliationStats.accuracy_rate}%)"`,
            `"Overage Count","${reconciliationStats.overage_count}"`,
            `"Shortage Count","${reconciliationStats.shortage_count}"`,
            `"Total Expected","₱${Number(
                reconciliationStats.total_expected
            ).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
            `"Total Actual","₱${Number(
                reconciliationStats.total_actual
            ).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
            `"Total Overage","₱${Number(
                reconciliationStats.total_overage
            ).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
            `"Total Shortage","₱${Number(
                reconciliationStats.total_shortage
            ).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
            `"Net Variance","₱${Number(
                reconciliationStats.total_variance
            ).toLocaleString("en-US", { minimumFractionDigits: 2 })}"`,
        ];

        // Combine headers, rows, and summary
        const csvContent = [
            headers.map((h) => `"${h}"`).join(","),
            ...csvRows,
            ...summaryRows,
        ].join("\n");

        // Create BOM for UTF-8
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        // Create download link
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        // Generate filename with date range if available
        let filename = "cash_reconciliation";
        if (dateFrom || dateTo) {
            const fromStr = dateFrom ? dateFrom.replace(/-/g, "") : "all";
            const toStr = dateTo ? dateTo.replace(/-/g, "") : "all";
            filename = `cash_reconciliation_${fromStr}_to_${toStr}`;
        } else if (selectedPeriod) {
            filename = `cash_reconciliation_${selectedPeriod}`;
        }
        filename += `_${new Date().toISOString().split("T")[0]}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Reports & Logs" />
            <LoadingOverlay show={isLoading} message="Loading..." />

            <div className="mb-6">
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                    Reports & Logs
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                    Financial reports, inventory logs, and security audit trails
                </p>
            </div>

            <div className="mb-6 space-y-4">
                {/* Period Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {["day", "week", "month", "year"].map((period) => (
                        <button
                            key={period}
                            onClick={() => handlePeriodChange(period)}
                            className={`px-3 sm:px-4 py-2 min-h-[44px] sm:min-h-0 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                                selectedPeriod === period
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Date Range Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 bg-white shadow-md rounded-lg">
                    <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-gray-400 hidden sm:block" />
                    <DateField
                        label="From"
                        value={dateFrom}
                        onChange={(value) => {
                            setDateFrom(value);
                            setSelectedPeriod(null);
                        }}
                    />
                    <DateField
                        label="To"
                        value={dateTo}
                        onChange={(value) => {
                            setDateTo(value);
                            setSelectedPeriod(null);
                        }}
                    />
                    <Button
                        onClick={submitFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto sm:ml-auto min-h-[44px] sm:min-h-0 touch-manipulation"
                    >
                        Generate Report
                    </Button>
                </div>
            </div>

            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "financial" && (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                        <StatCard
                            label="Total Revenue"
                            value={`₱${Number(
                                totals.revenue
                            ).toLocaleString()}`}
                            accent="text-emerald-600"
                        />
                        <StatCard
                            label="Total Discounts"
                            value={`₱${Number(
                                totals.discounts
                            ).toLocaleString()}`}
                            accent="text-yellow-600"
                        />
                        <StatCard
                            label="Transactions"
                            value={totals.transactions}
                        />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">
                                    Financial Report
                                </p>
                                <p className="text-xs text-gray-500">
                                    Transaction details and revenue
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation text-xs sm:text-sm"
                                onClick={exportFinancialReportToCSV}
                            >
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Export CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Date
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Transaction Code
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Patient
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Tests
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Gross
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Discount
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Net Amount
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Payment
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Performed By
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {financialRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="px-0 py-0"
                                            >
                                                <EmptyState
                                                    icon={PhilippinePeso}
                                                    title="No Financial Data"
                                                    description="No transactions for this date range."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        financialRows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.date}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-900">
                                                    {row.transaction_number ||
                                                        "—"}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.patient}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">
                                                    {row.tests}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    ₱
                                                    {Number(
                                                        row.amount
                                                    ).toLocaleString()}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-red-600">
                                                    {row.discount_amount > 0
                                                        ? `-₱${Number(
                                                              row.discount_amount
                                                          ).toLocaleString()}`
                                                        : "—"}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-emerald-600">
                                                    ₱
                                                    {Number(
                                                        row.net_amount
                                                    ).toLocaleString()}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-blue-600 capitalize">
                                                    {row.payment_method}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.performed_by ||
                                                        "Unknown"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "inventory" && (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[800px] w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Date
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Transaction Code
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Item
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Type
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Quantity
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">
                                        Previous Stock
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">
                                        New Stock
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Performed By
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Reason
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {inventoryData.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-0 py-0">
                                            <EmptyState
                                                icon={Package}
                                                title="No Inventory Activity"
                                                description="No inventory transactions for this date range."
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    inventoryData.map((log, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                {log.date}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                {log.transactionCode || "-"}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                {log.item}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        log.type === "IN"
                                                            ? "bg-emerald-500/10 text-emerald-600"
                                                            : "bg-red-500/10 text-red-600"
                                                    }`}
                                                >
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-center text-gray-900">
                                                {log.quantity}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm text-gray-600">
                                                {log.previousStock !== null
                                                    ? log.previousStock
                                                    : "-"}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-900">
                                                {log.newStock !== null
                                                    ? log.newStock
                                                    : "-"}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                {log.performedBy}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">
                                                {log.reason}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "audit" && (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[800px] w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Timestamp
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        User
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Action
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {auditData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-0 py-0">
                                            <EmptyState
                                                icon={Shield}
                                                title="No Audit Logs"
                                                description="No audit logs for this date range."
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    auditData.map((log, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                {log.timestamp}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                {log.user}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        log.severity ===
                                                        "critical"
                                                            ? "bg-red-100 text-red-700"
                                                            : log.severity ===
                                                              "warning"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-blue-100 text-blue-700"
                                                    }`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "reconciliation" && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
                        <StatCard
                            label="Total Reconciliations"
                            value={reconciliationStats.total_count}
                        />
                        <StatCard
                            label="Balanced"
                            value={`${reconciliationStats.balanced_count} (${reconciliationStats.accuracy_rate}%)`}
                            accent="text-green-600"
                        />
                        <StatCard
                            label="Overage"
                            value={`${
                                reconciliationStats.overage_count
                            } | ₱${Number(
                                reconciliationStats.total_overage
                            ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                            })}`}
                            accent="text-blue-600"
                        />
                        <StatCard
                            label="Shortage"
                            value={`${
                                reconciliationStats.shortage_count
                            } | ₱${Number(
                                reconciliationStats.total_shortage
                            ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                            })}`}
                            accent="text-red-600"
                        />
                        <StatCard
                            label="Net Variance"
                            value={`₱${Number(
                                reconciliationStats.total_variance
                            ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`}
                            accent={
                                reconciliationStats.total_variance >= 0
                                    ? "text-blue-600"
                                    : "text-red-600"
                            }
                        />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">
                                    Cash Reconciliation Report
                                </p>
                                <p className="text-xs text-gray-500">
                                    End-of-day cash counting records
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation text-xs sm:text-sm"
                                onClick={exportReconciliationToCSV}
                            >
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Export CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Date
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Cashier
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">
                                            Expected Cash
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">
                                            Actual Cash
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">
                                            Variance
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                                            Status
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                                            Transactions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reconciliationData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-0 py-0"
                                            >
                                                <EmptyState
                                                    icon={Wallet}
                                                    title="No Reconciliation Records"
                                                    description="No reconciliation records found for this date range."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        reconciliationData.map((rec) => (
                                            <tr
                                                key={rec.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {rec.date}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {rec.cashier}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900 text-right">
                                                    ₱
                                                    {Number(
                                                        rec.expected_cash
                                                    ).toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900 text-right">
                                                    ₱
                                                    {Number(
                                                        rec.actual_cash
                                                    ).toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>
                                                <td
                                                    className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-right ${
                                                        rec.variance == 0
                                                            ? "text-green-600"
                                                            : rec.variance > 0
                                                            ? "text-blue-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {rec.variance > 0
                                                        ? "+"
                                                        : ""}
                                                    ₱
                                                    {Number(
                                                        rec.variance
                                                    ).toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            rec.status ===
                                                            "balanced"
                                                                ? "bg-green-100 text-green-800"
                                                                : rec.status ===
                                                                  "overage"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {rec.variance_type}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700 text-center">
                                                    {rec.transaction_count}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "lab" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard label="Total Tests" value={labStats.total} />
                        <StatCard
                            label="Pending"
                            value={labStats.pending}
                            accent="text-red-600"
                        />
                        <StatCard
                            label="Processing"
                            value={labStats.processing}
                            accent="text-yellow-600"
                        />
                        <StatCard
                            label="Completed"
                            value={labStats.completed}
                            accent="text-blue-600"
                        />
                        <StatCard
                            label="Released"
                            value={labStats.released}
                            accent="text-green-600"
                        />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">
                                    Lab Report
                                </p>
                                <p className="text-xs text-gray-500">
                                    Live feed from the laboratory queue
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation text-xs sm:text-sm"
                                onClick={exportLabReportToCSV}
                            >
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Export CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-white">
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Date
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Transaction
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Patient
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Test
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Performed By
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {labRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-0 py-0"
                                            >
                                                <EmptyState
                                                    icon={FileText}
                                                    title="No Lab Activity"
                                                    description="No lab activity in this range."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        labRows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.date}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.transaction_number}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.patient}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.test_name}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-900">
                                                    {row.performed_by}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(
                                                            row.status
                                                        )}`}
                                                    >
                                                        {row.status?.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function TabBar({ activeTab, setActiveTab }) {
    const tabs = [
        { id: "financial", label: "Financial Report", icon: PhilippinePeso },
        { id: "reconciliation", label: "Cash Reconciliation", icon: Wallet },
        { id: "inventory", label: "Inventory Log", icon: Package },
        { id: "audit", label: "Audit Log", icon: Shield },
        { id: "lab", label: "Lab Report", icon: FileText },
    ];

    return (
        <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-3 sm:gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-1 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap min-h-[44px] sm:min-h-0 touch-manipulation ${
                            activeTab === tab.id
                                ? "text-black"
                                : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, accent = "text-gray-900" }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{label}</p>
            <p className={`text-lg sm:text-2xl font-semibold ${accent}`}>
                {value}
            </p>
        </div>
    );
}

function DateField({ label, value, onChange }) {
    return (
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-gray-600">{label}:</span>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-900 rounded text-gray-900 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 touch-manipulation"
            />
        </div>
    );
}

function severityColor(severity) {
    switch (severity) {
        case "critical":
            return "text-red-500";
        case "warning":
            return "text-yellow-500";
        case "info":
        default:
            return "text-blue-500";
    }
}

function statusBadge(status) {
    switch (status) {
        case "pending":
            return "bg-red-500/10 text-red-700";
        case "processing":
            return "bg-yellow-500/10 text-yellow-700";
        case "completed":
            return "bg-blue-500/10 text-blue-700";
        case "released":
            return "bg-green-500/10 text-green-700";
        default:
            return "bg-gray-500/10 text-gray-700";
    }
}
