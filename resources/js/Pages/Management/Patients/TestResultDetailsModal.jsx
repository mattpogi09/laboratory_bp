import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import {
    X,
    FileText,
    User,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Image as ImageIcon,
    Download,
} from "lucide-react";
import axios from "axios";

export default function TestResultDetailsModal({ testId, show, onClose }) {
    const [loading, setLoading] = useState(true);
    const [testDetails, setTestDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && testId) {
            fetchTestDetails();
        }
    }, [show, testId]);

    const fetchTestDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching test details for ID:", testId);
            const response = await axios.get(
                route("patients.test-details", testId)
            );
            console.log("Test details response:", response.data);
            console.log("Documents:", response.data.documents);
            setTestDetails(response.data);
        } catch (err) {
            console.error("Error fetching test details:", err);
            console.error("Error response:", err.response);
            const errorMsg =
                err.response?.data?.message ||
                "Failed to load test details. Please try again.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return <AlertCircle className="h-4 w-4" />;
            case "processing":
                return <Clock className="h-4 w-4" />;
            case "completed":
            case "released":
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderResultValues = () => {
        if (!testDetails?.result_values) {
            return (
                <p className="text-sm text-gray-500 italic">
                    No results available yet
                </p>
            );
        }

        const values = testDetails.result_values;

        return (
            <div className="space-y-3">
                {Object.entries(values).map(([key, value]) => {
                    // Skip internal/metadata fields
                    if (key === "result_value" || key === "metadata")
                        return null;

                    const displayKey = key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                        <div
                            key={key}
                            className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
                        >
                            <span className="text-sm font-medium text-gray-700">
                                {displayKey}:
                            </span>
                            <span className="text-sm text-gray-900 text-right max-w-xs">
                                {typeof value === "object"
                                    ? JSON.stringify(value, null, 2)
                                    : value || "N/A"}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderImages = () => {
        if (!testDetails?.documents || testDetails.documents.length === 0) {
            return (
                <p className="text-sm text-gray-500 italic text-center py-4">
                    No images uploaded
                </p>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-4">
                {testDetails.documents.map((doc, index) => {
                    // Handle different path formats
                    const imagePath = doc.path?.startsWith("/")
                        ? doc.path
                        : `/storage/${doc.path}`;

                    return (
                        <div key={index} className="relative group">
                            <a
                                href={imagePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                            >
                                <img
                                    src={imagePath}
                                    alt={
                                        doc.name || `Result image ${index + 1}`
                                    }
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                        console.error(
                                            "Failed to load image:",
                                            imagePath,
                                            doc
                                        );
                                        e.target.src =
                                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </a>
                            <a
                                href={imagePath}
                                download
                                className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Download className="h-4 w-4 text-gray-700" />
                            </a>
                            {doc.name && (
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                    {doc.name}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Test Result Details
                            </h2>
                            <p className="text-sm text-gray-500">
                                Complete test information and results
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : testDetails ? (
                    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {/* Test Information */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Test Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Test Name
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {testDetails.test_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Category
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {testDetails.category || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Status
                                    </p>
                                    <div
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                            testDetails.status
                                        )}`}
                                    >
                                        {getStatusIcon(testDetails.status)}
                                        {testDetails.status}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Price
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        ₱
                                        {Number(
                                            testDetails.price
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lab Staff Information */}
                        {testDetails.performed_by && (
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Processed By
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        {testDetails.performed_by.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {testDetails.performed_by.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4 text-gray-600" />
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Timeline
                                </h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                {testDetails.started_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Started:
                                        </span>
                                        <span className="text-gray-900">
                                            {formatDate(testDetails.started_at)}
                                        </span>
                                    </div>
                                )}
                                {testDetails.completed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Completed:
                                        </span>
                                        <span className="text-gray-900">
                                            {formatDate(
                                                testDetails.completed_at
                                            )}
                                        </span>
                                    </div>
                                )}
                                {testDetails.released_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Released:
                                        </span>
                                        <span className="text-gray-900">
                                            {formatDate(
                                                testDetails.released_at
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Result Values */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Result Values
                            </h3>
                            {renderResultValues()}
                        </div>

                        {/* Normal Range */}
                        {testDetails.normal_range && (
                            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                    Normal Range
                                </h3>
                                <p className="text-sm text-gray-700">
                                    {testDetails.normal_range}
                                </p>
                            </div>
                        )}

                        {/* Result Notes */}
                        {testDetails.result_notes && (
                            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                    Notes & Remarks
                                </h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {testDetails.result_notes}
                                </p>
                            </div>
                        )}

                        {/* Uploaded Images */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ImageIcon className="h-4 w-4 text-gray-600" />
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Uploaded Images
                                </h3>
                                {testDetails.documents?.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                        ({testDetails.documents.length})
                                    </span>
                                )}
                            </div>
                            {renderImages()}
                        </div>
                    </div>
                ) : null}
            </div>
        </Modal>
    );
}
