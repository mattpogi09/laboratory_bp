import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X } from 'lucide-react';

export default function AddStockModal({ items = [], show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        item_id: '',
        quantity: '',
        reason: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.stock-in'), {
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
                    <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Stock In - Add Inventory</h3>
                                <p className="text-sm text-gray-600 mt-1">Receive new stock into inventory</p>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                >
                                    <option value="">Choose an item</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} - Current: {item.current_stock} {item.unit}
                                        </option>
                                    ))}
                                </select>
                                {errors.item_id && <p className="mt-1 text-sm text-red-600">{errors.item_id}</p>}
                            </div>

                            {/* Current Stock Display */}
                            {selectedItem && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">Current Stock:</span>
                                        <span className="font-semibold text-blue-900">
                                            {selectedItem.current_stock} {selectedItem.unit}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity to Add <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    placeholder="Enter quantity"
                                    min="1"
                                />
                                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                            </div>

                            {/* New Stock Preview */}
                            {selectedItem && data.quantity && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">New Stock After Addition:</span>
                                        <span className="font-semibold text-green-900">
                                            {parseInt(selectedItem.current_stock) + parseInt(data.quantity)} {selectedItem.unit}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                                    placeholder="e.g., New delivery from supplier, Restocking, Emergency purchase"
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
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Adding Stock...' : 'Add Stock'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
