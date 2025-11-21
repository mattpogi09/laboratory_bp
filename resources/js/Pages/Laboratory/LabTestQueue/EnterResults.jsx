import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EnterResults({ auth, test }) {
    const { errors, flash } = usePage().props;
    const [formData, setFormData] = useState({
        result_value: test.result_values?.result_value || '',
        normal_range: test.result_values?.normal_range || '',
        result_notes: test.result_notes || '',
        status: test.status || 'pending',
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.patch(
            route('lab-test-queue.tests.update', test.id),
            {
                status: formData.status,
                result_notes: formData.result_notes,
                result_values: {
                    result_value: formData.result_value,
                    normal_range: formData.normal_range,
                },
            },
            { preserveScroll: true }
        );
    };

    const statusStyles = {
        pending: 'bg-red-500 text-white',
        processing: 'bg-yellow-500 text-white',
        completed: 'bg-blue-500 text-white',
        released: 'bg-green-500 text-white',
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Test Result Entry" />

            <div className="mb-6">
                <Link
                    href={route('lab-test-queue')}
                    className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900">Test Result Entry</h1>
                <p className="text-gray-600">
                    Update findings for queue #{test.queue_number} - {test.transaction_number}
                </p>
            </div>

            {flash?.success && (
                <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {flash.success}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
                    <dl className="mt-4 space-y-3 text-sm text-gray-600">
                        <div>
                            <dt className="text-gray-500">Patient Name</dt>
                            <dd className="text-base font-semibold text-gray-900">{test.transaction?.patient?.name}</dd>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-gray-500">Age</dt>
                                <dd className="font-medium text-gray-900">{test.transaction?.patient?.age || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Gender</dt>
                                <dd className="font-medium text-gray-900">{test.transaction?.patient?.gender || '—'}</dd>
                            </div>
                        </div>
                        <div>
                            <dt className="text-gray-500">Contact</dt>
                            <dd className="font-medium text-gray-900">{test.transaction?.patient?.contact || '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Test Name</dt>
                            <dd className="font-semibold text-gray-900">{test.test_name}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Requested On</dt>
                            <dd className="font-medium text-gray-900">{test.transaction?.created_at}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Status</dt>
                            <dd>
                                <span
                                    className={cn(
                                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                                        statusStyles[test.status] || 'bg-gray-200 text-gray-600'
                                    )}
                                >
                                    {test.status?.replace('_', ' ')}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold text-gray-900">Clinical Results</h2>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Result Value <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.result_value}
                                onChange={(e) => handleChange('result_value', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                placeholder="e.g. RBC 4.10 x10^12/L"
                            />
                            {errors?.result_values && (
                                <p className="mt-1 text-xs text-red-600">{errors.result_values}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Normal Range</label>
                            <input
                                type="text"
                                value={formData.normal_range}
                                onChange={(e) => handleChange('normal_range', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                placeholder="e.g. 4.0 - 5.2 x10^12/L"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Test Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="released">Released</option>
                            </select>
                            {errors?.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Remarks / Notes</label>
                            <textarea
                                rows="4"
                                value={formData.result_notes}
                                onChange={(e) => handleChange('result_notes', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                placeholder="Enter any remarks or interpretation"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-red-700"
                        >
                            <Save className="h-5 w-5" />
                            Save Results
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
