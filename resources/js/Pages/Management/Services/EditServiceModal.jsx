import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { X } from 'lucide-react';

export default function EditServiceModal({ service, show, onClose }) {
    const [formData, setFormData] = useState({
        category: service?.category || '',
        name: service?.name || '',
        price: service?.price || '',
        description: service?.description || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Update service:', formData);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Service</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel>Category</InputLabel>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full rounded-lg border border-gray-400 bg-white/5 px-4 py-2.5 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                            <option value="">Type of Test</option>
                            <option value="Hematology">Hematology</option>
                            <option value="Urine Microscopy">Urine Microscopy</option>
                            <option value="Serology/Immunology">Serology/Immunology</option>
                            <option value="Blood Chemistry">Blood Chemistry</option>
                            <option value="Procedure Ultrasound">Procedure Ultrasound</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel>Test Name</InputLabel>
                        <TextInput
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Complete Blood Count"
                        />
                    </div>

                    <div>
                        <InputLabel>Price (₱)</InputLabel>
                        <TextInput
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="250"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <InputLabel>Description</InputLabel>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter service description..."
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
