import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Eye, FileText, User, Mail, Calendar, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
import ViewResultModal from './ViewResultModal';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function ResultHistory({ auth, sentResults, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedResult, setSelectedResult] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [sortBy, setSortBy] = useState(filters.sort_by || 'sent_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [submissionType, setSubmissionType] = useState(filters.submission_type || 'all');

    // Debounced search - wait 300ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== filters.search) {
                setIsSearching(true);
                router.get(
                    route('lab-test-queue.result-history'),
                    { 
                        search: searchQuery,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                        submission_type: submissionType,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        onFinish: () => setIsSearching(false),
                    }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (column) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
        
        router.get(
            route('lab-test-queue.result-history'),
            {
                search: searchQuery,
                sort_by: column,
                sort_order: newSortOrder,
                submission_type: submissionType,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = (type) => {
        setSubmissionType(type);
        router.get(
            route('lab-test-queue.result-history'),
            {
                search: searchQuery,
                sort_by: sortBy,
                sort_order: sortOrder,
                submission_type: type,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleViewDetails = (result) => {
        setSelectedResult(result);
        setShowViewModal(true);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Result History" />

            {isSearching && <LoadingOverlay message="Searching..." />}

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Result History</h1>
                <p className="text-gray-600">View all sent patient test results</p>
            </div>

            {/* Search Bar and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
                <div className="flex gap-2">
                    <select
                        value={submissionType}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    >
                        <option value="all">All Types</option>
                        <option value="full_results">Full Results</option>
                        <option value="notification">Notifications</option>
                    </select>
                </div>
            </div>

            {/* History Table */}
            <div className="rounded-xl bg-white shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('transaction_number')}
                                >
                                    <div className="flex items-center gap-1">
                                        Transaction Code
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('patient_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Patient Name
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tests Sent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('sent_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Date Sent
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
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
                            {sentResults.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? 'No results found for your search.' : 'No results have been sent yet.'}
                                    </td>
                                </tr>
                            ) : (
                                sentResults.data?.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {result.transaction_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{result.patient_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                result.submission_type === 'full_results' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {result.submission_type === 'full_results' ? 'Full Results' : 'Notification'}
                                            </span>
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

                {/* Pagination */}
                {sentResults.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => router.get(sentResults.prev_page_url)}
                                disabled={!sentResults.prev_page_url}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => router.get(sentResults.next_page_url)}
                                disabled={!sentResults.next_page_url}
                                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{sentResults.from}</span> to{' '}
                                    <span className="font-medium">{sentResults.to}</span> of{' '}
                                    <span className="font-medium">{sentResults.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => router.get(sentResults.prev_page_url)}
                                        disabled={!sentResults.prev_page_url}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                                        {sentResults.current_page} / {sentResults.last_page}
                                    </span>
                                    <button
                                        onClick={() => router.get(sentResults.next_page_url)}
                                        disabled={!sentResults.next_page_url}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
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
