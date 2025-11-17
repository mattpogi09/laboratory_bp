import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Edit, Plus, Package } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EditStockModal from './EditStockModal';
import AddStockModal from './AddStockModal';

export default function InventoryIndex() {
    const [activeTab, setActiveTab] = useState('stock');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);

    const stockItems = [
        {
            id: 1,
            name: 'Blood Collection Tubes',
            category: 'Laboratory Supplies',
            currentStock: 45,
            reorderLevel: 100,
            status: 'Low Stock'
        },
        {
            id: 2,
            name: 'Gloves (Medium)',
            category: 'PPE',
            currentStock: 78,
            reorderLevel: 200,
            status: 'Low Stock'
        },
        {
            id: 3,
            name: 'Alcohol Swabs',
            category: 'Sanitation',
            currentStock: 120,
            reorderLevel: 300,
            status: 'Low Stock'
        },
        {
            id: 4,
            name: 'Test Strips (Glucose)',
            category: 'Laboratory Supplies',
            currentStock: 23,
            reorderLevel: 50,
            status: 'Low Stock'
        },
        {
            id: 5,
            name: 'Syringes (5ml)',
            category: 'Medical Equipment',
            currentStock: 62,
            reorderLevel: 150,
            status: 'Low Stock'
        },
        {
            id: 6,
            name: 'Cotton Balls',
            category: 'Medical Supplies',
            currentStock: 450,
            reorderLevel: 200,
            status: 'Adequate'
        },
        {
            id: 7,
            name: 'Bandages',
            category: 'Medical Supplies',
            currentStock: 320,
            reorderLevel: 150,
            status: 'Adequate'
        }
    ];

    const transactions = [
        {
            id: 1,
            date: '2024-10-25',
            item: 'Blood Collection Tubes',
            type: 'IN',
            quantity: 500,
            reason: 'Weekly Restock',
            performedBy: 'Admin'
        },
        {
            id: 2,
            date: '2024-10-26',
            item: 'Gloves (Medium)',
            type: 'OUT',
            quantity: 50,
            reason: 'Used for patient care',
            performedBy: 'KuyaDats (Staff)'
        },
        {
            id: 3,
            date: '2024-10-27',
            item: 'Alcohol Swabs',
            type: 'IN',
            quantity: 1000,
            reason: 'Monthly Purchase',
            performedBy: 'Admin'
        },
        {
            id: 4,
            date: '2024-10-28',
            item: 'Test Strips (Glucose)',
            type: 'OUT',
            quantity: 15,
            reason: 'Blood sugar tests',
            performedBy: 'Al (Staff)'
        },
        {
            id: 5,
            date: '2024-10-29',
            item: 'Blood Collection Tubes',
            type: 'OUT',
            quantity: 30,
            reason: 'CBC tests',
            performedBy: 'KuyaDats (Staff)'
        }
    ];

    const filteredStockItems = stockItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTransactions = transactions.filter(transaction =>
        transaction.item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Low Stock':
                return 'bg-yellow-500/10 text-yellow-600';
            case 'Adequate':
                return 'bg-emerald-500/10 text-emerald-600';
            case 'Out of Stock':
                return 'bg-red-500/10 text-red-600';
            default:
                return 'bg-gray-500/10 text-gray-600';
        }
    };

    return (
        <DashboardLayout>
            <Head title="Inventory Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600">Track and manage stock levels and restocking</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'stock'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Stock
                        {activeTab === 'stock' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('transaction')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'transaction'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Transaction
                        {activeTab === 'transaction' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Search and Actions */}
            {activeTab === 'stock' && (
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setShowAddStockModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stock
                    </Button>
                </div>
            )}

            {/* Content */}
            {activeTab === 'stock' ? (
                filteredStockItems.length > 0 ? (
                    <div className="rounded-lg bg-white shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Stock</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reorder Level</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredStockItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-gray-100 transition-colors ${
                                                item.status === 'Low Stock' ? 'bg-yellow-50' : item.status === 'Out of Stock' ? 'bg-red-50' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.currentStock} pieces</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.reorderLevel} pieces</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg bg-white shadow-md p-12 text-center">
                        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Management</h3>
                        <p className="text-gray-600">Inventory tracking disabled until first item</p>
                    </div>
                )
            ) : (
                <div className="rounded-lg bg-white shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Performed By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900">{transaction.date}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{transaction.item}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                transaction.type === 'IN' 
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-red-500/10 text-red-600'
                                            }`}>
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{transaction.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{transaction.reason}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{transaction.performedBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddStockModal
                show={showAddStockModal}
                onClose={() => setShowAddStockModal(false)}
            />

            {selectedItem && (
                <EditStockModal
                    item={selectedItem}
                    show={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedItem(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
