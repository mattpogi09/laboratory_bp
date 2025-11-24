import Modal from '@/Components/Modal';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function ToggleItemModal({ item, show, onClose }) {
    const { post, processing } = useForm();
    const isActive = item?.is_active;

    const handleToggle = () => {
        post(route('inventory.toggle', item.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            isActive 
                                ? 'bg-yellow-500/10' 
                                : 'bg-green-500/10'
                        }`}>
                            {isActive ? (
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            ) : (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isActive ? 'Deactivate' : 'Activate'} Item
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        {isActive 
                            ? 'This item will be hidden from lab staff inventory view and cannot be used for stock transactions.'
                            : 'This item will be visible to lab staff and can be used for stock transactions.'
                        }
                    </p>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <span className="text-gray-900 font-medium">{item?.name}</span>?
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleToggle}
                        disabled={processing}
                        className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 ${
                            isActive
                                ? 'bg-yellow-600 hover:bg-yellow-700'
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {processing 
                            ? (isActive ? 'Deactivating...' : 'Activating...') 
                            : (isActive ? 'Deactivate' : 'Activate')
                        }
                    </button>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}
