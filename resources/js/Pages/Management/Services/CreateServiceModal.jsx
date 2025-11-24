import { useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { X } from 'lucide-react';

export default function CreateServiceModal({ show, onClose, categories = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        category: '',
        name: '',
        price: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('services.store'), {
            onSuccess: () => {
                reset();
                onClose();
                router.reload({ only: ['tests'] });
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Service</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel>Category <span className="text-red-500">*</span></InputLabel>
                        <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2.5 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            required
                        >
                            <option value="">Select existing category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>

                    <div>
                        <InputLabel>Test Name <span className="text-red-500">*</span></InputLabel>
                        <TextInput
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Complete Blood Count"
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <InputLabel>Price (₱) <span className="text-red-500">*</span></InputLabel>
                        <TextInput
                            type="number"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            min="0"
                            required
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>

                    <div>
                        <InputLabel>Description <span className="text-red-500">*</span></InputLabel>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter service description..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2.5 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                            required
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <PrimaryButton type="submit" disabled={processing} className="flex-1">
                            {processing ? 'Adding...' : 'Add'}
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
