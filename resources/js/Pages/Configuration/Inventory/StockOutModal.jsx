import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X, AlertTriangle } from 'lucide-react';

export default function StockOutModal({ items = [], show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        item_id: '',
        quantity: '',
        reason: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.stock-out'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
                router.reload({ only: ['items', 'transactions', 'stats', 'lowStockAlerts'] });
            }
        });
    };

    if (!show) return null;

    const selectedItem = items.find(item => item.id === parseInt(data.item_id));
    const newStock = selectedItem && data.quantity 
        ? parseInt(selectedItem.current_stock) - parseInt(data.quantity)
        : null;
    const willBeLowStock = selectedItem && newStock !== null && newStock < selectedItem.minimum_stock;
    const insufficientStock = selectedItem && data.quantity && parseInt(data.quantity) > parseInt(selectedItem.current_stock);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Stock Out - Remove Inventory</h3>
                                <p className="text-sm text-gray-600 mt-1">Remove used or consumed stock</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-6 py-4 space-y-4">
                            {/* Select Item */}
                            <div>
                                <label htmlFor="item_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Item <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="item_id"
                                    value={data.item_id}
                                    onChange={(e) => setData('item_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                >
                                    <option value="">Choose an item</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} - Available: {item.current_stock} {item.unit}
                                        </option>
                                    ))}
                                </select>
                                {errors.item_id && <p className="mt-1 text-sm text-red-600">{errors.item_id}</p>}
                            </div>

                            {/* Current Stock Display */}
                            {selectedItem && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">Available Stock:</span>
                                        <span className="font-semibold text-blue-900">
                                            {selectedItem.current_stock} {selectedItem.unit}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity to Remove <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    placeholder="Enter quantity"
                                    min="1"
                                    max={selectedItem?.current_stock}
                                />
                                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                            </div>

                            {/* Insufficient Stock Warning */}
                            {insufficientStock && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-red-900">Insufficient Stock</p>
                                            <p className="text-sm text-red-700 mt-1">
                                                Cannot remove {data.quantity} {selectedItem.unit}. Only {selectedItem.current_stock} {selectedItem.unit} available.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* New Stock Preview */}
                            {selectedItem && data.quantity && !insufficientStock && (
                                <div className={`border rounded-lg p-3 ${
                                    willBeLowStock 
                                        ? 'bg-yellow-50 border-yellow-200' 
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">Remaining Stock After Removal:</span>
                                        <span className={`font-semibold ${
                                            willBeLowStock ? 'text-yellow-900' : 'text-red-900'
                                        }`}>
                                            {newStock} {selectedItem.unit}
                                        </span>
                                    </div>
                                    {willBeLowStock && (
                                        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-yellow-300">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                            <p className="text-xs text-yellow-800">
                                                Warning: Stock will be below minimum level ({selectedItem.minimum_stock} {selectedItem.unit})
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Removal <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                                    placeholder="e.g., Used for patient testing, Consumed in procedure, Damaged items disposal"
                                />
                                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                            </div>

                            {/* Transaction Code Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                    <span className="font-medium">Note:</span> A unique transaction code will be automatically generated for this stock movement.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || insufficientStock}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Removing Stock...' : 'Remove Stock'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
