import { useEffect, useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StatsCards from './components/StatsCards';
import PatientInfoForm from './components/PatientInfoForm';
import TestCatalog from './components/TestCatalog';
import PaymentSummary from './components/PaymentSummary';
import SelectedTestsCard from './components/SelectedTestsCard';
import QueuePreview from './components/QueuePreview';
import TransactionsTable from './components/TransactionsTable';

const initialPatient = {
    first_name: '',
    middle_name: '',
    last_name: '',
    age: '',
    gender: '',
    contact: '',
    address: '',
};

const initialPayment = {
    method: 'cash',
    amount_tendered: '',
};

export default function TransactionsIndex({
    auth,
    labTests = {},
    transactions = [],
    stats = {},
    filters = {},
    nextQueueNumber = 1,
    discountOptions = [],
}) {
    const { errors, flash } = usePage().props;
    const [patient, setPatient] = useState(initialPatient);
    const [notes, setNotes] = useState('');
    const [selectedTests, setSelectedTests] = useState([]);
    const [payment, setPayment] = useState(initialPayment);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDiscount, setSelectedDiscount] = useState(
        discountOptions[0] || { id: 'none', name: 'No Discount', rate: 0 }
    );

    useEffect(() => {
        if (discountOptions.length) {
            setSelectedDiscount(discountOptions[0]);
        }
    }, [discountOptions]);

    const catalogById = useMemo(() => {
        const flat = {};
        Object.entries(labTests).forEach(([category, tests]) => {
            tests.forEach((test) => {
                flat[test.id] = { ...test, category };
            });
        });
        return flat;
    }, [labTests]);

    const selectedTestDetails = selectedTests
        .map((testId) => catalogById[testId])
        .filter(Boolean);

    const totalAmount = selectedTestDetails.reduce((sum, test) => sum + Number(test.price || 0), 0);
    const discountRate = selectedDiscount?.rate ?? 0;
    const discountAmount = Number((totalAmount * discountRate) / 100);
    const netTotal = Math.max(totalAmount - discountAmount, 0);
    const amountTendered = Number(payment.amount_tendered || netTotal);
    const changeDue = amountTendered > netTotal ? amountTendered - netTotal : 0;
    const balanceDue = netTotal > amountTendered ? netTotal - amountTendered : 0;

    const toggleTest = (testId) => {
        setSelectedTests((prev) =>
            prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
        );
    };

    const handlePatientChange = (field, value) => {
        setPatient((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePaymentChange = (field, value) => {
        setPayment((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(
            route('cashier.transactions.store'),
            {
                patient,
                tests: selectedTests.map((id) => ({ id })),
                payment,
                notes,
                discount: selectedDiscount
                    ? {
                        id: selectedDiscount.id,
                        name: selectedDiscount.name,
                        rate: selectedDiscount.rate,
                    }
                    : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPatient(initialPatient);
                    setNotes('');
                    setSelectedTests([]);
                    setPayment(initialPayment);
                },
            }
        );
    };

    const submitSearch = () => {
        router.get(
            route('cashier.transactions.index'),
            { search },
            { preserveState: true, replace: true }
        );
    };

    const patientFullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ');

    return (
        <DashboardLayout auth={auth}>
            <Head title="Cashier Transactions" />

            <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900">Cashier Transactions</h1>
                <p className="text-gray-600">
                    Add patients, select tests, manage payments, and print queue receipts.
                </p>
            </div>

            {flash?.success && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {flash.success}
                </div>
            )}

            <StatsCards stats={stats} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <PatientInfoForm patient={patient} errors={errors} onChange={handlePatientChange} />
                        <TestCatalog
                            labTests={labTests}
                            selectedTests={selectedTests}
                            onToggle={toggleTest}
                            errors={errors}
                        />
                        <PaymentSummary
                            payment={payment}
                            onPaymentChange={handlePaymentChange}
                            notes={notes}
                            onNotesChange={setNotes}
                            totals={{
                                gross: totalAmount,
                                discount: discountAmount,
                                net: netTotal,
                                tendered: amountTendered,
                                change: changeDue,
                                balance: balanceDue,
                            }}
                            discountOptions={discountOptions}
                            selectedDiscount={selectedDiscount}
                            onSelectDiscount={setSelectedDiscount}
                            errors={errors}
                        />
                    </form>
                </div>

                <div className="space-y-6">
                    <SelectedTestsCard tests={selectedTestDetails} onRemove={toggleTest} />
                    <QueuePreview
                        patientName={patientFullName}
                        testsCount={selectedTestDetails.length}
                        netTotal={netTotal}
                        queueNumber={nextQueueNumber}
                    />
                </div>
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

