import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function EnterResults({ auth, transactionId }) {
    const [formData, setFormData] = useState({
        resultValue: '',
        normalRange: '',
        remarks: '',
        status: 'processing'
    });

    // Sample patient data
    const patientData = {
        name: 'Juan Dela Cruz',
        patientId: 'P2024-001',
        birthdate: '1980-05-15',
        transactionCode: 'T-00123',
        testName: 'Complete Blood Count',
        createdAt: 'Nov 6, 2025, 10:15 AM'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form data:', formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Test Result Entry" />

            {/* Header */}
            <div className="mb-6">
                <Link
                    href={route('lab-test-queue')}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900">Test Result Entry</h1>
                <p className="text-gray-600">Enter clinical laboratory results</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Information */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
                    
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Patient Name</p>
                            <p className="text-base font-medium text-gray-900">{patientData.name}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Patient ID</p>
                                <p className="text-base font-medium text-gray-900">{patientData.patientId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Birthdate</p>
                                <p className="text-base font-medium text-gray-900">{patientData.birthdate}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">Transaction Code</p>
                            <p className="text-base font-medium text-gray-900">{patientData.transactionCode}</p>
                        </div>
                    </div>
                </div>

                {/* Clinical Results Form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Results</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Result Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Result Value <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left text-gray-900 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                onClick={() => {
                                    // Open test selector modal
                                }}
                            >
                                {formData.resultValue || 'Add Test'}
                            </button>
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Normal Range</p>
                                <p className="text-base text-gray-900 mt-1">
                                    {formData.normalRange || 'It will indicate here the percentage depending on result value'}
                                </p>
                            </div>
                        </div>

                        {/* Test Information */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div>
                                <p className="text-sm text-gray-600">Test Name</p>
                                <p className="text-base font-medium text-gray-900">{patientData.testName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created At</p>
                                <p className="text-base text-gray-900">{patientData.createdAt}</p>
                            </div>
                        </div>

                        {/* Test Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Status
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none"
                                >
                                    <option value="">Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-center font-medium">
                                Status: Processing
                            </div>
                        </div>

                        {/* Current Status Display */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Status
                            </label>
                            <div className="px-4 py-2 bg-amber-500 text-white rounded-lg text-center font-medium">
                                Status: Processing
                            </div>
                        </div>

                        {/* Remarks / Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarks / Notes
                            </label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => handleChange('remarks', e.target.value)}
                                placeholder="Enter any relevant remarks or observations"
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
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
