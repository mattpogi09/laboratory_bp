import { useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { ArrowLeft, Printer } from "lucide-react";

export default function TransactionShow({ auth, transaction }) {
    const receiptRef = useRef(null);

    const handlePrint = () => {
        if (!receiptRef.current) return;
        const content = receiptRef.current.innerHTML;
        const printWindow = window.open("", "_blank", "width=220,height=auto");

        // Convert image to base64 for printing
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL("image/png");

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
                            margin: 0;
                            width: 58mm;
                            font-size: 10px;
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
                            padding-left: 2px;
                        }
                        h2 { 
                            font-size: 13px; 
                            margin: 0 0 1px 0;
                            font-weight: 700;
                            text-align: left;
                            color: #000;
                            padding-left: 2px;
                        }
                        p { 
                            margin: 0.5px 0;
                            font-size: 8px;
                            font-weight: 600;
                            color: #000;
                            padding-left: 2px;
                        }
                        .queue-bold {
                            font-weight: 700;
                            color: #000;
                            font-size: 9px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 4px;
                            border-top: 1px solid #ddd;
                            padding-top: 2px;
                        }
                        th { 
                            text-align: left; 
                            font-size: 8px; 
                            padding: 1px 0 1px 2px;
                            text-transform: uppercase;
                            color: #000;
                            font-weight: 700;
                        }
                        th:first-child {
                            width: 60%;
                        }
                        th:last-child {
                            width: 40%;
                            text-align: left;
                        }
                        td { 
                            text-align: left; 
                            font-size: 8px; 
                            padding: 1px 0 1px 2px;
                            border-bottom: 1px solid #f5f5f5;
                            color: #000;
                            font-weight: 600;
                        }
                        td:first-child {
                            width: 60%;
                        }
                        td:last-child {
                            width: 40%;
                            text-align: left;
                        }
                        .summary { 
                            margin-top: 4px;
                            border-top: 1px solid #ddd;
                            padding-top: 2px;
                        }
                        .summary td {
                            border-bottom: none;
                            padding: 1px 0 1px 2px;
                            font-size: 8px;
                            color: #000;
                            font-weight: 600;
                        }
                        .summary td:first-child {
                            width: 60%;
                        }
                        .summary td:last-child {
                            width: 40%;
                            text-align: left;
                        }
                        .summary .net-total td {
                            border-top: 1px solid #333;
                            padding-top: 3px;
                            margin-top: 2px;
                            font-weight: 700;
                            font-size: 9px;
                            color: #000;
                        }
                        .discount {
                            color: #000 !important;
                            font-weight: 600;
                        }
                        .footer-text {
                            margin-top: 6px;
                            font-size: 6px;
                            color: #000;
                            text-align: left;
                            padding: 2px;
                            font-weight: 700;
                            line-height: 1.4;
                            word-wrap: break-word;
                            white-space: normal;
                            max-width: 100%;
                            overflow-wrap: break-word;
                        }
                        .receipt-logo {
                            display: block;
                            margin: 6px auto 4px auto;
                            max-width: 35mm;
                            height: auto;
                        }
                        .border-section {
                            border-top: 1px solid #ddd;
                            margin-top: 8px;
                            padding-top: 8px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    ${content.replace("/images/bp_logo.png", base64)}
                </body>
            </html>
        `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };

        img.onerror = function () {
            // Fallback: print without logo if image fails to load
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
                            margin: 0;
                            width: 58mm;
                            font-size: 10px;
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
                            padding-left: 2px;
                        }
                        h2 { 
                            font-size: 13px; 
                            margin: 0 0 1px 0;
                            font-weight: 700;
                            text-align: left;
                            color: #000;
                            padding-left: 2px;
                        }
                        p { 
                            margin: 0.5px 0;
                            font-size: 8px;
                            font-weight: 600;
                            color: #000;
                            padding-left: 2px;
                        }
                        .queue-bold {
                            font-weight: 700;
                            color: #000;
                            font-size: 9px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 4px;
                            border-top: 1px solid #ddd;
                            padding-top: 2px;
                        }
                        th { 
                            text-align: left; 
                            font-size: 8px; 
                            padding: 1px 0 1px 2px;
                            text-transform: uppercase;
                            color: #000;
                            font-weight: 700;
                        }
                        th:first-child {
                            width: 60%;
                        }
                        th:last-child {
                            width: 40%;
                            text-align: left;
                        }
                        td { 
                            text-align: left; 
                            font-size: 8px; 
                            padding: 1px 0 1px 2px;
                            border-bottom: 1px solid #f5f5f5;
                            color: #000;
                            font-weight: 600;
                        }
                        td:first-child {
                            width: 60%;
                        }
                        td:last-child {
                            width: 40%;
                            text-align: left;
                        }
                        .summary { 
                            margin-top: 4px;
                            border-top: 1px solid #ddd;
                            padding-top: 2px;
                        }
                        .summary td {
                            border-bottom: none;
                            padding: 1px 0 1px 2px;
                            font-size: 8px;
                            color: #000;
                            font-weight: 600;
                        }
                        .summary td:first-child {
                            width: 60%;
                        }
                        .summary td:last-child {
                            width: 40%;
                            text-align: left;
                        }
                        .summary .net-total td {
                            border-top: 1px solid #333;
                            padding-top: 3px;
                            margin-top: 2px;
                            font-weight: 700;
                            font-size: 9px;
                            color: #000;
                        }
                        .discount {
                            color: #000 !important;
                            font-weight: 600;
                        }
                        .footer-text {
                            margin-top: 6px;
                            font-size: 6px;
                            color: #000;
                            text-align: left;
                            padding: 2px;
                            font-weight: 700;
                            line-height: 1.4;
                            word-wrap: break-word;
                            white-space: normal;
                            max-width: 100%;
                            overflow-wrap: break-word;
                        }
                        .receipt-logo {
                            display: block;
                            margin: 6px auto 4px auto;
                            max-width: 35mm;
                            height: auto;
                        }
                        .border-section {
                            border-top: 1px solid #ddd;
                            margin-top: 8px;
                            padding-top: 8px;
                            text-align: center;
                        }
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

        img.src = "/images/bp_logo.png";
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
                                    Age / Gender
                                </dt>
                                <dd className="text-gray-900">
                                    {transaction.patient?.age || "—"} /{" "}
                                    {transaction.patient?.gender || "—"}
                                </dd>
                            </div>
                            <div>
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
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-gray-900">
                                BP Diagnostic Center
                            </h2>
                            <p className="text-xs text-gray-500">
                                Official Receipt
                            </p>
                        </div>
                        <div className="mt-4 text-sm text-gray-700 text-center">
                            <p>Receipt #: {transaction.receipt_number}</p>
                            <p>
                                Transaction #: {transaction.transaction_number}
                            </p>
                            <p>
                                <span className="queue-bold">
                                    Queue #: {transaction.queue_number}
                                </span>
                            </p>
                            <p>Date: {transaction.created_at}</p>
                            <p>Cashier: {transaction.cashier?.name || "N/A"}</p>
                        </div>
                        <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-700 text-center">
                            <p className="font-semibold text-gray-900">
                                Bill To:
                            </p>
                            <p>{transaction.patient_name}</p>
                        </div>
                        <table className="mt-4 w-full text-sm border-t border-gray-100 pt-4">
                            <thead className="text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="pb-2">Test</th>
                                    <th className="text-right pb-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.tests.map((test) => (
                                    <tr
                                        key={test.id}
                                        className="border-b border-gray-50"
                                    >
                                        <td className="py-2">{test.name}</td>
                                        <td className="text-right py-2 tabular-nums">
                                            ₱
                                            {Number(
                                                test.price
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <table className="mt-4 w-full text-sm border-t border-gray-100 pt-4 summary">
                            <tbody>
                                <tr>
                                    <td className="py-1">Gross Total:</td>
                                    <td className="text-right py-1 tabular-nums">
                                        ₱
                                        {Number(
                                            transaction.payment.total_amount
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                                {transaction.discount?.amount > 0 && (
                                    <tr className="discount">
                                        <td className="py-1">
                                            Discount (
                                            {transaction.discount?.name ||
                                                `${transaction.discount?.rate}%`}
                                            ):
                                        </td>
                                        <td className="text-right py-1 tabular-nums">
                                            -₱
                                            {Number(
                                                transaction.discount?.amount
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                )}
                                <tr className="net-total">
                                    <td className="py-2 font-semibold">
                                        Net Total:
                                    </td>
                                    <td className="text-right py-2 tabular-nums font-semibold">
                                        ₱
                                        {Number(
                                            transaction.payment.net_total ??
                                                transaction.net_total
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1">Cash:</td>
                                    <td className="text-right py-1 tabular-nums">
                                        ₱
                                        {Number(
                                            transaction.payment.amount_tendered
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1">Change:</td>
                                    <td className="text-right py-1 tabular-nums">
                                        ₱
                                        {Number(
                                            transaction.payment.change_due
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="mt-6 text-center text-xs text-gray-500 footer-text">
                            Please present this receipt when your number is
                            called.
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
