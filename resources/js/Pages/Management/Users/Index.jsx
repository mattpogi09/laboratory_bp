import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import EmptyState from '@/Components/EmptyState';
import { Search, Edit, Plus, Users, Power, PowerOff, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EditUserModal from './EditUserModal';
import CreateUserModal from './CreateUserModal';
import ToggleUserModal from './DeactivateUserModal';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function UsersIndex({ auth, users, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    // Debounced search - wait 300ms after user stops typing
    useEffect(() => {
        // Skip if search hasn't changed from initial value
        if (searchQuery === (filters.search || '')) return;
        
        const timer = setTimeout(() => {
            setIsSearching(true);
            const params = { search: searchQuery || undefined };
            if (sortBy) params.sort_by = sortBy;
            if (sortOrder) params.sort_order = sortOrder;
            
            router.get(
                route('users.index'),
                params,
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [searchQuery]);

    const handleSort = (column) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
        
        setIsLoading(true);
        const params = { sort_by: column, sort_order: newSortOrder };
        if (searchQuery) params.search = searchQuery;
        
        router.get(
            route('users.index'),
            params,
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false)
            }
        );
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
            case 'admin':
                return 'bg-red-500/10 text-red-400';
            case 'lab_staff':
                return 'bg-blue-500/10 text-blue-400';
            case 'cashier':
                return 'bg-emerald-500/10 text-emerald-400';
            default:
                return 'bg-gray-500/10 text-gray-400';
        }
    };

    const formatRole = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'lab_staff':
                return 'Lab Staff';
            case 'cashier':
                return 'Cashier';
            default:
                return role;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="User Management" />
            <LoadingOverlay show={isLoading} message="Loading..." />

            {isSearching && <LoadingOverlay message="Searching..." />}

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage staff accounts, roles, and permissions</p>
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users by name, username, or role..."
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors" onClick={() => handleSort('name')}>
                                        Name ↕
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors" onClick={() => handleSort('username')}>
                                        Username ↕
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors" onClick={() => handleSort('role')}>
                                        Role ↕
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.data.map((user) => (
                                <tr 
                                    key={user.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{user.username}</td>
                                    <td className="px-4 py-3 text-sm text-blue-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'lab_staff' ? 'bg-blue-100 text-blue-800' :
                                            'bg-teal-100 text-teal-800'
                                        }`}>
                                            {formatRole(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>
                                            {user.username !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleClick(user)}
                                                    className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                                                        user.is_active 
                                                            ? 'text-red-600 hover:text-red-800' 
                                                            : 'text-green-600 hover:text-green-800'
                                                    }`}
                                                >
                                                    {user.is_active ? (
                                                        <>
                                                            <PowerOff className="h-4 w-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="h-4 w-4" />
                                                            Activate
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
                                onClick={() => router.get(users.prev_page_url)}
                                disabled={!users.prev_page_url}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => router.get(users.next_page_url)}
                                disabled={!users.next_page_url}
                                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{users.from}</span> to{' '}
                                    <span className="font-medium">{users.to}</span> of{' '}
                                    <span className="font-medium">{users.total}</span> users
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                    <button
                                        onClick={() => router.get(users.prev_page_url)}
                                        disabled={!users.prev_page_url}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                                        {users.current_page} / {users.last_page}
                                    </span>
                                    <button
                                        onClick={() => router.get(users.next_page_url)}
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
                        description={searchQuery ? "No users match your search criteria." : "No users have been added yet. Click 'Add User' to create your first staff account and start managing user access."}
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
        </DashboardLayout>
    );
}
