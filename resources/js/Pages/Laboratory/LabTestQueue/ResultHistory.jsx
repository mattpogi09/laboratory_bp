import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Eye, FileText, User, Mail, Calendar } from 'lucide-react';
import ViewResultModal from './ViewResultModal';

export default function ResultHistory({ auth, sentResults = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const filteredResults = sentResults.filter(result =>
        result.transaction_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.patient_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewDetails = (result) => {
        setSelectedResult(result);
        setShowViewModal(true);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Result History" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Result History</h1>
                <p className="text-gray-600">View all sent patient test results</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by transaction code, patient name, or email..."
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* History Table */}
            <div className="rounded-xl bg-white shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tests Sent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Sent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sent By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? 'No results found for your search.' : 'No results have been sent yet.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">
                                                {result.transaction_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{result.patient_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                {result.tests?.map((test, idx) => (
                                                    <div key={idx} className="flex items-center gap-1">
                                                        <FileText className="h-3 w-3 text-gray-400" />
                                                        {test.test_name}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{result.patient_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{result.sent_at}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">{result.sent_by_name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDetails(result)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            {selectedResult && (
                <ViewResultModal
                    show={showViewModal}
                    result={selectedResult}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedResult(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
