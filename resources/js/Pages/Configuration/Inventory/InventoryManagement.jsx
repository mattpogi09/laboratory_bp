import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Pagination";
import LoadingOverlay from "@/Components/LoadingOverlay";
import {
    Search,
    Edit,
    Plus,
    Package,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Power,
    ArrowUpDown,
    Filter,
} from "lucide-react";
import CreateStockModal from "./CreateStockModal";
import AddStockModal from "./AddStockModal";
import StockOutModal from "./StockOutModal";
import AdjustStockModal from "./AdjustStockModal";
import ToggleItemModal from "./ToggleItemModal";

export default function InventoryIndex({
    auth,
    items = { data: [], links: [] },
    transactions = { data: [], links: [] },
    stats,
    categories = [],
    categoryStats = {},
    outOfStockItems = [],
    lowStockItems = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState("stock");
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || "all"
    );
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showStockOutModal, setShowStockOutModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Debounced search with 300ms delay
    useEffect(() => {
        // Skip if this is the initial mount or search hasn't changed
        if (searchQuery === (filters.search || "")) return;

        setIsSearching(true);
        const timer = setTimeout(() => {
            const params = { search: searchQuery || undefined };
            if (selectedStatus !== "all") params.status = selectedStatus;
            if (filters.sort_by) params.sort_by = filters.sort_by;
            if (filters.sort_order) params.sort_order = filters.sort_order;

            router.get(route("inventory"), params, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            });
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [searchQuery]);

    const handleSort = (column) => {
        const newOrder =
            filters.sort_by === column && filters.sort_order === "asc"
                ? "desc"
                : "asc";

        setIsLoading(true);
        const params = { sort_by: column, sort_order: newOrder };
        if (searchQuery) params.search = searchQuery;
        if (selectedStatus !== "all") params.status = selectedStatus;

        router.get(route("inventory"), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setSelectedStatus(value);

        setIsLoading(true);
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (value !== "all") params.status = value;
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.sort_order) params.sort_order = filters.sort_order;

        router.get(route("inventory"), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleAdjustStock = (item) => {
        setSelectedItem(item);
        setShowAdjustModal(true);
    };

    const handleToggleClick = (item) => {
        setSelectedItem(item);
        setShowToggleModal(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "good":
                return "bg-green-100 text-green-800 border-green-300";
            case "low_stock":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "out_of_stock":
                return "bg-red-100 text-red-800 border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStockTextColor = (status) => {
        switch (status) {
            case "good":
                return "text-green-600 font-semibold";
            case "low_stock":
                return "text-yellow-600 font-semibold";
            case "out_of_stock":
                return "text-red-600 font-semibold";
            default:
                return "text-gray-600";
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Inventory Management" />
            <LoadingOverlay
                show={isLoading || isSearching}
                message={isSearching ? "Searching..." : "Loading..."}
            />

            <div className="py-8">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Inventory Management
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Track and manage laboratory supplies and
                                    materials
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {auth.user.role === "admin" && (
                                    <>
                                        <button
                                            onClick={() =>
                                                setShowCreateModal(true)
                                            }
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                                        >
                                            <Plus className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                            <span className="text-sm sm:text-base">
                                                Create Stock
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowAddStockModal(true)
                                            }
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                                        >
                                            <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                            <span className="text-sm sm:text-base">
                                                Stock In
                                            </span>
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setShowStockOutModal(true)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                                >
                                    <TrendingDown className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">
                                        Stock Out
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stock Alerts - Compact Design */}
                    {(outOfStockItems?.length > 0 ||
                        lowStockItems?.length > 0) && (
                        <div className="mb-6 space-y-3">
                            {/* Red Alert for Out of Stock (Priority 1) */}
                            {outOfStockItems && outOfStockItems.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-semibold text-red-800">
                                                Critical: Out of Stock (
                                                {outOfStockItems.length})
                                            </span>
                                            <span className="text-xs text-red-700 ml-2">
                                                {outOfStockItems
                                                    .map((item) => item.name)
                                                    .join(", ")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Yellow Alert for Low Stock (Priority 2) */}
                            {lowStockItems && lowStockItems.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-semibold text-yellow-800">
                                                Low Stock Warning (
                                                {lowStockItems.length})
                                            </span>
                                            <span className="text-xs text-yellow-700 ml-2">
                                                {lowStockItems
                                                    .map((item) => item.name)
                                                    .join(", ")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 mb-6">
                        {categories.map((category) => (
                            <div
                                key={category}
                                className="p-2 sm:p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col gap-1 sm:gap-2">
                                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-500 font-medium">
                                        Category
                                    </p>
                                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-900 line-clamp-2 min-h-[24px] sm:min-h-[32px]">
                                        {category}
                                    </h3>
                                    <div className="text-xl sm:text-2xl font-bold text-black">
                                        {categoryStats[category] || 0}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stock Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">
                                    Out of Stock
                                </h3>
                                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.out_of_stock || 0}
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                                REQUIRES IMMEDIATE ATTENTION
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">
                                    Low Stock
                                </h3>
                                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.low_stock || 0}
                            </p>
                            <p className="text-sm text-yellow-600 mt-1">
                                WARNING
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">
                                    In Stock
                                </h3>
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.in_stock || 0}
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                                AVAILABLE
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-8 px-6">
                                <button
                                    onClick={() => setActiveTab("stock")}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === "stock"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    Stock Items
                                </button>
                                <button
                                    onClick={() => setActiveTab("transactions")}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === "transactions"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    Transaction Log
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === "stock" && (
                                <>
                                    {/* Search and Filter */}
                                    <div className="mb-6 flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search by item name or category..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                                className="min-h-[44px] sm:min-h-0 sm:h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 touch-manipulation"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            <select
                                                value={selectedStatus}
                                                onChange={handleStatusChange}
                                                className="min-h-[44px] sm:min-h-0 sm:h-10 w-full sm:w-48 rounded-lg border border-gray-900 bg-white pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer touch-manipulation"
                                            >
                                                <option value="all">
                                                    All Status
                                                </option>
                                                <option value="good">
                                                    In Stock
                                                </option>
                                                <option value="low_stock">
                                                    Low Stock
                                                </option>
                                                <option value="out_of_stock">
                                                    Out of Stock
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Stock Table */}
                                    {items.data?.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                No items found
                                            </h3>
                                            <p className="text-gray-500">
                                                {searchQuery
                                                    ? "Try adjusting your search"
                                                    : "Start by creating your first stock item"}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                                <table className="min-w-[800px] w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-200 bg-gray-50">
                                                            <th className="text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                                <div
                                                                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                                                    onClick={() =>
                                                                        handleSort(
                                                                            "name"
                                                                        )
                                                                    }
                                                                >
                                                                    Item Name ↕
                                                                </div>
                                                            </th>
                                                            <th className="hidden md:table-cell text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                                <div
                                                                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                                                    onClick={() =>
                                                                        handleSort(
                                                                            "category"
                                                                        )
                                                                    }
                                                                >
                                                                    Category ↕
                                                                </div>
                                                            </th>
                                                            <th className="text-right py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                                <div
                                                                    className="flex items-center gap-1 justify-end cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                                                    onClick={() =>
                                                                        handleSort(
                                                                            "current_stock"
                                                                        )
                                                                    }
                                                                >
                                                                    Current
                                                                    Stock ↕
                                                                </div>
                                                            </th>
                                                            <th className="hidden lg:table-cell text-right py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                                Minimum Stock
                                                            </th>
                                                            <th className="text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                                Stock Status
                                                            </th>
                                                            {auth.user.role ===
                                                                "admin" && (
                                                                <>
                                                                    <th className="hidden md:table-cell text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                                        Item
                                                                        Status
                                                                    </th>
                                                                    <th className="text-center py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                                        Actions
                                                                    </th>
                                                                </>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {items.data.map(
                                                            (item) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <td className="py-4 px-3 sm:px-6">
                                                                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td className="hidden md:table-cell py-4 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm">
                                                                        {
                                                                            item.category
                                                                        }
                                                                    </td>
                                                                    <td
                                                                        className={`py-4 px-3 sm:px-6 text-right text-xs sm:text-sm ${getStockTextColor(
                                                                            item.status
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            item.current_stock
                                                                        }{" "}
                                                                        {
                                                                            item.unit
                                                                        }
                                                                    </td>
                                                                    <td className="hidden lg:table-cell py-4 px-3 sm:px-6 text-right text-gray-600 text-xs sm:text-sm">
                                                                        {
                                                                            item.minimum_stock
                                                                        }{" "}
                                                                        {
                                                                            item.unit
                                                                        }
                                                                    </td>
                                                                    <td className="py-4 px-3 sm:px-6">
                                                                        <span
                                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                                                                item.status
                                                                            )}`}
                                                                        >
                                                                            {item.status ===
                                                                                "good" &&
                                                                                "Good"}
                                                                            {item.status ===
                                                                                "low_stock" &&
                                                                                "Low Stock"}
                                                                            {item.status ===
                                                                                "out_of_stock" &&
                                                                                "Out of Stock"}
                                                                        </span>
                                                                    </td>
                                                                    {auth.user
                                                                        .role ===
                                                                        "admin" && (
                                                                        <>
                                                                            <td className="hidden md:table-cell py-4 px-3 sm:px-6">
                                                                                <span
                                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                                        item.is_active
                                                                                            ? "bg-green-100 text-green-800"
                                                                                            : "bg-gray-100 text-gray-800"
                                                                                    }`}
                                                                                >
                                                                                    {item.is_active
                                                                                        ? "Active"
                                                                                        : "Inactive"}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-4 px-3 sm:px-6 text-center">
                                                                                <div className="flex items-center justify-center gap-2">
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleAdjustStock(
                                                                                                item
                                                                                            )
                                                                                        }
                                                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                                                                                    >
                                                                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                                        <span className="hidden sm:inline">
                                                                                            Adjust
                                                                                        </span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleToggleClick(
                                                                                                item
                                                                                            )
                                                                                        }
                                                                                        className={`inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 touch-manipulation ${
                                                                                            item.is_active
                                                                                                ? "text-red-600 hover:text-red-800"
                                                                                                : "text-green-600 hover:text-green-800"
                                                                                        }`}
                                                                                    >
                                                                                        <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                                        <span className="hidden sm:inline">
                                                                                            {item.is_active
                                                                                                ? "Deactivate"
                                                                                                : "Activate"}
                                                                                        </span>
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <Pagination links={items.links} />
                                        </>
                                    )}
                                </>
                            )}

                            {activeTab === "transactions" && (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                    {transactions.data &&
                                    transactions.data.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                No transactions yet
                                            </h3>
                                            <p className="text-gray-500">
                                                Transaction history will appear
                                                here
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <table className="min-w-[800px] w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200 bg-gray-50">
                                                        <th className="text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            Date
                                                        </th>
                                                        <th className="text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            Item
                                                        </th>
                                                        <th className="text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            Type
                                                        </th>
                                                        <th className="text-right py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            Quantity
                                                        </th>
                                                        <th className="hidden md:table-cell text-right py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            Previous Stock
                                                        </th>
                                                        <th className="hidden md:table-cell text-right py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            New Stock
                                                        </th>
                                                        <th className="hidden lg:table-cell text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            Transaction Code
                                                        </th>
                                                        <th className="hidden lg:table-cell text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            User
                                                        </th>
                                                        <th className="hidden lg:table-cell text-left py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">
                                                            Reason
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {transactions.data?.map(
                                                        (transaction) => (
                                                            <tr
                                                                key={
                                                                    transaction.id
                                                                }
                                                                className="hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="py-4 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm">
                                                                    {new Date(
                                                                        transaction.created_at
                                                                    ).toLocaleDateString(
                                                                        "en-US",
                                                                        {
                                                                            year: "numeric",
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                </td>
                                                                <td className="py-4 px-3 sm:px-6 font-medium text-gray-900 text-xs sm:text-sm">
                                                                    {
                                                                        transaction
                                                                            .item
                                                                            ?.name
                                                                    }
                                                                </td>
                                                                <td className="py-4 px-3 sm:px-6">
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            transaction.type ===
                                                                            "in"
                                                                                ? "bg-green-100 text-green-800"
                                                                                : "bg-red-100 text-red-800"
                                                                        }`}
                                                                    >
                                                                        {transaction.type ===
                                                                        "in" ? (
                                                                            <>
                                                                                <TrendingUp className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                                                Stock
                                                                                In
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <TrendingDown className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                                                Stock
                                                                                Out
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </td>
                                                                <td
                                                                    className={`py-4 px-3 sm:px-6 text-right font-semibold text-xs sm:text-sm ${
                                                                        transaction.type ===
                                                                        "in"
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                    }`}
                                                                >
                                                                    {transaction.type ===
                                                                    "in"
                                                                        ? "+"
                                                                        : "-"}
                                                                    {
                                                                        transaction.quantity
                                                                    }{" "}
                                                                    {
                                                                        transaction
                                                                            .item
                                                                            ?.unit
                                                                    }
                                                                </td>
                                                                <td className="hidden md:table-cell py-4 px-3 sm:px-6 text-right text-gray-600 text-xs sm:text-sm">
                                                                    {transaction.previous_stock !==
                                                                    null
                                                                        ? `${transaction.previous_stock} ${transaction.item?.unit}`
                                                                        : "-"}
                                                                </td>
                                                                <td className="hidden md:table-cell py-4 px-3 sm:px-6 text-right font-medium text-gray-900 text-xs sm:text-sm">
                                                                    {transaction.new_stock !==
                                                                    null
                                                                        ? `${transaction.new_stock} ${transaction.item?.unit}`
                                                                        : "-"}
                                                                </td>
                                                                <td className="hidden lg:table-cell py-4 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm">
                                                                    {transaction.transaction_code ||
                                                                        "-"}
                                                                </td>
                                                                <td className="hidden lg:table-cell py-4 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm">
                                                                    {
                                                                        transaction
                                                                            .user
                                                                            ?.name
                                                                    }
                                                                </td>
                                                                <td className="hidden lg:table-cell py-4 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm">
                                                                    {
                                                                        transaction.reason
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                            <Pagination
                                                links={transactions.links}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateStockModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            <AddStockModal
                items={items.data}
                show={showAddStockModal}
                onClose={() => setShowAddStockModal(false)}
            />
            <StockOutModal
                items={items.data}
                show={showStockOutModal}
                onClose={() => setShowStockOutModal(false)}
            />
            <AdjustStockModal
                item={selectedItem}
                show={showAdjustModal}
                onClose={() => setShowAdjustModal(false)}
            />
            <ToggleItemModal
                item={selectedItem}
                show={showToggleModal}
                onClose={() => setShowToggleModal(false)}
            />
        </DashboardLayout>
    );
}
