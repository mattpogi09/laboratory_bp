import { useState } from 'react';
import { X } from 'lucide-react';

export default function StockOutModal({ show, onClose }) {
    const [formData, setFormData] = useState({
        item: '',
        quantity: '',
        transactionCode: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Stock out:', formData);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black/50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">Stock Out / Use Items</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Alert Banner */}
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-red-800 font-medium mb-1">Stock Out / Use Items</h4>
                                <p className="text-red-700 text-sm">Record item usage for a test</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Select Item */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Item <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.item}
                                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                required
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter quantity to use"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                required
                            />
                        </div>

                        {/* Transaction Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., T-00123"
                                value={formData.transactionCode}
                                onChange={(e) => setFormData({ ...formData, transactionCode: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Enter the patient's transaction code for this test.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Record Stock Out
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
