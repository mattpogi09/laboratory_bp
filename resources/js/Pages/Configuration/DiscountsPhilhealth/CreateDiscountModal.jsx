import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { X } from 'lucide-react';

export default function CreateDiscountModal({ show, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Create discount:', formData);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Create Discount</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel>Discount Name</InputLabel>
                        <TextInput
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Senior Citizen"
                            className="border-gray-400"
                        />
                    </div>

                    <div>
                        <InputLabel>Rate (%)</InputLabel>
                        <TextInput
                            type="number"
                            value={formData.rate}
                            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                            placeholder="20"
                            step="0.01"
                            className="border-gray-400"
                        />
                    </div>

                    <div>
                        <InputLabel>Description</InputLabel>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter discount description..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-400 bg-white/5 px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <PrimaryButton type="submit" className="flex-1">
                            Create
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
