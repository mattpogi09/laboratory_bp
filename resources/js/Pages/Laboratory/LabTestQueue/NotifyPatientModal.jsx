import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Bell, Mail, User, FileText, AlertTriangle } from 'lucide-react';
import Modal from '@/Components/Modal';

export default function NotifyPatientModal({ show, transaction, onClose }) {
    const [processing, setProcessing] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleNotify = () => {
        setProcessing(true);
        
        router.post(
            route('lab-test-queue.notify-patient', transaction.id),
            {},
            {
                onSuccess: () => {
                    onClose();
                },
                onError: (errors) => {
                    setErrorMessage(errors?.error || 'Failed to send notification. Please try again.');
                    setShowError(true);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    if (!transaction) return null;

    const testNames = transaction.tests?.map(test => test.test_name).join(', ') || '';

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Notify Patient</h2>
                            <p className="text-sm text-gray-600">Send ready for pickup notification</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Patient Info */}
                <div className="mb-6 rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Patient:</span>
                        <span className="text-sm text-gray-900">{transaction.patient_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Email:</span>
                        <span className="text-sm text-gray-900">{transaction.patient_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Tests:</span>
                        <span className="text-sm text-gray-900">{testNames}</span>
                    </div>
                </div>

                {/* Email Preview */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Email Preview:</h3>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 space-y-2">
                        <p className="font-medium">Subject: Your Lab Test Results are Ready - BP Diagnostic</p>
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <p>Dear {transaction.patient_name},</p>
                            <p>
                                Greetings from BP Diagnostic Laboratory!
                            </p>
                            <p>
                                We are pleased to inform you that your test results for the following are now ready for claiming:
                            </p>
                            <ul className="ml-6 list-disc">
                                {transaction.tests?.map((test, idx) => (
                                    <li key={idx}>{test.test_name}</li>
                                ))}
                            </ul>
                            <p>
                                You may now visit our laboratory to pick up your results during our operating hours.
                            </p>
                            <p>
                                Transaction Code: <strong>{transaction.transaction_number}</strong>
                            </p>
                            <p className="mt-4">
                                Thank you for choosing BP Diagnostic Laboratory.
                            </p>
                            <p>Best regards,<br />BP Diagnostic Laboratory Team</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleNotify}
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Bell className="h-4 w-4" />
                        {processing ? 'Sending...' : 'Send Notification'}
                    </button>
                </div>
            </div>

            {/* Error Modal */}
            {showError && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowError(false)} />
                        
                        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Failed to Send Notification
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
        </Modal>
    );
}
