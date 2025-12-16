import { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import { X } from "lucide-react";

export default function CreateStockModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        category: "",
        initial_quantity: "",
        minimum_stock: "",
        unit: "",
    });

    const categories = [
        "Reagents",
        "Consumables",
        "Equipment",
        "Safety Items",
        "Chemicals",
        "Cleaning Supplies",
        "Office Supplies",
        "Other",
    ];

    const units = [
        "pieces",
        "boxes",
        "bottles",
        "tubes",
        "kits",
        "liters",
        "grams",
        "units",
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("inventory.store"), {
            onSuccess: () => {
                reset();
                onClose();
                router.reload({
                    only: ["items", "transactions", "stats", "lowStockAlerts"],
                });
            },
        });
    };

    if (!show) return null;

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
                    <div className="bg-white p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                Create New Stock Item
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                            >
                                <X className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white p-4 sm:p-6 space-y-4">
                            {/* Item Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Item Name{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="e.g., Blood Collection Tubes"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="category"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Category{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) =>
                                        setData("category", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Initial Stock and Unit */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="initial_quantity"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Initial Stock{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="initial_quantity"
                                        value={data.initial_quantity}
                                        onChange={(e) =>
                                            setData(
                                                "initial_quantity",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="0"
                                        min="0"
                                    />
                                    {errors.initial_quantity && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.initial_quantity}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="unit"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Unit{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="unit"
                                        value={data.unit}
                                        onChange={(e) =>
                                            setData("unit", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">Select unit</option>
                                        {units.map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.unit && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.unit}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Minimum Stock */}
                            <div>
                                <label
                                    htmlFor="minimum_stock"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Minimum Stock Level{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="minimum_stock"
                                    value={data.minimum_stock}
                                    onChange={(e) =>
                                        setData("minimum_stock", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Alert when stock falls below this level"
                                    min="0"
                                />
                                {errors.minimum_stock && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.minimum_stock}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    You'll receive alerts when stock falls below
                                    this threshold
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 touch-manipulation"
                            >
                                {processing
                                    ? "Creating..."
                                    : "Create Stock Item"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
