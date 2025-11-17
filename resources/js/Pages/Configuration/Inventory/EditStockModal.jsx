import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { X } from 'lucide-react';

export default function EditStockModal({ item, show, onClose }) {
    const [formData, setFormData] = useState({
        newQuantity: item?.currentStock || '',
        target: item?.currentStock || '',
        reason: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Update stock:', formData);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Adjust Stock</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel>New Quantity</InputLabel>
                        <TextInput
                            type="number"
                            value={formData.newQuantity}
                            onChange={(e) => setFormData({ ...formData, newQuantity: e.target.value })}
                            placeholder="45"
                        />
                        <p className="mt-1 text-xs text-gray-400">Current: {item?.currentStock} pieces</p>
                    </div>

                    <div>
                        <InputLabel>Target for Adjustment</InputLabel>
                        <TextInput
                            type="number"
                            value={formData.target}
                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                            placeholder="45"
                        />
                    </div>

                    <div>
                        <InputLabel>Reason</InputLabel>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="e.g., Expired items removed, Inventory count corrected"
                            rows={3}
                            className="w-full rounded-lg border border-gray-400 bg-white/5 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <PrimaryButton type="submit" className="flex-1">
                            Update
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
