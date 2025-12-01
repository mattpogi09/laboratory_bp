import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import EmptyState from "@/Components/EmptyState";
import LoadingOverlay from "@/Components/LoadingOverlay";
import Pagination from "@/Components/Pagination";
import {
    Search,
    Edit,
    Plus,
    TestTube,
    Power,
    PowerOff,
    Filter,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import EditServiceModal from "./EditServiceModal";
import CreateServiceModal from "./CreateServiceModal";
import ToggleServiceModal from "./ToggleServiceModal";

export default function ServicesIndex({
    auth,
    tests = { data: [], links: [] },
    categories,
    categoryStats = {},
    filters = {},
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || "all"
    );
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);

    const testsData = tests.data || [];

    // Debounced search
    useEffect(() => {
        if (searchQuery === (filters.search || "")) return;

        setIsSearching(true);
        const timer = setTimeout(() => {
            const params = { search: searchQuery || undefined };
            if (selectedCategory !== "all") params.category = selectedCategory;

            router.get(route("services.index"), params, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSearching(false),
            });
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSelectedCategory(value);

        setIsLoading(true);
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (value !== "all") params.category = value;

        router.get(route("services.index"), params, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleToggleClick = (service) => {
        setSelectedService(service);
        setShowToggleModal(true);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Service Management" />
            <LoadingOverlay
                show={isLoading || isSearching}
                message={isSearching ? "Searching..." : "Loading..."}
            />

            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Service Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                    Manage laboratory tests and services
                </p>
            </div>

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
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">
                                {categoryStats[category] || 0}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search tests by name or category..."
                        className="min-h-[44px] sm:min-h-0 sm:h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 touch-manipulation"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="min-h-[44px] sm:min-h-0 sm:h-10 w-full sm:w-48 rounded-lg border border-gray-900 bg-white pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer touch-manipulation"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="min-h-[44px] sm:min-h-0 bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
                >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    <span className="text-xs sm:text-sm">Add Service</span>
                </Button>
            </div>

            {/* Services Table */}
            {testsData.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Test Name
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Category
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Price
                                    </th>
                                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Description
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {testsData.map((service) => (
                                    <tr
                                        key={service.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                                            {service.name}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className="text-xs sm:text-sm text-gray-600">
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className="text-xs sm:text-sm font-medium text-emerald-600">
                                                ₱
                                                {parseFloat(
                                                    service.price
                                                ).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                                            {service.description}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span
                                                className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                                                    service.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {service.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(service)
                                                    }
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors p-1.5 sm:p-0 touch-manipulation"
                                                >
                                                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">
                                                        Edit
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleToggleClick(
                                                            service
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors p-1.5 sm:p-0 touch-manipulation ${
                                                        service.is_active
                                                            ? "text-red-600 hover:text-red-800"
                                                            : "text-green-600 hover:text-green-800"
                                                    }`}
                                                >
                                                    {service.is_active ? (
                                                        <>
                                                            <PowerOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            <span className="hidden sm:inline">
                                                                Deactivate
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            <span className="hidden sm:inline">
                                                                Activate
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={tests.links} />
                </div>
            ) : (
                <div className="rounded-lg bg-white shadow-md">
                    <EmptyState
                        icon={TestTube}
                        title="No Services Available"
                        description="No laboratory tests or services have been added yet. Click 'Add Service' to create your first test offering."
                    />
                </div>
            )}

            {/* Modals */}
            <CreateServiceModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                categories={categories}
            />

            {selectedService && (
                <>
                    <EditServiceModal
                        service={selectedService}
                        show={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedService(null);
                        }}
                        categories={categories}
                    />
                    <ToggleServiceModal
                        service={selectedService}
                        show={showToggleModal}
                        onClose={() => {
                            setShowToggleModal(false);
                            setSelectedService(null);
                        }}
                    />
                </>
            )}
        </DashboardLayout>
    );
}
