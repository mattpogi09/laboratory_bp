import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X, AlertTriangle } from 'lucide-react';

export default function AdjustStockModal({ item, show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        new_quantity: item?.current_stock || '',
        reason: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.adjust', item.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
                router.reload({ only: ['items', 'transactions', 'stats', 'lowStockAlerts'] });
            }
        });
    };

    if (!show || !item) return null;

    const quantityDiff = parseInt(data.new_quantity) - parseInt(item.current_stock);
    const isIncrease = quantityDiff > 0;
    const isDecrease = quantityDiff < 0;
    const willBeLowStock = data.new_quantity && parseInt(data.new_quantity) < item.minimum_stock;

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
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Adjust Stock Level</h3>
                                <p className="text-sm text-gray-600 mt-1">Manual stock adjustment for {item.name}</p>
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
                            {/* Item Info */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Item:</span>
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="text-gray-900">{item.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Current Stock:</span>
                                        <span className="font-semibold text-blue-900">{item.current_stock} {item.unit}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Minimum Stock:</span>
                                        <span className="text-gray-900">{item.minimum_stock} {item.unit}</span>
                                    </div>
                                </div>
                            </div>

                            {/* New Quantity */}
                            <div>
                                <label htmlFor="new_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Stock Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="new_quantity"
                                    value={data.new_quantity}
                                    onChange={(e) => setData('new_quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Enter new quantity"
                                    min="0"
                                />
                                {errors.new_quantity && <p className="mt-1 text-sm text-red-600">{errors.new_quantity}</p>}
                            </div>

                            {/* Change Preview */}
                            {data.new_quantity && quantityDiff !== 0 && (
                                <div className={`border rounded-lg p-3 ${
                                    isIncrease 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">Change:</span>
                                            <span className={`font-semibold ${
                                                isIncrease ? 'text-green-900' : 'text-red-900'
                                            }`}>
                                                {isIncrease ? '+' : ''}{quantityDiff} {item.unit}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">New Total:</span>
                                            <span className={`font-semibold ${
                                                isIncrease ? 'text-green-900' : 'text-red-900'
                                            }`}>
                                                {data.new_quantity} {item.unit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Low Stock Warning */}
                                    {willBeLowStock && (
                                        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-yellow-300 bg-yellow-50/50 -mx-3 -mb-3 px-3 py-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                            <p className="text-xs text-yellow-800">
                                                Warning: New quantity is below minimum level ({item.minimum_stock} {item.unit})
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Adjustment <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                    placeholder="e.g., Physical inventory count correction, Expired items removed, Found additional stock"
                                />
                                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                                <p className="mt-1 text-xs text-gray-500">
                                    Please provide a detailed reason for this manual adjustment
                                </p>
                            </div>

                            {/* Warning Note */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium text-amber-900">Manual Adjustment</p>
                                        <p className="text-amber-800 mt-1">
                                            This will directly update the stock level. For normal stock movements, use Stock In/Out instead.
                                        </p>
                                    </div>
                                </div>
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
                                disabled={processing || quantityDiff === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Adjusting...' : 'Adjust Stock'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
