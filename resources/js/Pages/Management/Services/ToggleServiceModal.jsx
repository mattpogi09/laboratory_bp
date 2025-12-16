import Modal from "@/Components/Modal";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { useForm } from "@inertiajs/react";

export default function ToggleServiceModal({ service, show, onClose }) {
    const { post, processing } = useForm();
    const isActive = service?.is_active;

    const handleToggle = () => {
        post(route("services.toggle", service.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div
                            className={`p-1.5 sm:p-2 rounded-lg ${
                                isActive
                                    ? "bg-yellow-500/10"
                                    : "bg-green-500/10"
                            }`}
                        >
                            {isActive ? (
                                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                            ) : (
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                            )}
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {isActive ? "Deactivate" : "Activate"} Lab Test
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation p-1"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                <div className="mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-700 mb-2">
                        {isActive
                            ? "This lab test will be marked as inactive and will not appear in the cashier's test selection."
                            : "This lab test will be reactivated and will appear in the cashier's test selection again."}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                        Are you sure you want to{" "}
                        {isActive ? "deactivate" : "activate"}{" "}
                        <span className="text-gray-900 font-medium">
                            {service?.name}
                        </span>
                        ?
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleToggle}
                        disabled={processing}
                        className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 min-h-[44px] sm:min-h-0 text-xs sm:text-sm touch-manipulation ${
                            isActive
                                ? "bg-yellow-600 hover:bg-yellow-700"
                                : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {processing
                            ? isActive
                                ? "Deactivating..."
                                : "Activating..."
                            : isActive
                            ? "Deactivate"
                            : "Activate"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg border border-gray-300 transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-0 text-xs sm:text-sm touch-manipulation"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}
