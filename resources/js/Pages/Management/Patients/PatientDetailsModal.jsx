import Modal from '@/Components/Modal';
import { X, FileText } from 'lucide-react';

export default function PatientDetailsModal({ patient, show, onClose }) {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'text-blue-400 bg-blue-500/10';
            case 'released':
                return 'text-emerald-400 bg-emerald-500/10';
            case 'normal':
                return 'text-emerald-400 bg-emerald-500/10';
            default:
                return 'text-gray-400 bg-gray-500/10';
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Patient Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Patient Info Card */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-red-900 flex items-center justify-center text-white text-2xl font-semibold">
                            {patient.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-black">{patient.name}</h3>
                            <p className="text-sm text-gray-400">Patient ID: {patient.id}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-black">Age / Gender:</span>
                            <span className="text-black ml-2">{patient.age} / {patient.gender}</span>
                        </div>
                        <div>
                            <span className="text-black">Contact:</span>
                            <span className="text-black ml-2">{patient.contact}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-black">Email:</span>
                            <span className="text-black ml-2">{patient.email}</span>
                        </div>
                    </div>
                </div>

                {/* Test History */}
                <div>
                    <h3 className="text-base font-semibold text-white mb-4">Test History</h3>
                    <div className="space-y-2">
                        {patient.tests?.map((test, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-black">{test.name}</p>
                                        <p className="text-xs text-black">{test.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                                        {test.status}
                                    </span>
                                    <button className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">
                                        Normal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
