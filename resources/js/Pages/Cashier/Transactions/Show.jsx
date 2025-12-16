import { useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { ArrowLeft, Printer } from "lucide-react";

export default function TransactionShow({ auth, transaction }) {
    const receiptRef = useRef(null);

    const handlePrint = () => {
        if (!receiptRef.current) return;

        // Get current date and time for print timestamp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const hours12 = hours % 12 || 12;
        const printDateTime = `${year}-${month}-${day} ${String(
            hours12
        ).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

        const printWindow = window.open("", "_blank", "width=220,height=auto");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${transaction.transaction_number}</title>
                    <style>
                        @media print {
                            @page { 
                                size: 58mm auto;
                                margin: 0;
                            }
                        }
                        body { 
                            font-family: Arial, sans-serif;
                            padding: 2px;
                            padding-right: 6px;
                            margin: 0;
                            width: 58mm;
                            font-size: 9px;
                            min-height: auto;
                            box-sizing: border-box;
                            color: #000;
                            font-weight: 600;
                        }
                        * {
                            box-sizing: border-box;
                            color: #000;
                        }
                        .text-center {
                            text-align: left;
                            padding-left: 0;
                        }
                        h2 { 
                            font-size: 14px; 
                            margin: 0 0 2px 0;
                            font-weight: 700;
                            text-align: left;
                            color: #000;
                        }
                        p { 
                            margin: 1px 0;
                            font-size: 9px;
                            font-weight: 600;
                            color: #000;
                            line-height: 1.3;
                        }
                        .queue-bold {
                            font-weight: 700;
                            color: #000;
                            font-size: 10px;
                        }
                        table { 
                            width: 90%; 
                            border-collapse: collapse; 
                            margin-top: 6px;
                            table-layout: fixed;
                        }
                        th { 
                            text-align: left; 
                            font-size: 9px; 
                            padding: 2px 0;
                            text-transform: uppercase;
                            color: #000;
                            font-weight: 700;
                            border-bottom: 1px solid #000;
                        }
                        th:first-child {
                            width: 55%;
                        }
                        th:last-child {
                            width: 45%;
                            text-align: left;
                            padding-left: 0;
                            padding-right: 0;
                        }
                        td { 
                            text-align: left; 
                            font-size: 9px; 
                            padding: 2px 0;
                            color: #000;
                            font-weight: 600;
                        }
                        td:first-child {
                            width: 55%;
                        }
                        td:last-child {
                            width: 45%;
                            text-align: left;
                            padding-left: 0;
                            padding-right: 0;
                        }
                        .summary { 
                            margin-top: 8px;
                            border-top: 1px solid #000;
                            padding-top: 4px;
                        }
                        .summary td {
                            padding: 2px 0;
                            font-size: 9px;
                            color: #000;
                            font-weight: 600;
                        }
                        .summary td:first-child {
                            width: 55%;
                        }
                        .summary td:last-child {
                            width: 45%;
                            text-align: left;
                            padding-left: 0;
                            padding-right: 0;
                        }
                        .summary .net-total td {
                            padding-top: 4px;
                            margin-top: 2px;
                            font-weight: 700;
                            font-size: 10px;
                            color: #000;
                        }
                        .discount {
                            color: #000 !important;
                            font-weight: 600;
                        }
                        .footer-text {
                            margin-top: 5px;
                            font-size: 8px;
                            color: #000;
                            text-align: left;
                            font-weight: 600;
                            line-height: 1.4;
                            word-wrap: break-word;
                            white-space: normal;
                            max-width: 90%;
                        }
                        .receipt-logo {
                            display: block;
                            margin: 6px auto;
                            max-width: 25mm;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <h2>BP Diagnostic Center</h2>
                        <p style="font-weight: 700;">Unofficial Receipt</p>
                        <p>Receipt #: ${transaction.receipt_number}</p>
                        <p>Transaction #: ${transaction.transaction_number}</p>
                        <p class="queue-bold">Queue #: ${
                            transaction.queue_number
                        }</p>
                        <p>Date: ${transaction.created_at}</p>
                        <p>Printed: ${printDateTime}</p>
                        <p>Cashier: ${transaction.cashier?.name || "N/A"}</p>
                        <p style="font-weight: 700; margin-top: 4px;">Bill To:</p>
                        <p>${transaction.patient_name}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>TEST</th>
                                <th>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transaction.tests
                                .map(
                                    (test) => `
                                <tr>
                                    <td>${test.name}</td>
                                    <td>₱${Number(
                                        test.price
                                    ).toLocaleString()}</td>
                                </tr>
                            `
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <table class="summary">
                        <tbody>
                            <tr>
                                <td>Gross Total:</td>
                                <td>₱${Number(
                                    transaction.payment.total_amount
                                ).toLocaleString()}</td>
                            </tr>
                            ${
                                transaction.discount?.amount > 0
                                    ? `
                            <tr class="discount">
                                <td>Discount (${
                                    transaction.discount?.name ||
                                    transaction.discount?.rate + "%"
                                }):</td>
                                <td>-₱${Number(
                                    transaction.discount?.amount
                                ).toLocaleString()}</td>
                            </tr>
                            `
                                    : ""
                            }
                            <tr class="net-total">
                                <td>Net Total:</td>
                                <td>₱${Number(
                                    transaction.payment.net_total ??
                                        transaction.net_total
                                ).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Cash:</td>
                                <td>₱${Number(
                                    transaction.payment.amount_tendered
                                ).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Change:</td>
                                <td>₱${Number(
                                    transaction.payment.change_due
                                ).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p class="footer-text">
                        Please present this receipt when your queue number is called.
                    </p>
                    
                    <img src="/images/logo.png" alt="BP Logo" class="receipt-logo">
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={`Transaction ${transaction.transaction_number}`} />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href={route("cashier.transactions.index")}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Transactions
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                        {transaction.transaction_number}
                    </h1>
                    <p className="text-gray-500">
                        Queue #{transaction.queue_number}
                    </p>
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
                        <h2 className="text-lg font-semibold text-gray-900">
                            Patient Information
                        </h2>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm text-gray-600">
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Patient Name
                                </dt>
                                <dd className="text-gray-900">
                                    {transaction.patient_name}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Contact
                                </dt>
                                <dd className="text-gray-900">
                                    {transaction.patient?.contact || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Date of Birth
                                </dt>
                                <dd className="text-gray-900">
                                    {transaction.patient?.date_of_birth
                                        ? new Date(
                                              transaction.patient.date_of_birth
                                          ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "2-digit",
                                              day: "2-digit",
                                          })
                                        : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Age / Gender
                                </dt>
                                <dd className="text-gray-900">
                                    {transaction.patient?.age || "—"} /{" "}
                                    {transaction.patient?.gender || "—"}
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="font-medium text-gray-500">
                                    Address
                                </dt>
                                <dd className="text-gray-900">
                                    {transaction.patient?.address || "—"}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Selected Tests
                        </h2>
                        <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
                            <table className="w-full text-sm text-gray-700">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            Test
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transaction.tests.map((test) => (
                                        <tr key={test.id}>
                                            <td className="px-4 py-3">
                                                {test.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {test.category}
                                            </td>
                                            <td className="px-4 py-3 text-right capitalize">
                                                {test.status}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                ₱
                                                {Number(
                                                    test.price
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Activity Log
                        </h2>
                        <div className="mt-4 space-y-4">
                            {transaction.events.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No events recorded yet.
                                </p>
                            )}
                            {transaction.events.map((event) => (
                                <div
                                    key={event.id}
                                    className="rounded-lg border border-gray-100 p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                            {event.event_type.replace("_", " ")}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {event.created_at}
                                        </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {event.description}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        By: {event.performed_by || "System"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div
                        className="rounded-xl bg-white p-6 shadow max-w-md mx-auto"
                        ref={receiptRef}
                    >
                        <img
                            src="/images/logo.png"
                            alt="BP Logo"
                            className="block mx-auto mb-4"
                            style={{ maxWidth: "120px", height: "auto" }}
                        />

                        <div className="text-center border-b border-gray-200 pb-3 mb-3">
                            <h2 className="text-lg font-bold text-gray-900">
                                BP DIAGNOSTIC CENTER
                            </h2>
                            <p className="text-xs text-gray-600 mt-1">
                                Complete Laboratory Services
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Official Receipt
                            </p>
                        </div>

                        <div className="space-y-1 text-xs text-gray-700 border-b border-gray-200 pb-3 mb-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Receipt No:
                                </span>
                                <span className="font-semibold">
                                    {transaction.receipt_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Transaction No:
                                </span>
                                <span className="font-semibold">
                                    {transaction.transaction_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-semibold">
                                    {transaction.created_at}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cashier:</span>
                                <span className="font-semibold">
                                    {transaction.cashier?.name || "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="text-center bg-gray-100 py-2 px-3 rounded-lg mb-3">
                            <p className="text-sm font-bold text-gray-900">
                                QUEUE NO: {transaction.queue_number}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-xs font-semibold text-gray-900 mb-2">
                                PATIENT INFORMATION
                            </p>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="font-semibold">
                                        {transaction.patient_name}
                                    </span>
                                </div>
                                {transaction.patient?.contact && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Contact:
                                        </span>
                                        <span className="font-semibold">
                                            {transaction.patient.contact}
                                        </span>
                                    </div>
                                )}
                                {transaction.patient?.age && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Age/Gender:
                                        </span>
                                        <span className="font-semibold">
                                            {transaction.patient.age} /{" "}
                                            {transaction.patient?.gender ||
                                                "N/A"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <table className="w-full text-xs border-t border-b border-gray-200 my-3">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 font-semibold text-gray-700">
                                        Laboratory Test
                                    </th>
                                    <th className="text-right py-2 font-semibold text-gray-700">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.tests.map((test) => (
                                    <tr
                                        key={test.id}
                                        className="border-b border-gray-100"
                                    >
                                        <td className="py-2 text-gray-800">
                                            {test.name}
                                        </td>
                                        <td className="text-right py-2 tabular-nums font-semibold">
                                            ₱
                                            {Number(
                                                test.price
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="space-y-1 text-xs mb-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Gross Total:
                                </span>
                                <span className="font-semibold tabular-nums">
                                    ₱
                                    {Number(
                                        transaction.payment.total_amount
                                    ).toLocaleString()}
                                </span>
                            </div>
                            {transaction.discount?.amount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>
                                        Discount (
                                        {transaction.discount?.name ||
                                            `${transaction.discount?.rate}%`}
                                        ):
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        -₱
                                        {Number(
                                            transaction.discount?.amount
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                                <span className="font-bold text-gray-900">
                                    NET TOTAL:
                                </span>
                                <span className="font-bold text-gray-900 tabular-nums text-sm">
                                    ₱
                                    {Number(
                                        transaction.payment.net_total ??
                                            transaction.net_total
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs mb-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Payment Method:
                                </span>
                                <span className="font-semibold capitalize">
                                    {transaction.payment.method}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Cash Tendered:
                                </span>
                                <span className="font-semibold tabular-nums">
                                    ₱
                                    {Number(
                                        transaction.payment.amount_tendered
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Change:</span>
                                <span className="font-semibold tabular-nums">
                                    ₱
                                    {Number(
                                        transaction.payment.change_due
                                    ).toLocaleString()}
                                </span>
                            </div>
                            {transaction.payment.balance_due > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-red-600">
                                        Balance Due:
                                    </span>
                                    <span className="font-semibold text-red-600 tabular-nums">
                                        ₱
                                        {Number(
                                            transaction.payment.balance_due
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-center text-xs text-gray-600 leading-relaxed border-t border-gray-200 pt-3">
                            Please present this receipt when your queue number
                            is called.
                            <br />
                            Thank you for choosing BP Diagnostic Center!
                            <br />
                            <span className="font-semibold">
                                Keep this receipt for your records.
                            </span>
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Payment Details
                        </h2>
                        <dl className="mt-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <dt>Method</dt>
                                <dd className="font-medium capitalize">
                                    {transaction.payment.method}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Status</dt>
                                <dd className="font-medium capitalize">
                                    {transaction.payment.status}
                                </dd>
                            </div>
                            {transaction.discount?.name && (
                                <div className="flex justify-between">
                                    <dt>Discount</dt>
                                    <dd className="font-medium text-red-600">
                                        {transaction.discount.name} (
                                        {transaction.discount.rate}%)
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt>Amount Tendered</dt>
                                <dd className="font-medium">
                                    ₱
                                    {Number(
                                        transaction.payment.amount_tendered
                                    ).toLocaleString()}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Change</dt>
                                <dd className="font-medium">
                                    ₱
                                    {Number(
                                        transaction.payment.change_due
                                    ).toLocaleString()}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Balance</dt>
                                <dd className="font-medium text-red-600">
                                    ₱
                                    {Number(
                                        transaction.payment.balance_due
                                    ).toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                        <p className="mt-4 text-xs text-gray-500">
                            Cashier: {transaction.cashier?.name || "—"}
                        </p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
