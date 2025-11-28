import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, User, Mail, Calendar, MapPin, FileText, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function SendResultsModal({ show, transaction, onClose }) {
    const [documents, setDocuments] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [incompleteTests, setIncompleteTests] = useState([]);
    const [processing, setProcessing] = useState(false);

    if (!show || !transaction) return null;

    // Check if transaction has incomplete tests on mount
    const hasIncompleteTests = transaction.incompleteTests && transaction.incompleteTests.length > 0;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setDocuments(prev => [...prev, ...files]);
    };

    const removeDocument = (index) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendClick = () => {
        // Check if all tests are completed
        const incomplete = transaction.tests?.filter(test => test.status !== 'completed') || [];
        
        if (incomplete.length > 0) {
            setIncompleteTests(incomplete);
            setShowError(true);
            return;
        }

        // All tests completed, show confirmation
        setShowConfirmation(true);
    };

    const handleConfirmSend = () => {
        const formData = new FormData();
        formData.append('transaction_id', transaction.id);
        
        documents.forEach((file, index) => {
            formData.append(`documents[${index}]`, file);
        });

        setProcessing(true);
        router.post(route('lab-test-queue.send-results'), formData, {
            onSuccess: () => {
                setProcessing(false);
                onClose();
                // Success notification will be shown by backend
            },
            onError: (errors) => {
                setProcessing(false);
                setShowConfirmation(false);
                // Show error modal with the error message
                setErrorMessage(errors?.error || 'Failed to send results. Please try again.');
                setShowError(true);
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'pending':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'completed') return <CheckCircle className="h-4 w-4" />;
        return <AlertTriangle className="h-4 w-4" />;
    };

    return (
        <>
            <LoadingOverlay show={processing} message="Generating PDFs and sending email..." />
            {/* Error Modal for Incomplete Tests */}
            {hasIncompleteTests && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
                        
                        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
                            {/* Error Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Cannot Send Results</h3>
                                        <p className="text-sm text-gray-500">Some tests are not completed</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Error Content */}
                            <div className="px-6 py-4">
                                <p className="text-sm text-gray-700 mb-4">
                                    The following tests are not yet completed. Please process them first before sending the results:
                                </p>
                                
                                <div className="space-y-2 mb-4">
                                    {transaction.incompleteTests.map((test, index) => (
                                        <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <span className="text-sm font-medium text-gray-900">{test.test_name}</span>
                                            </div>
                                            <span className={cn(
                                                "inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase",
                                                test.status === 'processing' ? 'bg-yellow-200 text-yellow-900' : 'bg-red-200 text-red-900'
                                            )}>
                                                {test.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        <strong>Note:</strong> Go to Lab Test Queue to complete the pending tests before sending results to the patient.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal - Only show if all tests are completed */}
            {!hasIncompleteTests && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
                    
                    <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Send Test Results</h3>
                                <p className="text-sm text-gray-500">Transaction: {transaction.transaction_number}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                            {/* Patient Information */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={transaction.patient_name || ''}
                                                disabled
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={transaction.patient_email || ''}
                                                disabled
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Age
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={transaction.patient_age || ''}
                                                disabled
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={transaction.patient_address || ''}
                                                disabled
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Results */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Test Results</h4>
                                <div className="space-y-3">
                                    {transaction.tests?.map((test, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "border-2 rounded-lg p-4",
                                                getStatusColor(test.status)
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(test.status)}
                                                    <h5 className="font-semibold text-gray-900">{test.test_name}</h5>
                                                </div>
                                                <span className={cn(
                                                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase",
                                                    test.status === 'completed' ? 'bg-green-200 text-green-900' :
                                                    test.status === 'processing' ? 'bg-yellow-200 text-yellow-900' :
                                                    'bg-red-200 text-red-900'
                                                )}>
                                                    {test.status}
                                                </span>
                                            </div>
                                            {test.status === 'completed' && (test.result || test.result_notes) ? (
                                                <div className="mt-2 space-y-2">
                                                    {test.result && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Result:
                                                            </label>
                                                            <div className="bg-white rounded p-2 text-sm text-gray-900 border border-gray-200">
                                                                {typeof test.result === 'object' ? (
                                                                    <div>
                                                                        {test.result.result_value && (
                                                                            <div><strong>Value:</strong> {test.result.result_value}</div>
                                                                        )}
                                                                        {test.result.normal_range && (
                                                                            <div className="text-xs text-gray-600 mt-1">
                                                                                Normal Range: {test.result.normal_range}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    test.result
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {test.result_notes && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Remarks / Notes:
                                                            </label>
                                                            <div className="bg-white rounded p-2 text-sm text-gray-900 border border-gray-200 italic">
                                                                {test.result_notes}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    This test is not completed yet and will not be included in the email.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Document Upload */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Upload Documents</h4>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <label className="cursor-pointer">
                                        <span className="text-sm text-red-600 hover:text-red-700 font-medium">
                                            Click to upload
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB each</p>
                                </div>

                                {/* Uploaded Files */}
                                {documents.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {documents.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700">{file.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendClick}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Send Results
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" />
                        
                        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <Mail className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Send Results to Patient?
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Are you sure you want to send the results to<br/>
                                    <span className="font-medium text-gray-900">{transaction.patient_email}</span>?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSend}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Yes, Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal for Incomplete Tests */}
            {showError && incompleteTests.length > 0 && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowError(false)} />
                        
                        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Cannot Send Results
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    The following tests are not completed:
                                </p>
                                <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                                    <ul className="space-y-2">
                                        {incompleteTests.map((test, index) => (
                                            <li key={index} className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-900">• {test.test_name}</span>
                                                <span className={cn(
                                                    "px-2 py-0.5 text-xs font-semibold rounded-full uppercase",
                                                    test.status === 'processing' ? 'bg-yellow-200 text-yellow-900' : 'bg-red-200 text-red-900'
                                                )}>
                                                    {test.status}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">
                                    Please complete all tests before sending results to the patient.
                                </p>
                                <button
                                    onClick={() => setShowError(false)}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* General Error Modal (for email/sending failures) */}
            {showError && incompleteTests.length === 0 && errorMessage && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowError(false)} />
                        
                        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Failed to Send Results
                                </h3>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-red-800">
                                        {errorMessage}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">
                                    Please try again or contact support if the problem persists.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowError(false);
                                        setErrorMessage('');
                                    }}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
