import { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Printer } from 'lucide-react';

export default function TransactionShow({ auth, transaction }) {
    const receiptRef = useRef(null);

    const handlePrint = () => {
        if (!receiptRef.current) return;
        const content = receiptRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=450,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${transaction.transaction_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 16px; }
                        h1 { font-size: 18px; margin-bottom: 8px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                        th, td { text-align: left; font-size: 13px; padding: 4px 0; }
                        .summary { margin-top: 12px; }
                        .summary div { display: flex; justify-content: space-between; font-size: 14px; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={`Transaction ${transaction.transaction_number}`} />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href={route('cashier.transactions.index')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Transactions
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold text-gray-900">{transaction.transaction_number}</h1>
                    <p className="text-gray-500">Queue #{transaction.queue_number}</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm text-gray-600">
                            <div>
                                <dt className="font-medium text-gray-500">Patient Name</dt>
                                <dd className="text-gray-900">{transaction.patient_name}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">Contact</dt>
                                <dd className="text-gray-900">{transaction.patient?.contact || '—'}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">Age / Gender</dt>
                                <dd className="text-gray-900">
                                    {transaction.patient?.age || '—'} / {transaction.patient?.gender || '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">Address</dt>
                                <dd className="text-gray-900">{transaction.patient?.address || '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900">Selected Tests</h2>
                        <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
                            <table className="w-full text-sm text-gray-700">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Test</th>
                                        <th className="px-4 py-3 text-left">Category</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                        <th className="px-4 py-3 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transaction.tests.map((test) => (
                                        <tr key={test.id}>
                                            <td className="px-4 py-3">{test.name}</td>
                                            <td className="px-4 py-3">{test.category}</td>
                                            <td className="px-4 py-3 text-right capitalize">{test.status}</td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                ₱{Number(test.price).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
                        <div className="mt-4 space-y-4">
                            {transaction.events.length === 0 && (
                                <p className="text-sm text-gray-500">No events recorded yet.</p>
                            )}
                            {transaction.events.map((event) => (
                                <div key={event.id} className="rounded-lg border border-gray-100 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                            {event.event_type.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-gray-500">{event.created_at}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                                    <p className="mt-1 text-xs text-gray-400">By: {event.performed_by || 'System'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow" ref={receiptRef}>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-gray-900">BP Diagnostic Center</h2>
                            <p className="text-xs text-gray-500">Official Receipt</p>
                        </div>
                        <div className="mt-4 text-sm text-gray-700">
                            <p>Receipt #: {transaction.receipt_number}</p>
                            <p>Transaction #: {transaction.transaction_number}</p>
                            <p>Queue #: {transaction.queue_number}</p>
                            <p>Date: {transaction.created_at}</p>
                        </div>
                        <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">Bill To:</p>
                            <p>{transaction.patient_name}</p>
                            <p>{transaction.patient?.contact || ''}</p>
                        </div>
                        <table className="mt-4 w-full text-sm">
                            <thead className="text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th>Test</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.tests.map((test) => (
                                    <tr key={test.id}>
                                        <td>{test.name}</td>
                                        <td className="text-right">₱{Number(test.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="summary">
                            <div>
                                <span>Gross Total:</span>
                                <span>₱{Number(transaction.payment.total_amount).toLocaleString()}</span>
                            </div>
                            {transaction.discount?.amount > 0 && (
                                <div>
                                    <span>Discount ({transaction.discount?.name || `${transaction.discount?.rate}%`}):</span>
                                    <span>-₱{Number(transaction.discount?.amount).toLocaleString()}</span>
                                </div>
                            )}
                            <div>
                                <span>Net Total:</span>
                                <span>₱{Number(transaction.payment.net_total ?? transaction.net_total).toLocaleString()}</span>
                            </div>
                            <div>
                                <span>Cash:</span>
                                <span>₱{Number(transaction.payment.amount_tendered).toLocaleString()}</span>
                            </div>
                            <div>
                                <span>Change:</span>
                                <span>₱{Number(transaction.payment.change_due).toLocaleString()}</span>
                            </div>
                        </div>
                        <p className="mt-6 text-center text-xs text-gray-500">
                            Please present this receipt to the laboratory staff when your number is called.
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
                        <dl className="mt-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <dt>Method</dt>
                                <dd className="font-medium capitalize">{transaction.payment.method}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Status</dt>
                                <dd className="font-medium capitalize">{transaction.payment.status}</dd>
                            </div>
                            {transaction.discount?.name && (
                                <div className="flex justify-between">
                                    <dt>Discount</dt>
                                    <dd className="font-medium text-red-600">
                                        {transaction.discount.name} ({transaction.discount.rate}%)
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt>Amount Tendered</dt>
                                <dd className="font-medium">₱{Number(transaction.payment.amount_tendered).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Change</dt>
                                <dd className="font-medium">₱{Number(transaction.payment.change_due).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Balance</dt>
                                <dd className="font-medium text-red-600">
                                    ₱{Number(transaction.payment.balance_due).toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                        <p className="mt-4 text-xs text-gray-500">Cashier: {transaction.cashier?.name || '—'}</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

