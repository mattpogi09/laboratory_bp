import { X, User, Mail, Calendar, MapPin, FileText, Download, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ViewResultModal({ show, result, onClose }) {
    if (!show || !result) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Sent Result Details</h3>
                            <p className="text-sm text-gray-500">Transaction: {result.transaction_number}</p>
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
                        {/* Send Information */}
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-green-900 mb-1">Results Successfully Sent</h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        <p>Sent to: <span className="font-medium">{result.patient_email}</span></p>
                                        <p>Date & Time: <span className="font-medium">{result.sent_at}</span></p>
                                        <p>Sent by: <span className="font-medium">{result.sent_by_name}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Information */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Full Name</p>
                                        <p className="text-sm font-medium text-gray-900">{result.patient_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email Address</p>
                                        <p className="text-sm font-medium text-gray-900">{result.patient_email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Age</p>
                                        <p className="text-sm font-medium text-gray-900">{result.patient_age}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-sm font-medium text-gray-900">{result.patient_address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Results Sent */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Test Results Sent</h4>
                            <div className="space-y-3">
                                {result.tests?.map((test, index) => (
                                    <div
                                        key={index}
                                        className="border-2 border-green-200 bg-green-50 rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <h5 className="font-semibold text-gray-900">{test.test_name}</h5>
                                            </div>
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-900">
                                                SENT
                                            </span>
                                        </div>
                                        {(test.result || test.result_notes) && (
                                            <div className="mt-2 space-y-2">
                                                {test.result && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Result:
                                                        </label>
                                                        <div className="bg-white rounded p-3 text-sm text-gray-900 border border-green-200">
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
                                                        <div className="bg-white rounded p-3 text-sm text-gray-900 border border-green-200 italic">
                                                            {test.result_notes}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Documents Sent */}
                        {result.documents && result.documents.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Documents Attached</h4>
                                <div className="space-y-2">
                                    {result.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">{doc.size}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Download className="h-3 w-3" />
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
