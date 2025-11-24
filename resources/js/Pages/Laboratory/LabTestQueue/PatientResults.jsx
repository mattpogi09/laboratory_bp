import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Send, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import SendResultsModal from './SendResultsModal';

export default function PatientResults({ auth, transactions = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showSendModal, setShowSendModal] = useState(false);

    const filteredTransactions = transactions.filter(transaction =>
        transaction.transaction_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.patient_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendResults = (transaction) => {
        // Check if all tests are completed
        const incomplete = transaction.tests?.filter(test => test.status !== 'completed') || [];
        
        if (incomplete.length > 0) {
            // Show error modal with incomplete tests
            setSelectedTransaction({
                ...transaction,
                incompleteTests: incomplete
            });
            setShowSendModal(true);
        } else {
            // All tests completed, show send modal
            setSelectedTransaction(transaction);
            setShowSendModal(true);
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Patient Results" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Patient Results</h1>
                <p className="text-gray-600">Send completed test results to patients</p>
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

            {/* Results Table */}
            <div className="rounded-xl bg-white shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Full Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tests
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Completed Tests
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? 'No results found for your search.' : 'No patients with completed tests.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">
                                                {transaction.transaction_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{transaction.patient_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                {transaction.tests?.map((test, idx) => test.test_name).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{transaction.patient_email}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{transaction.created_at}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                All Completed
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {transaction.completed_tests_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleSendResults(transaction)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                                            >
                                                <Send className="h-4 w-4" />
                                                Send Results
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Send Results Modal */}
            {selectedTransaction && (
                <SendResultsModal
                    show={showSendModal}
                    transaction={selectedTransaction}
                    onClose={() => {
                        setShowSendModal(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
