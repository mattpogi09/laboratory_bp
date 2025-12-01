import { useState } from "react";
import Modal from "@/Components/Modal";
import { X, FileText } from "lucide-react";
import TestResultDetailsModal from "./TestResultDetailsModal";

export default function PatientDetailsModal({ patient, show, onClose }) {
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [showTestDetails, setShowTestDetails] = useState(false);

    const handleTestClick = (testId) => {
        setSelectedTestId(testId);
        setShowTestDetails(true);
    };

    const handleCloseTestDetails = () => {
        setShowTestDetails(false);
        setSelectedTestId(null);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "text-red-600 bg-red-500/10";
            case "processing":
                return "text-yellow-600 bg-yellow-500/10";
            case "completed":
                return "text-blue-600 bg-blue-500/10";
            case "released":
                return "text-green-600 bg-green-500/10";
            default:
                return "text-gray-400 bg-gray-500/10";
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Patient Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Patient Info Card */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-900 flex items-center justify-center text-white text-xl sm:text-2xl font-semibold">
                            {patient.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-black">
                                {patient.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {patient.email || "No email provided"}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                            <span className="text-black">Contact:</span>
                            <span className="text-black ml-2">
                                {patient.contact_number}
                            </span>
                        </div>
                        <div>
                            <span className="text-black">Date of Birth:</span>
                            <span className="text-black ml-2">
                                {patient.date_of_birth
                                    ? new Date(
                                          patient.date_of_birth
                                      ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                      })
                                    : "N/A"}
                            </span>
                        </div>
                        <div>
                            <span className="text-black">Age / Gender:</span>
                            <span className="text-black ml-2">
                                {patient.age} / {patient.gender}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-black">Email:</span>
                            <span className="text-black ml-2">
                                {patient.email || "N/A"}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-black">Address:</span>
                            <span className="text-black ml-2">
                                {patient.address || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Test History */}
                <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">
                        Test History
                    </h3>
                    {patient.tests && patient.tests.length > 0 ? (
                        <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
                            {patient.tests.map((test, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTestClick(test.id)}
                                    className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group gap-2 sm:gap-0 touch-manipulation"
                                >
                                    <div className="flex items-start sm:items-center gap-3 flex-1 w-full">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 group-hover:text-blue-700 mt-0.5 sm:mt-0 flex-shrink-0" />
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-900 truncate">
                                                {test.name}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-gray-500">
                                                {test.date}
                                            </p>
                                            {test.result && (
                                                <p className="text-[10px] sm:text-xs text-gray-600 mt-1 truncate">
                                                    Result: {test.result}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize whitespace-nowrap ${getStatusColor(
                                            test.status
                                        )}`}
                                    >
                                        {test.status}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">
                            No test history available
                        </p>
                    )}
                </div>
            </div>

            {/* Test Result Details Modal */}
            <TestResultDetailsModal
                testId={selectedTestId}
                show={showTestDetails}
                onClose={handleCloseTestDetails}
            />
        </Modal>
    );
}
