import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import EmptyState from '@/Components/EmptyState';
import { Search, Edit, Plus, Users, Power, PowerOff } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EditUserModal from './EditUserModal';
import CreateUserModal from './CreateUserModal';
import ToggleUserModal from './DeactivateUserModal';

export default function UsersIndex({ auth, users }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);

    const filteredUsers = users?.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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
            {filteredUsers.length > 0 ? (
            <div className="rounded-lg bg-white shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredUsers.map((user) => (
                                <tr 
                                    key={user.id}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{user.username}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {formatRole(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                            user.is_active 
                                                ? 'bg-green-500/10 text-green-400' 
                                                : 'bg-gray-500/10 text-gray-400'
                                        }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>
                                            {user.id !== auth.user.id && (
                                                <button
                                                    onClick={() => handleToggleClick(user)}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                                                        user.is_active 
                                                            ? 'text-red-600 hover:bg-red-50' 
                                                            : 'text-green-600 hover:bg-green-50'
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
            </div>
            ) : (
                <div className="rounded-lg bg-white shadow-md">
                    <EmptyState 
                        icon={Users}
                        title="No Users Found"
                        description="No users have been added yet. Click 'Add User' to create your first staff account and start managing user access."
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
