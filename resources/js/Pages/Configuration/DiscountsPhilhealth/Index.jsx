import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Edit, Plus, Percent, Shield } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EmptyState from '@/Components/EmptyState';
import EditDiscountModal from './EditDiscountModal';
import CreateDiscountModal from './CreateDiscountModal';
import EditPhilHealthModal from './EditPhilHealthModal';
import CreatePhilHealthModal from './CreatePhilHealthModal';

export default function DiscountsPhilhealthIndex({ auth }) {
    const [activeTab, setActiveTab] = useState('discounts');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showCreateDiscountModal, setShowCreateDiscountModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

    const discounts = [
        {
            id: 1,
            name: 'Senior Citizen',
            rate: 20,
            description: '20% discount for senior citizens'
        },
        {
            id: 2,
            name: 'PWD',
            rate: 20,
            description: '20% discount for persons with disabilities'
        },
        {
            id: 3,
            name: 'Employee Discount',
            rate: 15,
            description: '15% discount for company employees'
        }
    ];

    const philhealthPlans = [
        {
            id: 1,
            name: 'PhilHealth Basic',
            coverageRate: 50,
            description: 'Basic coverage plan'
        },
        {
            id: 2,
            name: 'PhilHealth Plus',
            coverageRate: 75,
            description: 'Enhanced coverage plan'
        },
        {
            id: 3,
            name: 'PhilHealth Free Consultation',
            coverageRate: 100,
            description: 'Premium coverage plan'
        }
    ];

    const filteredDiscounts = discounts.filter(discount =>
        discount.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPlans = philhealthPlans.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Discounts & PhilHealth Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Discounts & PhilHealth Management</h1>
                <p className="text-gray-400">Manage discount types and PhilHealth coverage plans</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-white/10">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('discounts')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'discounts'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Discounts
                        {activeTab === 'discounts' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('philhealth')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'philhealth'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        PhilHealth Plans
                        {activeTab === 'philhealth' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'discounts' ? 'discounts' : 'plans'}...`}
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => activeTab === 'discounts' ? setShowCreateDiscountModal(true) : setShowCreatePlanModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {activeTab === 'discounts' ? 'Add Discount' : 'Add Plan'}
                </Button>
            </div>

            {/* Content */}
            {activeTab === 'discounts' ? (
                filteredDiscounts.length > 0 ? (
                <div className="rounded-lg bg-white shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Rate</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredDiscounts.map((discount) => (
                                    <tr
                                        key={discount.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{discount.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-emerald-400">
                                                {discount.rate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{discount.description}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedDiscount(discount);
                                                    setShowDiscountModal(true);
                                                }}
                                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                ) : (
                    <div className="rounded-lg bg-white shadow-md">
                        <EmptyState 
                            icon={Percent}
                            title="No Discounts Available"
                            description="No discount types have been configured yet. Click 'Add Discount' to create discount options for senior citizens, PWD, or other categories."
                        />
                    </div>
                )
            ) : (
                filteredPlans.length > 0 ? (
                <div className="rounded-lg bg-white shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Plan Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Coverage Rate</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredPlans.map((plan) => (
                                    <tr
                                        key={plan.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{plan.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-emerald-400">
                                                {plan.coverageRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{plan.description}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedPlan(plan);
                                                    setShowPlanModal(true);
                                                }}
                                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                ) : (
                    <div className="rounded-lg bg-white shadow-md">
                        <EmptyState 
                            icon={Shield}
                            title="No PhilHealth Plans Available"
                            description="No PhilHealth coverage plans have been set up yet. Click 'Add Plan' to configure insurance coverage options for patients."
                        />
                    </div>
                )
            )}

            {/* Modals */}
            <CreateDiscountModal
                show={showCreateDiscountModal}
                onClose={() => setShowCreateDiscountModal(false)}
            />

            <CreatePhilHealthModal
                show={showCreatePlanModal}
                onClose={() => setShowCreatePlanModal(false)}
            />

            {selectedDiscount && (
                <EditDiscountModal
                    discount={selectedDiscount}
                    show={showDiscountModal}
                    onClose={() => {
                        setShowDiscountModal(false);
                        setSelectedDiscount(null);
                    }}
                />
            )}

            {selectedPlan && (
                <EditPhilHealthModal
                    plan={selectedPlan}
                    show={showPlanModal}
                    onClose={() => {
                        setShowPlanModal(false);
                        setSelectedPlan(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
