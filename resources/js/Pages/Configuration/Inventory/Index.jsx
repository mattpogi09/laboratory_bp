import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Pagination';
import { Search, Edit, Plus, Package, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Power } from 'lucide-react';
import CreateStockModal from './CreateStockModal';
import AddStockModal from './AddStockModal';
import StockOutModal from './StockOutModal';
import AdjustStockModal from './AdjustStockModal';
import ToggleItemModal from './ToggleItemModal';

export default function InventoryIndex({ auth, items = { data: [], links: [] }, transactions = { data: [], links: [] }, stats, lowStockAlerts }) {
    const [activeTab, setActiveTab] = useState('stock');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showStockOutModal, setShowStockOutModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);

    const itemsData = items.data || [];
    const transactionsData = transactions.data || [];

    const handleAdjustStock = (item) => {
        setSelectedItem(item);
        setShowAdjustModal(true);
    };

    const handleToggleClick = (item) => {
        setSelectedItem(item);
        setShowToggleModal(true);
    };

    const filteredItems = itemsData?.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'good':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStockTextColor = (status) => {
        switch (status) {
            case 'good':
                return 'text-green-600 font-semibold';
            case 'low_stock':
                return 'text-yellow-600 font-semibold';
            case 'out_of_stock':
                return 'text-red-600 font-semibold';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Inventory Management" />

            <div className="py-8">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Track and manage laboratory supplies and materials
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {auth.user.role === 'admin' && (
                                    <>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                            Create Stock
                                        </button>
                                        <button
                                            onClick={() => setShowAddStockModal(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <TrendingUp className="h-5 w-5" />
                                            Stock In
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setShowStockOutModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <TrendingDown className="h-5 w-5" />
                                    Stock Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    {lowStockAlerts && lowStockAlerts.length > 0 && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-yellow-800 mb-1">Low Stock Warning</h3>
                                    <p className="text-sm text-yellow-700">
                                        {lowStockAlerts.length} item(s) need restocking: {lowStockAlerts.map(item => item.name).join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">Out of Stock</h3>
                                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats?.out_of_stock || 0}</p>
                            <p className="text-sm text-red-600 mt-1">REQUIRES IMMEDIATE ATTENTION</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">Low Stock</h3>
                                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats?.low_stock || 0}</p>
                            <p className="text-sm text-yellow-600 mt-1">WARNING</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600">In Stock</h3>
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats?.in_stock || 0}</p>
                            <p className="text-sm text-green-600 mt-1">AVAILABLE</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-8 px-6">
                                <button
                                    onClick={() => setActiveTab('stock')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'stock'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Stock Items
                                </button>
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'transactions'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Transaction Log
                                </button>
                            </nav>
                        </div>

            <div className="p-6">
                {activeTab === 'stock' && (
                    <>
                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by item name or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Stock Table */}
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                                <p className="text-gray-500">
                                    {searchQuery ? 'Try adjusting your search' : 'Start by creating your first stock item'}
                                </p>
                            </div>
                        ) : (
                            <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Item Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Current Stock</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Minimum Stock</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Stock Status</th>
                                            {auth.user.role === 'admin' && (
                                                <>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Item Status</th>
                                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-4">
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600">{item.category}</td>
                                                <td className={`py-4 px-4 text-right ${getStockTextColor(item.status)}`}>
                                                    {item.current_stock} {item.unit}
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-600">
                                                    {item.minimum_stock} {item.unit}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                        {item.status === 'good' && 'Good'}
                                                        {item.status === 'low_stock' && 'Low Stock'}
                                                        {item.status === 'out_of_stock' && 'Out of Stock'}
                                                    </span>
                                                </td>
                                                {auth.user.role === 'admin' && (
                                                    <>
                                                        <td className="py-4 px-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                                item.is_active 
                                                                    ? 'bg-green-100 text-green-800 border-green-300' 
                                                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                                            }`}>
                                                                {item.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleAdjustStock(item)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    Adjust
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleClick(item)}
                                                                    className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                                                                        item.is_active 
                                                                            ? 'text-yellow-600 hover:bg-yellow-50' 
                                                                            : 'text-green-600 hover:bg-green-50'
                                                                    }`}
                                                                >
                                                                    <Power className="h-4 w-4" />
                                                                    {item.is_active ? 'Deactivate' : 'Activate'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={items.links} />
                            </>
                        )}
                    </>
                )}

                {activeTab === 'transactions' && (
                    <div className="overflow-x-auto">
                        {transactionsData && transactionsData.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                                <p className="text-gray-500">Transaction history will appear here</p>
                            </div>
                        ) : (
                            <>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Item</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Quantity</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Previous Stock</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">New Stock</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Transaction Code</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionsData?.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4 text-gray-600">
                                                {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-4 px-4 font-medium text-gray-900">{transaction.item?.name}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    transaction.type === 'in' 
                                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                                        : 'bg-red-100 text-red-800 border border-red-300'
                                                }`}>
                                                    {transaction.type === 'in' ? (
                                                        <>
                                                            <TrendingUp className="h-3 w-3" />
                                                            Stock In
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown className="h-3 w-3" />
                                                            Stock Out
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className={`py-4 px-4 text-right font-semibold ${
                                                transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} {transaction.item?.unit}
                                            </td>
                                            <td className="py-4 px-4 text-right text-gray-600">
                                                {transaction.previous_stock !== null ? `${transaction.previous_stock} ${transaction.item?.unit}` : '-'}
                                            </td>
                                            <td className="py-4 px-4 text-right font-medium text-gray-900">
                                                {transaction.new_stock !== null ? `${transaction.new_stock} ${transaction.item?.unit}` : '-'}
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">
                                                {transaction.transaction_code || '-'}
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">{transaction.user?.name}</td>
                                            <td className="py-4 px-4 text-gray-600">{transaction.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination links={transactions.links} />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
</div>

            {/* Modals */}
            <CreateStockModal show={showCreateModal} onClose={() => setShowCreateModal(false)} />
            <AddStockModal items={itemsData} show={showAddStockModal} onClose={() => setShowAddStockModal(false)} />
            <StockOutModal items={itemsData} show={showStockOutModal} onClose={() => setShowStockOutModal(false)} />
            <AdjustStockModal item={selectedItem} show={showAdjustModal} onClose={() => setShowAdjustModal(false)} />
            <ToggleItemModal item={selectedItem} show={showToggleModal} onClose={() => setShowToggleModal(false)} />
        </DashboardLayout>
    );
}
