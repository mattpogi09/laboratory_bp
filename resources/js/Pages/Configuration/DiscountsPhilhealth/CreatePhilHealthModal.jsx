import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { X } from 'lucide-react';

export default function CreatePhilHealthModal({ show, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        coverageRate: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Create PhilHealth plan:', formData);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Create PhilHealth Plan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel>Plan Name</InputLabel>
                        <TextInput
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="PhilHealth Basic"
                        />
                    </div>

                    <div>
                        <InputLabel>Coverage Rate (%)</InputLabel>
                        <TextInput
                            type="number"
                            value={formData.coverageRate}
                            onChange={(e) => setFormData({ ...formData, coverageRate: e.target.value })}
                            placeholder="0"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <InputLabel>Description</InputLabel>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter plan description..."
                            rows={3}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <PrimaryButton type="submit" className="flex-1">
                            Create
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
