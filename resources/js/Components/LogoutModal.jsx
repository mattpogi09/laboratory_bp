import Modal from '@/Components/Modal';
import { LogOut, X } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function LogoutModal({ show, onClose }) {
    const { post, processing } = useForm();

    const handleLogout = () => {
        post(route('logout'), {
            onFinish: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Confirm Logout</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700">
                        Are you sure you want to logout? You will need to login again to access the system.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleLogout}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                        {processing ? 'Logging out...' : 'Logout'}
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
