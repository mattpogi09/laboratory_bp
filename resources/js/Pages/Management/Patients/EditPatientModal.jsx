import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { X } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function EditPatientModal({ patient, show, onClose, userRole = 'admin' }) {
    const [showOtherGender, setShowOtherGender] = useState(
        patient?.gender && !['Male', 'Female'].includes(patient.gender)
    );

    const { data, setData, put, processing, errors } = useForm({
        first_name: patient?.first_name || '',
        last_name: patient?.last_name || '',
        email: patient?.email || '',
        age: patient?.age || '',
        gender: patient?.gender || '',
        contact_number: patient?.contact || '',
        address: patient?.address || '',
        birth_date: patient?.birth_date || '',
    });

    const handleGenderChange = (e) => {
        const value = e.target.value;
        if (value === 'Other') {
            setShowOtherGender(true);
            setData('gender', '');
        } else {
            setShowOtherGender(false);
            setData('gender', value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('patients.update', patient.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const isAdmin = userRole === 'admin';
    const isCashier = userRole === 'cashier';

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Patient</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* First Name - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>First Name {isAdmin && '*'}</InputLabel>
                            <TextInput
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                placeholder="Juan"
                                disabled={isCashier}
                                className={isCashier ? 'bg-gray-100 cursor-not-allowed' : ''}
                                required={isAdmin}
                            />
                            {errors.first_name && <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>}
                        </div>

                        {/* Last Name - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>Last Name {isAdmin && '*'}</InputLabel>
                            <TextInput
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                placeholder="Dela Cruz"
                                disabled={isCashier}
                                className={isCashier ? 'bg-gray-100 cursor-not-allowed' : ''}
                                required={isAdmin}
                            />
                            {errors.last_name && <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>}
                        </div>

                        {/* Age - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>Age {isAdmin && '*'}</InputLabel>
                            <TextInput
                                type="number"
                                value={data.age}
                                onChange={(e) => setData('age', e.target.value)}
                                placeholder="45"
                                disabled={isCashier}
                                className={isCashier ? 'bg-gray-100 cursor-not-allowed' : ''}
                                required={isAdmin}
                                min="0"
                                max="150"
                            />
                            {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
                        </div>

                        {/* Gender - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>Gender {isAdmin && '*'}</InputLabel>
                            <select
                                value={showOtherGender ? 'Other' : data.gender}
                                onChange={handleGenderChange}
                                className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${isCashier ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                disabled={isCashier}
                                required={isAdmin}
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Others (Please Specify)</option>
                            </select>
                            {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                        </div>

                        {showOtherGender && isAdmin && (
                            <div>
                                <InputLabel>Please Specify Gender *</InputLabel>
                                <TextInput
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    placeholder="Enter gender..."
                                    required
                                />
                                {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                            </div>
                        )}

                        {/* Email - Both can edit */}
                        <div>
                            <InputLabel>Email</InputLabel>
                            <TextInput
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="juan@email.com"
                            />
                            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Contact Number - Both can edit */}
                        <div>
                            <InputLabel>Contact Number</InputLabel>
                            <TextInput
                                value={data.contact_number}
                                onChange={(e) => setData('contact_number', e.target.value)}
                                placeholder="0917-123-4567"
                            />
                            {errors.contact_number && <p className="text-red-600 text-sm mt-1">{errors.contact_number}</p>}
                        </div>

                        {/* Birthdate - Admin only */}
                        {isAdmin && (
                            <div>
                                <InputLabel>Birthdate</InputLabel>
                                <TextInput
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                />
                                {errors.birth_date && <p className="text-red-600 text-sm mt-1">{errors.birth_date}</p>}
                            </div>
                        )}
                    </div>

                    {/* Address - Both can edit */}
                    <div>
                        <InputLabel>Address</InputLabel>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Complete address..."
                            rows="3"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                        />
                        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <PrimaryButton type="submit" className="flex-1" disabled={processing}>
                            {processing ? 'Updating...' : 'Update'}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
