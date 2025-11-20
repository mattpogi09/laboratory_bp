import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import TransactionsTable from './components/TransactionsTable';

export default function TransactionsHistory({ auth, transactions = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const submitSearch = () => {
        router.get(
            route('cashier.transactions.history'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Transaction History" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Transaction History</h1>
                <p className="text-gray-600">
                    Review all recorded payments, discounts, and receipts across patients.
                </p>
            </div>

            <TransactionsTable
                transactions={transactions}
                search={search}
                onSearchChange={setSearch}
                onSubmit={submitSearch}
            />
        </DashboardLayout>
    );
}

