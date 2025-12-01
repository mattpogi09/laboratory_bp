import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import LoadingOverlay from "@/Components/LoadingOverlay";
import TransactionsTable from "./components/TransactionsTable";

export default function TransactionsHistory({
    auth,
    transactions = { data: [] },
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search with 300ms delay
    useEffect(() => {
        // Skip if this is the initial mount or search hasn't changed
        if (search === (filters.search || "")) return;

        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                route("cashier.transactions.history"),
                { search },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsSearching(false);
        };
    }, [search]);

    const submitSearch = () => {
        // Form submit does nothing, search is automatic
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Transaction History" />

            <LoadingOverlay show={isSearching} message="Searching..." />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Transaction History
                </h1>
                <p className="text-gray-600">
                    Review all recorded payments, discounts, and receipts across
                    patients.
                </p>
            </div>

            <TransactionsTable
                transactions={transactions.data || []}
                pagination={transactions}
                search={search}
                onSearchChange={setSearch}
                onSubmit={submitSearch}
            />
        </DashboardLayout>
    );
}
