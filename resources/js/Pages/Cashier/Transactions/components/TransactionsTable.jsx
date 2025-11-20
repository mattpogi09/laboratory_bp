import { Link } from '@inertiajs/react';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TransactionsTable({ transactions = [], search, onSearchChange, onSubmit }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-amber-500/10 text-amber-700',
            paid: 'bg-emerald-500/10 text-emerald-700',
            completed: 'bg-emerald-500/10 text-emerald-700',
            in_progress: 'bg-blue-500/10 text-blue-700',
            released: 'bg-purple-500/10 text-purple-700',
        };
        return map[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <section className="mt-10 rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                    <p className="text-sm text-gray-500">
                        Track queue tickets, discounts, payments, and print receipts anytime.
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                >
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search patient or transaction #"
                        className="flex-1 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3">Queue</th>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Tests</th>
                            <th className="px-4 py-3">Discount</th>
                            <th className="px-4 py-3">Net Amount</th>
                            <th className="px-4 py-3">Lab Status</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                                    No transactions yet. Start by adding a new patient.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-900">
                                        #{transaction.queue_number}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">
                                            {transaction.patient_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {transaction.transaction_number}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {transaction.tests.map((test) => test.name).join(', ')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-red-600">
                                        {transaction.discount_amount > 0
                                            ? `-₱${Number(transaction.discount_amount).toLocaleString()}`
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-900">
                                        ₱{Number(transaction.net_total ?? transaction.total_amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-1 text-xs font-semibold capitalize',
                                                statusBadge(transaction.lab_status)
                                            )}
                                        >
                                            {transaction.lab_status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-1 text-xs font-semibold capitalize',
                                                statusBadge(transaction.payment_status)
                                            )}
                                        >
                                            {transaction.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={route('cashier.transactions.show', transaction.id)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-600"
                                        >
                                            View Receipt
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

