import { Head, router, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    PhilippinePeso,
    Users,
    AlertTriangle,
    Clock,
    TrendingUp,
    TrendingDown,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import LineChartComponent from "@/Components/Charts/LineChartComponent";
import BarChartComponent from "@/Components/Charts/BarChartComponent";
import DoughnutChartComponent from "@/Components/Charts/DoughnutChartComponent";

export default function Dashboard({
    auth,
    stats,
    period,
    pendingTasks,
    lowStockItems = [],
    outOfStockItems = [],
    revenueChartData,
    testStatusData,
    dailyRevenue,
    topTests = [],
    alerts = [],
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || "day");

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        router.get(
            route("dashboard"),
            { period: newPeriod },
            { preserveState: true }
        );
    };

    const getPeriodLabel = (period) => {
        const labels = {
            day: "Today",
            week: "This Week",
            month: "This Month",
            year: "This Year",
        };
        return labels[period] || "Today";
    };

    const getWelcomeMessage = (period) => {
        const messages = {
            day: "Welcome back! Here's what's happening today.",
            week: "Welcome back! Here's what's happening this week.",
            month: "Welcome back! Here's what's happening this month.",
            year: "Welcome back! Here's what's happening this year.",
        };
        return (
            messages[period] || "Welcome back! Here's what's happening today."
        );
    };

    const statsCards = [
        {
            title: `Total Revenue ${getPeriodLabel(selectedPeriod)}`,
            value: `₱${stats.totalRevenue}`,
            trend: stats.revenueTrend,
            icon: PhilippinePeso,
            color: "bg-emerald-500",
            route: "reports-logs",
        },
        {
            title: `Patients ${getPeriodLabel(selectedPeriod)}`,
            value: stats.patientsCount,
            trend: stats.patientsTrend,
            icon: Users,
            color: "bg-blue-500",
            route: "patients.index",
        },
        {
            title: "Low Stock Items",
            value: stats.lowStockItems,
            icon: AlertTriangle,
            color: "bg-amber-500",
            route: "inventory",
        },
        {
            title: "Pending Tests",
            value: stats.pendingTests,
            icon: Clock,
            color: "bg-purple-500",
            route: "reports-logs",
        },
    ];

    // Prepare data for Evil Charts (Recharts format)
    const revenueLineData = revenueChartData.map((item) => ({
        label: item.label,
        value: item.value,
    }));

    const dailyRevenueBarData = dailyRevenue.map((item) => ({
        label: item.date,
        value: item.revenue,
    }));

    const testStatusDoughnutData = [
        { name: "Pending", value: testStatusData.pending },
        { name: "Processing", value: testStatusData.processing },
        { name: "Completed", value: testStatusData.completed },
        { name: "Released", value: testStatusData.released },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Dashboard" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        {getWelcomeMessage(selectedPeriod)}
                    </p>
                </div>

                {/* Period Filter */}
                <div className="flex gap-2 w-full sm:w-auto">
                    {["day", "week", "month", "year"].map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePeriodChange(p)}
                            className={cn(
                                "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation",
                                selectedPeriod === p
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            )}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts Banner */}
            {alerts && alerts.length > 0 && (
                <div className="mb-6 space-y-2 sm:space-y-3">
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={cn(
                                "rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0",
                                alert.type === "critical"
                                    ? "bg-red-50 border border-red-200"
                                    : alert.type === "shortage"
                                    ? "bg-red-50 border border-red-200"
                                    : alert.type === "overage"
                                    ? "bg-blue-50 border border-blue-200"
                                    : alert.type === "warning"
                                    ? "bg-amber-50 border border-amber-200"
                                    : "bg-blue-50 border border-blue-200"
                            )}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <AlertTriangle
                                    className={cn(
                                        "h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0",
                                        alert.type === "critical"
                                            ? "text-red-600"
                                            : alert.type === "shortage"
                                            ? "text-red-600"
                                            : alert.type === "overage"
                                            ? "text-blue-600"
                                            : alert.type === "warning"
                                            ? "text-amber-600"
                                            : "text-blue-600"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-xs sm:text-sm font-medium",
                                        alert.type === "critical"
                                            ? "text-red-900"
                                            : alert.type === "shortage"
                                            ? "text-red-900"
                                            : alert.type === "overage"
                                            ? "text-blue-900"
                                            : alert.type === "warning"
                                            ? "text-amber-900"
                                            : "text-blue-900"
                                    )}
                                >
                                    {alert.message}
                                </span>
                            </div>
                            <Link
                                href={route(alert.route, alert.params || {})}
                                className={cn(
                                    "text-xs sm:text-sm font-medium hover:underline flex items-center gap-1 ml-6 sm:ml-0",
                                    alert.type === "critical"
                                        ? "text-red-700"
                                        : alert.type === "shortage"
                                        ? "text-red-700"
                                        : alert.type === "overage"
                                        ? "text-blue-700"
                                        : alert.type === "warning"
                                        ? "text-amber-700"
                                        : "text-blue-700"
                                )}
                            >
                                {alert.action}
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {statsCards.map((stat, index) => (
                    <Link
                        key={index}
                        href={route(stat.route)}
                        className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                    >
                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center flex-1 gap-3 sm:gap-4">
                                <div
                                    className={cn(
                                        "p-2 sm:p-3 rounded-lg transition-transform duration-300 group-hover:scale-110 flex-shrink-0",
                                        stat.color
                                    )}
                                >
                                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                                        {stat.title}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mt-1">
                                        <p className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                                            {stat.value}
                                        </p>
                                        {stat.trend !== undefined && (
                                            <span
                                                className={cn(
                                                    "text-xs font-medium flex items-center gap-0.5",
                                                    stat.trend > 0
                                                        ? "text-green-600"
                                                        : stat.trend < 0
                                                        ? "text-red-600"
                                                        : "text-gray-500"
                                                )}
                                            >
                                                {stat.trend > 0 ? (
                                                    <>
                                                        <TrendingUp className="h-3 w-3" />{" "}
                                                        {stat.trend}%
                                                    </>
                                                ) : stat.trend < 0 ? (
                                                    <>
                                                        <TrendingDown className="h-3 w-3" />{" "}
                                                        {Math.abs(stat.trend)}%
                                                    </>
                                                ) : (
                                                    "0%"
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Top Performing Tests */}
            {topTests && topTests.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                            Top Performing Tests
                        </h2>
                        <Link
                            href={route("reports-logs")}
                            className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                        >
                            View All
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Link>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {topTests.map((test, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <span
                                        className={cn(
                                            "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0",
                                            index === 0
                                                ? "bg-yellow-100 text-yellow-700"
                                                : index === 1
                                                ? "bg-gray-100 text-gray-700"
                                                : index === 2
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-blue-50 text-blue-600"
                                        )}
                                    >
                                        #{index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                            {test.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {test.count} tests ordered
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-emerald-600 ml-2 flex-shrink-0">
                                    ₱{test.revenue}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Top Performing Tests
                    </h2>
                    <p className="text-gray-500 text-center py-8 text-sm">
                        No test data available for this period
                    </p>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Revenue Trend - {getPeriodLabel(selectedPeriod)}
                    </h2>
                    <div className="h-64 sm:h-72 lg:h-80">
                        <LineChartComponent
                            data={revenueLineData}
                            dataKey="value"
                            nameKey="label"
                            color="#10b981"
                        />
                    </div>
                </div>

                {/* Test Status Distribution */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Test Status Distribution
                    </h2>
                    <div className="h-64 sm:h-72 lg:h-80">
                        <DoughnutChartComponent data={testStatusDoughnutData} />
                    </div>
                </div>
            </div>

            {/* Daily Revenue Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Last 7 Days Revenue
                </h2>
                <div className="h-64 sm:h-72 lg:h-80">
                    <BarChartComponent
                        data={dailyRevenueBarData}
                        dataKey="value"
                        nameKey="label"
                        color="#3b82f6"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Stock Status Items */}
                {(outOfStockItems?.length > 0 || lowStockItems?.length > 0) && (
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                Stock Status
                            </h2>
                            <Link
                                href={route("inventory")}
                                className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                View All
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {/* Out of Stock Items */}
                            {outOfStockItems &&
                                outOfStockItems.map((item, index) => (
                                    <div
                                        key={`out-${index}`}
                                        className="space-y-1.5 sm:space-y-2"
                                    >
                                        <div className="flex justify-between items-end gap-2">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-sm sm:text-base text-gray-900 block truncate">
                                                    {item.name}
                                                </span>
                                                <span className="text-xs sm:text-sm text-red-600">
                                                    Out of Stock:{" "}
                                                    {item.current_stock}{" "}
                                                    {item.unit}
                                                </span>
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-red-600 flex-shrink-0">
                                                0%
                                            </span>
                                        </div>
                                        <div className="h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-2 sm:h-2.5 bg-red-500 rounded-full"
                                                style={{ width: "0%" }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            {/* Low Stock Items */}
                            {lowStockItems &&
                                lowStockItems.map((item, index) => {
                                    const shortage =
                                        item.minimum_stock - item.current_stock;
                                    const percentage =
                                        item.minimum_stock > 0
                                            ? Math.round(
                                                  (item.current_stock /
                                                      item.minimum_stock) *
                                                      100
                                              )
                                            : 0;
                                    return (
                                        <div
                                            key={`low-${index}`}
                                            className="space-y-1.5 sm:space-y-2"
                                        >
                                            <div className="flex justify-between items-end gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-medium text-sm sm:text-base text-gray-900 block truncate">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-xs sm:text-sm text-yellow-600">
                                                        {item.current_stock} /{" "}
                                                        {item.minimum_stock}{" "}
                                                        {item.unit}
                                                    </span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-semibold text-yellow-600 flex-shrink-0">
                                                    {shortage} needed
                                                </span>
                                            </div>
                                            <div className="h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-2 sm:h-2.5 bg-yellow-500 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${Math.min(
                                                            percentage,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            {(!outOfStockItems ||
                                outOfStockItems.length === 0) &&
                                (!lowStockItems ||
                                    lowStockItems.length === 0) && (
                                    <p className="text-gray-500 text-center py-4 text-sm">
                                        All items are in stock
                                    </p>
                                )}
                        </div>
                    </div>
                )}

                {/* Pending Tasks */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                            Pending Lab Tasks
                        </h2>
                        <Link
                            href={route("reports-logs")}
                            className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                        >
                            View All
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Link>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        {pendingTasks && pendingTasks.length > 0 ? (
                            pendingTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                            {task.patient}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                                            {task.test}
                                        </p>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:text-right">
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            {task.time}
                                        </p>
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                                task.status === "pending"
                                                    ? "bg-red-100 text-red-700"
                                                    : task.status ===
                                                      "processing"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : task.status ===
                                                      "completed"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : task.status === "released"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            )}
                                        >
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4 text-sm">
                                No pending tasks
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
