import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import { Search, Edit, Plus, TestTube, Power, PowerOff, Filter } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EditServiceModal from './EditServiceModal';
import CreateServiceModal from './CreateServiceModal';
import ToggleServiceModal from './ToggleServiceModal';

export default function ServicesIndex({ auth, tests = { data: [], links: [] }, categories, categoryStats = {}, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedService, setSelectedService] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);

    const testsData = tests.data || [];

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        router.get(route('services.index'), 
            { search: value, category: selectedCategory !== 'all' ? selectedCategory : undefined },
            { preserveScroll: true, replace: true }
        );
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        router.get(route('services.index'), 
            { search: searchQuery || undefined, category: value !== 'all' ? value : undefined },
            { preserveScroll: true, replace: true }
        );
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleToggleClick = (service) => {
        setSelectedService(service);
        setShowToggleModal(true);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Service Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Service Management</h1>
                <p className="text-gray-400">Manage laboratory tests and services</p>
            </div>

            {/* Category Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
                {categories.map((category) => (
                    <div 
                        key={category}
                        className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Category</p>
                            <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 min-h-[32px]">{category}</h3>
                            <div className="text-2xl font-bold text-blue-600">
                                {categoryStats[category] || 0}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search tests by name or category..."
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="h-10 w-48 rounded-lg border border-gray-900 bg-white pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                </Button>
            </div>

            {/* Services Table */}
            {testsData.length > 0 ? (
            <div className="rounded-lg bg-white shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Test Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {testsData.map((service) => (
                                <tr 
                                    key={service.id}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.name}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-blue-600">
                                            {service.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-medium text-emerald-600">
                                            ₱{parseFloat(service.price).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{service.description}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleClick(service)}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                                                    service.is_active 
                                                        ? 'text-red-600 hover:bg-red-50' 
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                            >
                                                {service.is_active ? (
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
                <Pagination links={tests.links} />
            </div>
            ) : (
                <div className="rounded-lg bg-white shadow-md">
                    <EmptyState 
                        icon={TestTube}
                        title="No Services Available"
                        description="No laboratory tests or services have been added yet. Click 'Add Service' to create your first test offering."
                    />
                </div>
            )}

            {/* Modals */}
            <CreateServiceModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                categories={categories}
            />
            
            {selectedService && (
                <>
                    <EditServiceModal
                        service={selectedService}
                        show={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedService(null);
                        }}
                        categories={categories}
                    />
                    <ToggleServiceModal
                        service={selectedService}
                        show={showToggleModal}
                        onClose={() => {
                            setShowToggleModal(false);
                            setSelectedService(null);
                        }}
                    />
                </>
            )}
        </DashboardLayout>
    );
}
