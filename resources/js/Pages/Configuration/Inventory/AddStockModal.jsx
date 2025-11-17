import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { X } from 'lucide-react';

export default function AddStockModal({ show, onClose }) {
    const [formData, setFormData] = useState({
        item: '',
        quantity: '',
        reason: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Add stock:', formData);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Add Stock</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel>Select Item</InputLabel>
                        <select
                            value={formData.item}
                            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                            className="w-full rounded-lg border border-gray-400 bg-white/5 px-4 py-2.5 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                            <option value="">Select an item</option>
                            <option value="Blood Collection Tubes">Blood Collection Tubes</option>
                            <option value="Gloves (Medium)">Gloves (Medium)</option>
                            <option value="Alcohol Swabs">Alcohol Swabs</option>
                            <option value="Test Strips (Glucose)">Test Strips (Glucose)</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel>Quantity to Add</InputLabel>
                        <TextInput
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <InputLabel>Reason</InputLabel>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="e.g., Weekly Restock, Emergency Purchase"
                            rows={3}
                            className="w-full rounded-lg border border-gray-400 bg-white/5 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <PrimaryButton type="submit" className="flex-1">
                            Add Stock
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-gray-500 shadow-xl bg-white/5 hover:bg-gray-300 text-black rounded-lg border border-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
