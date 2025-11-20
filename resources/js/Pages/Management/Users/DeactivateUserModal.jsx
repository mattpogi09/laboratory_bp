import Modal from '@/Components/Modal';
import { AlertTriangle, X } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function DeleteUserModal({ user, show, onClose }) {
    const { post, processing } = useForm();

    const handleDeactivate = () => {
        post(route('users.deactivate', user.id), {
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
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Deactivate User</h2>
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
                        This user will be marked as inactive and will not be able to log in.
                    </p>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to deactivate <span className="text-gray-900 font-medium">{user?.name}</span>?
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleDeactivate}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                        {processing ? 'Deactivating...' : 'Deactivate'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="flex-1 px-4 py-2 border-gray-500 shadow-xl bg-white/5 hover:bg-gray-300 text-black rounded-lg border border-white/10 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}