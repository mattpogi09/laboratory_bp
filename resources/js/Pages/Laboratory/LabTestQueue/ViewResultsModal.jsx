import { X, CheckCircle, Image as ImageIcon, Download } from "lucide-react";

export default function ViewResultsModal({ show, onClose, transaction }) {
    if (!show || !transaction) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Sent Result Details
                            </h3>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Transaction: {transaction.transaction_number}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
                        {/* Success Message */}
                        <div className="mb-6 rounded-lg bg-green-50 p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-green-800">
                                        Results Successfully Sent
                                    </h4>
                                    <p className="mt-1 text-sm text-green-700">
                                        Sent to: {transaction.patient_email}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Date & Time: {transaction.created_at}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Sent by:{" "}
                                        {transaction.sent_by || "Lab Staff"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Information */}
                        <div className="mb-6">
                            <h4 className="mb-3 font-semibold text-gray-900">
                                Patient Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Full Name
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {transaction.patient_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Email Address
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {transaction.patient_email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="font-medium text-gray-900">
                                        {transaction.patient_age || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Address
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {transaction.patient_address || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Test Results Sent */}
                        <div>
                            <h4 className="mb-3 font-semibold text-gray-900">
                                Test Results Sent
                            </h4>
                            <div className="space-y-3">
                                {transaction.tests?.map((test) => (
                                    <div
                                        key={test.id}
                                        className="rounded-lg border border-gray-200 bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <h5 className="font-semibold text-gray-900">
                                                        {test.test_name}
                                                    </h5>
                                                </div>

                                                {/* Result Values */}
                                                {(test.result ||
                                                    test.result_value) && (
                                                    <div className="mt-3">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Result:
                                                        </label>
                                                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-900 border border-gray-200">
                                                            {typeof test.result ===
                                                            "object" ? (
                                                                <div>
                                                                    {test.result
                                                                        .result_value && (
                                                                        <div>
                                                                            <strong>
                                                                                Value:
                                                                            </strong>{" "}
                                                                            {
                                                                                test
                                                                                    .result
                                                                                    .result_value
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    {test.result
                                                                        .normal_range && (
                                                                        <div className="text-xs text-gray-600 mt-1">
                                                                            Normal
                                                                            Range:{" "}
                                                                            {
                                                                                test
                                                                                    .result
                                                                                    .normal_range
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : test.result_value ? (
                                                                <div>
                                                                    <div>
                                                                        <strong>
                                                                            Value:
                                                                        </strong>{" "}
                                                                        {
                                                                            test.result_value
                                                                        }
                                                                    </div>
                                                                    {test.normal_range && (
                                                                        <div className="text-xs text-gray-600 mt-1">
                                                                            Normal
                                                                            Range:{" "}
                                                                            {
                                                                                test.normal_range
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                test.result
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Remarks/Notes */}
                                                {(test.notes ||
                                                    test.result_notes) && (
                                                    <div className="mt-3">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Remarks / Notes:
                                                        </label>
                                                        <div className="bg-amber-50 rounded p-3 text-sm text-gray-900 border border-amber-200 italic">
                                                            {test.notes ||
                                                                test.result_notes}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Uploaded Images */}
                                                {test.images &&
                                                    test.images.length > 0 && (
                                                        <div className="mt-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <ImageIcon className="h-4 w-4 text-gray-600" />
                                                                <label className="block text-xs font-medium text-gray-700">
                                                                    Uploaded
                                                                    Images (
                                                                    {
                                                                        test
                                                                            .images
                                                                            .length
                                                                    }
                                                                    )
                                                                </label>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {test.images.map(
                                                                    (
                                                                        img,
                                                                        imgIndex
                                                                    ) => {
                                                                        const imagePath =
                                                                            typeof img ===
                                                                            "string"
                                                                                ? img
                                                                                : img.url ||
                                                                                  img.path;
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    imgIndex
                                                                                }
                                                                                className="relative group"
                                                                            >
                                                                                <a
                                                                                    href={
                                                                                        imagePath
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="block aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                                                                >
                                                                                    <img
                                                                                        src={
                                                                                            imagePath
                                                                                        }
                                                                                        alt={
                                                                                            (typeof img ===
                                                                                                "object" &&
                                                                                                img.name) ||
                                                                                            `Image ${
                                                                                                imgIndex +
                                                                                                1
                                                                                            }`
                                                                                        }
                                                                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                                                                                        onError={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.target.src =
                                                                                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                                                                                        }}
                                                                                    />
                                                                                </a>
                                                                                <a
                                                                                    href={
                                                                                        imagePath
                                                                                    }
                                                                                    download
                                                                                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                                                    onClick={(
                                                                                        e
                                                                                    ) =>
                                                                                        e.stopPropagation()
                                                                                    }
                                                                                >
                                                                                    <Download className="h-3 w-3 text-gray-700" />
                                                                                </a>
                                                                                {typeof img ===
                                                                                    "object" &&
                                                                                    img.name && (
                                                                                        <p className="text-xs text-gray-600 mt-1 truncate">
                                                                                            {
                                                                                                img.name
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                            <span className="ml-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                                                SENT
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
