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
import axios from 'axios';

const initialPatient = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
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
    const [duplicateTests, setDuplicateTests] = useState([]);

    useEffect(() => {
        if (discountOptions.length) {
            setSelectedDiscount(discountOptions[0]);
        }
    }, [discountOptions]);

    // Check for duplicate tests when patient or selected tests change
    useEffect(() => {
        if (patient.id && selectedTests.length > 0) {
            axios.post(route('cashier.transactions.check-duplicates'), {
                patient_id: patient.id,
                test_ids: selectedTests,
            })
            .then(response => {
                setDuplicateTests(response.data.duplicates || []);
            })
            .catch(() => {
                setDuplicateTests([]);
            });
        } else {
            setDuplicateTests([]);
        }
    }, [patient.id, selectedTests]);

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

    const patientFullName = [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(' ');

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-red-500/10 text-red-700';
            case 'processing':
                return 'bg-yellow-500/10 text-yellow-700';
            case 'completed':
                return 'bg-blue-500/10 text-blue-700';
            case 'released':
                return 'bg-green-500/10 text-green-700';
            default:
                return 'bg-gray-500/10 text-gray-700';
        }
    };

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
                        
                        {duplicateTests.length > 0 && (
                            <div className="rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3 shadow-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-amber-900 mb-1">⚠️ Duplicate Tests Detected</h3>
                                        <p className="text-sm text-amber-800 mb-2">
                                            This patient already has the following tests that are pending or in progress:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                                            {duplicateTests.map((test, index) => (
                                                <li key={index}>
                                                    <span className="font-medium">{test.test_name}</span>
                                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${getStatusBadgeClass(test.status)}`}>
                                                        {test.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-sm text-amber-800 mt-2 font-medium">
                                            ❌ You cannot submit this transaction until these tests are completed or removed from selection.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
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
        </DashboardLayout>
    );
}

