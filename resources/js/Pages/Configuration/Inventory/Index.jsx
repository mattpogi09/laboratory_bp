import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Edit, Plus, Package } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EditStockModal from './EditStockModal';
import AddStockModal from './AddStockModal';
import StockOutModal from './StockOutModal';

export default function InventoryIndex({ auth }) {
    const [activeTab, setActiveTab] = useState('stock');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showStockOutModal, setShowStockOutModal] = useState(false);
    
    const userRole = auth?.user?.role || 'admin';

    const stockItems = [
        {
            id: 1,
            name: 'Blood Collection Tubes',
            category: 'Collection Supplies',
            currentStock: 245,
            minimumStock: 100,
            unit: 'pcs',
            status: 'Good'
        },
        {
            id: 2,
            name: 'Gloves (Medium)',
            category: 'PPE',
            currentStock: 478,
            minimumStock: 200,
            unit: 'pairs',
            status: 'Good'
        },
        {
            id: 3,
            name: 'Alcohol Swabs',
            category: 'Disinfectants',
            currentStock: 820,
            minimumStock: 300,
            unit: 'pcs',
            status: 'Good'
        },
        {
            id: 4,
            name: 'Test Strips (Glucose)',
            category: 'Test Materials',
            currentStock: 123,
            minimumStock: 50,
            unit: 'pcs',
            status: 'Good'
        },
        {
            id: 5,
            name: 'Syringes (5ml)',
            category: 'Collection Supplies',
            currentStock: 362,
            minimumStock: 150,
            unit: 'pcs',
            status: 'Good'
        },
        {
            id: 6,
            name: 'Microscope Slides',
            category: 'Equipment',
            currentStock: 540,
            minimumStock: 200,
            unit: 'pcs',
            status: 'Good'
        },
        {
            id: 7,
            name: 'Cotton Balls',
            category: 'Supplies',
            currentStock: 1200,
            minimumStock: 500,
            unit: 'pcs',
            status: 'Good'
        },
        {
            id: 8,
            name: 'Urine Containers',
            category: 'Collection Supplies',
            currentStock: 89,
            minimumStock: 100,
            unit: 'pcs',
            status: 'Low Stock'
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
        <DashboardLayout auth={auth}>
            <Head title="Inventory Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600">View current stock levels and record item usage</p>
            </div>

            {/* Alert Banner */}
            {stockItems.filter(item => item.currentStock < item.minimumStock).length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-red-800 font-medium mb-1">
                                {stockItems.filter(item => item.currentStock < item.minimumStock).length} item(s) below minimum stock level
                            </h4>
                            <p className="text-red-700 text-sm">
                                Please inform admin to restock: {stockItems.filter(item => item.currentStock < item.minimumStock).map(item => item.name).join(', ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                    {userRole === 'lab_staff' && (
                        <Button
                            onClick={() => setShowStockOutModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Package className="h-4 w-4 mr-2" />
                            Stock Out / Use Items
                        </Button>
                    )}
                    {userRole === 'admin' && (
                        <Button
                            onClick={() => setShowAddStockModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Stock
                        </Button>
                    )}
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
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Minimum Stock</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredStockItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                                            <td className="px-4 py-3 text-sm font-semibold" style={{ color: item.status === 'Low Stock' ? '#EF4444' : '#10B981' }}>
                                                {item.currentStock}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.minimumStock}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
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
            <StockOutModal
                show={showStockOutModal}
                onClose={() => setShowStockOutModal(false)}
            />
            
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
