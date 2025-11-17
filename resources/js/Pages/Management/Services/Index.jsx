import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Edit, Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import EditServiceModal from './EditServiceModal';
import CreateServiceModal from './CreateServiceModal';

export default function ServiceManagementIndex() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const services = [
        {
            id: 1,
            name: 'Complete Blood Count',
            category: 'Hematology',
            price: 250.00,
            description: 'Full blood panel analysis'
        },
        {
            id: 2,
            name: 'Routine Urinalysis',
            category: 'Urine Microscopy',
            price: 150.00,
            description: 'Full blood panel analysis'
        },
        {
            id: 3,
            name: 'Serum with Pregnancy test',
            category: 'Serology/Immunology',
            price: 200.00,
            description: 'Full blood panel analysis'
        },
        {
            id: 4,
            name: 'Positive with IM',
            category: 'Blood Chemistry',
            price: 100.00,
            description: 'Full blood panel analysis'
        },
        {
            id: 5,
            name: 'Cholesterol',
            category: 'Blood Chemistry',
            price: 250.00,
            description: 'Full blood panel analysis'
        },
        {
            id: 6,
            name: 'Chestxray',
            category: 'Others',
            price: 250.00,
            description: 'Full blood panel analysis'
        },
        {
            id: 7,
            name: 'Pelvic',
            category: 'Procedure Ultrasound',
            price: 500.00,
            description: 'Full blood panel analysis'
        },
        {
            id: 8,
            name: 'Both Breast',
            category: 'Procedure Ultrasound',
            price: 1200.00,
            description: 'Full blood panel analysis'
        }
    ];

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryColor = (category) => {
        const colors = {
            'Hematology': 'text-blue-400',
            'Urine Microscopy': 'text-blue-400',
            'Serology/Immunology': 'text-blue-400',
            'Blood Chemistry': 'text-blue-400',
            'Others': 'text-blue-400',
            'Procedure Ultrasound': 'text-blue-400'
        };
        return colors[category] || 'text-gray-400';
    };

    return (
        <DashboardLayout>
            <Head title="Service Management" />

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Service Management</h1>
                <p className="text-gray-400">Manage laboratory tests and services</p>
            </div>

            {/* Search and Actions */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search tests by name or category..."
                        className="h-10 w-full rounded-lg border border-gray-900 bg-white/5 pl-10 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                            {filteredServices.map((service) => (
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
                                            ₱{service.price.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{service.description}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => {
                                                setSelectedService(service);
                                                setShowEditModal(true);
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

            {/* Modals */}
            <CreateServiceModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            
            {selectedService && (
                <EditServiceModal
                    service={selectedService}
                    show={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedService(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
