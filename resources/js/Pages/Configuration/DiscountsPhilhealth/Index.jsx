import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Edit, Plus, Percent, Shield, Power, PowerOff } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EmptyState from '@/Components/EmptyState';
import EditDiscountModal from './EditDiscountModal';
import CreateDiscountModal from './CreateDiscountModal';
import EditPhilHealthModal from './EditPhilHealthModal';
import CreatePhilHealthModal from './CreatePhilHealthModal';

export default function DiscountsPhilhealthIndex({ auth, discounts, philHealthPlans }) {
    const [activeTab, setActiveTab] = useState('discounts');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showCreateDiscountModal, setShowCreateDiscountModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

    const discountsList = discounts?.data || [];
    const philHealthPlansList = philHealthPlans?.data || [];

    const handleToggleDiscount = async (discount) => {
        if (confirm(`Are you sure you want to ${discount.is_active ? 'deactivate' : 'activate'} this discount?`)) {
            router.post(route('discounts.toggle', discount.id), {}, {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['discounts'] });
                }
            });
        }
    };

    const handleTogglePlan = async (plan) => {
        if (confirm(`Are you sure you want to ${plan.is_active ? 'deactivate' : 'activate'} this PhilHealth plan?`)) {
            router.post(route('philhealth-plans.toggle', plan.id), {}, {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['philHealthPlans'] });
                }
            });
        }
    };

    const filteredDiscounts = discountsList.filter(discount =>
        discount.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPlans = philHealthPlansList.filter(plan =>
        plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Discounts & PhilHealth Management" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Discounts & PhilHealth Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage discount types and PhilHealth coverage plans
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('discounts')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm relative ${
                            activeTab === 'discounts'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Discounts
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('philhealth')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm relative ${
                            activeTab === 'philhealth'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            PhilHealth Plans
                        </div>
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
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredDiscounts.map((discount) => (
                                        <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {discount.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-emerald-600">
                                                    {parseFloat(discount.rate)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {discount.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    discount.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {discount.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDiscount(discount);
                                                            setShowDiscountModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleDiscount(discount)}
                                                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                                                            discount.is_active
                                                                ? 'text-red-600 hover:bg-red-50'
                                                                : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    >
                                                        {discount.is_active ? (
                                                            <>
                                                                <PowerOff className="h-4 w-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Power className="h-4 w-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
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
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredPlans.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {plan.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-emerald-600">
                                                    {parseFloat(plan.coverage_rate)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {plan.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    plan.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {plan.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPlan(plan);
                                                            setShowPlanModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleTogglePlan(plan)}
                                                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                                                            plan.is_active
                                                                ? 'text-red-600 hover:bg-red-50'
                                                                : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    >
                                                        {plan.is_active ? (
                                                            <>
                                                                <PowerOff className="h-4 w-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Power className="h-4 w-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
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
                onClose={() => {
                    setShowCreateDiscountModal(false);
                    router.reload({ only: ['discounts'] });
                }}
            />

            <CreatePhilHealthModal
                show={showCreatePlanModal}
                onClose={() => {
                    setShowCreatePlanModal(false);
                    router.reload({ only: ['philHealthPlans'] });
                }}
            />

            {selectedDiscount && (
                <EditDiscountModal
                    discount={selectedDiscount}
                    show={showDiscountModal}
                    onClose={() => {
                        setShowDiscountModal(false);
                        setSelectedDiscount(null);
                        router.reload({ only: ['discounts'] });
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
                        router.reload({ only: ['philHealthPlans'] });
                    }}
                />
            )}
        </DashboardLayout>
    );
}
