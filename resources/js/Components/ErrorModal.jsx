import { XCircle, X } from 'lucide-react';

export default function ErrorModal({ show, onClose, title = 'Error', message, errors = {} }) {
    if (!show) return null;

    const hasValidationErrors = Object.keys(errors).length > 0;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black/50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                        {message && (
                            <p className="text-sm text-gray-600">
                                {message}
                            </p>
                        )}

                        {hasValidationErrors && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <h4 className="text-sm font-medium text-red-800 mb-2">
                                    Please fix the following errors:
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
