import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Edit, ShieldQuestionMark, Plus, Users } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import CreateUserModal from './CreateUserModal';

export default function UsersIndex({ auth }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const users = [
        {
            id: 1,
            name: 'Aldriane Jay Umiten',
            username: 'Admin',
            role: 'Admin',
            created: '2024-11-15'
        },
        {
            id: 2,
            name: 'KuyaDats (Lab)',
            username: 'KuyaDats (Staff)',
            role: 'Lab Staff',
            created: '2024-11-15'
        },
        {
            id: 3,
            name: 'Matt Ballos',
            username: 'KuyaCashier',
            role: 'Cashier',
            created: '2024-11-15'
        },
        {
            id: 4,
            name: 'Aldrian Sahol',
            username: 'AldranStaff',
            role: 'Lab Staff',
            created: '2024-11-15'
        },
        {
            id: 5,
            name: 'Jonathan Guartizo',
            username: 'JunCashier',
            role: 'Cashier',
            created: '2024-11-15'
        }
    ];

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-500/10 text-red-400';
            case 'Lab Staff':
                return 'bg-blue-500/10 text-blue-400';
            case 'Cashier':
                return 'bg-emerald-500/10 text-emerald-400';
            default:
                return 'bg-gray-500/10 text-gray-400';
        }
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
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
                                    <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{user.username}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{user.created}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                            >
                                                <ShieldQuestionMark  className="h-4 w-4" />
                                            </button>
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
                    <DeleteUserModal
                        user={selectedUser}
                        show={showDeleteModal}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setSelectedUser(null);
                        }}
                    />
                </>
            )}
        </DashboardLayout>
    );
}
