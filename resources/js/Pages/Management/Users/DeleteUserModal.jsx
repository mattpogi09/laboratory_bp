import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteUserModal({ user, show, onClose }) {
    const handleDelete = () => {
        console.log('Delete user:', user.id);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
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
                        This action cannot be undone. All values associated with this field will be lost.
                    </p>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <span className="text-gray-900 font-medium">{user?.name}</span>?
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border-gray-500 shadow-xl bg-white/5 hover:bg-gray-300 text-black rounded-lg border border-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}
