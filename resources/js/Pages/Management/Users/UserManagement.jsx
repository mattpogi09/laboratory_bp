import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import EmptyState from "@/Components/EmptyState";
import {
    Search,
    Edit,
    Plus,
    Users,
    Power,
    PowerOff,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import EditUserModal from "./EditUserModal";
import CreateUserModal from "./CreateUserModal";
import ToggleUserModal from "./DeactivateUserModal";
import LoadingOverlay from "@/Components/LoadingOverlay";
import ErrorModal from "@/Components/ErrorModal";

export default function UsersIndex({ auth, users, filters = {} }) {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
    const [sortOrder, setSortOrder] = useState(filters.sort_order || "desc");

    // Check for error flash messages
    useEffect(() => {
        if (flash?.error) {
            setErrorMessage(flash.error);
            setShowErrorModal(true);
        }
    }, [flash]);

    // Debounced search - wait 300ms after user stops typing
    useEffect(() => {
        // Skip if search hasn't changed from initial value
        if (searchQuery === (filters.search || "")) return;

        const timer = setTimeout(() => {
            setIsSearching(true);
            const params = { search: searchQuery || undefined };
            if (sortBy) params.sort_by = sortBy;
            if (sortOrder) params.sort_order = sortOrder;

            router.get(route("users.index"), params, {
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
        const newSortOrder =
            sortBy === column && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(newSortOrder);

        setIsLoading(true);
        const params = { sort_by: column, sort_order: newSortOrder };
        if (searchQuery) params.search = searchQuery;

        router.get(route("users.index"), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleToggleClick = (user) => {
        setSelectedUser(user);
        setShowToggleModal(true);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-red-500/10 text-red-400";
            case "lab_staff":
                return "bg-blue-500/10 text-blue-400";
            case "cashier":
                return "bg-emerald-500/10 text-emerald-400";
            default:
                return "bg-gray-500/10 text-gray-400";
        }
    };

    const formatRole = (role) => {
        switch (role) {
            case "admin":
                return "Admin";
            case "lab_staff":
                return "Lab Staff";
            case "cashier":
                return "Cashier";
            default:
                return role;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="User Management" />
            <LoadingOverlay
                show={isLoading || isSearching}
                message={isSearching ? "Searching..." : "Loading..."}
            />

            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    User Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Manage staff accounts, roles, and permissions
                </p>
            </div>

            {/* Search and Actions */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users by name, username, or role..."
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Users Table */}
            {users.data?.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                            onClick={() => handleSort("name")}
                                        >
                                            Name ↕
                                        </div>
                                    </th>
                                    <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                            onClick={() =>
                                                handleSort("username")
                                            }
                                        >
                                            Username ↕
                                        </div>
                                    </th>
                                    <th className="hidden lg:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700">
                                        Email
                                    </th>
                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                            onClick={() => handleSort("role")}
                                        >
                                            Role ↕
                                        </div>
                                    </th>
                                    <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700">
                                        Status
                                    </th>
                                    <th className="hidden xl:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700">
                                        Created
                                    </th>
                                    <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">
                                            {user.name}
                                        </td>
                                        <td className="hidden md:table-cell px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                            {user.username}
                                        </td>
                                        <td className="hidden lg:table-cell px-3 sm:px-4 py-3 text-xs sm:text-sm text-blue-600">
                                            {user.email}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium w-fit ${
                                                        user.role === "admin"
                                                            ? "bg-red-100 text-red-800"
                                                            : user.role ===
                                                              "lab_staff"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-teal-100 text-teal-800"
                                                    }`}
                                                >
                                                    {formatRole(user.role)}
                                                </span>
                                                {user.id === 1 && (
                                                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                                                        Primary Admin
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {user.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="hidden xl:table-cell px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                {/* Show edit button only if: not first admin (ID=1) OR current user is the first admin themselves */}
                                                {(user.id !== 1 ||
                                                    (user.id === 1 &&
                                                        auth.user.id ===
                                                            1)) && (
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(user)
                                                        }
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors touch-manipulation p-1.5 sm:p-0"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        <span className="hidden sm:inline">
                                                            Edit
                                                        </span>
                                                    </button>
                                                )}
                                                {/* Hide deactivate button for first admin (ID=1) */}
                                                {user.id !== 1 && (
                                                    <button
                                                        onClick={() =>
                                                            handleToggleClick(
                                                                user
                                                            )
                                                        }
                                                        className={`inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors touch-manipulation p-1.5 sm:p-0 ${
                                                            user.is_active
                                                                ? "text-red-600 hover:text-red-800"
                                                                : "text-green-600 hover:text-green-800"
                                                        }`}
                                                        title={
                                                            user.is_active
                                                                ? "Deactivate"
                                                                : "Activate"
                                                        }
                                                    >
                                                        {user.is_active ? (
                                                            <>
                                                                <PowerOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                <span className="hidden md:inline">
                                                                    Deactivate
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                <span className="hidden md:inline">
                                                                    Activate
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() =>
                                        router.get(users.prev_page_url)
                                    }
                                    disabled={!users.prev_page_url}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() =>
                                        router.get(users.next_page_url)
                                    }
                                    disabled={!users.next_page_url}
                                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{" "}
                                        <span className="font-medium">
                                            {users.from}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {users.to}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">
                                            {users.total}
                                        </span>{" "}
                                        users
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                        <button
                                            onClick={() =>
                                                router.get(users.prev_page_url)
                                            }
                                            disabled={!users.prev_page_url}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                                            {users.current_page} /{" "}
                                            {users.last_page}
                                        </span>
                                        <button
                                            onClick={() =>
                                                router.get(users.next_page_url)
                                            }
                                            disabled={!users.next_page_url}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-lg bg-white shadow-md">
                    <EmptyState
                        icon={Users}
                        title="No Users Found"
                        description={
                            searchQuery
                                ? "No users match your search criteria."
                                : "No users have been added yet. Click 'Add User' to create your first staff account and start managing user access."
                        }
                    />
                </div>
            )}

            {/* Modals */}
            <CreateUserModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />

            {selectedUser && (
                <>
                    <EditUserModal
                        user={selectedUser}
                        show={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedUser(null);
                        }}
                    />
                    <ToggleUserModal
                        user={selectedUser}
                        show={showToggleModal}
                        onClose={() => {
                            setShowToggleModal(false);
                            setSelectedUser(null);
                        }}
                    />
                </>
            )}

            <ErrorModal
                show={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Action Not Allowed"
                message={errorMessage}
            />
        </DashboardLayout>
    );
}
