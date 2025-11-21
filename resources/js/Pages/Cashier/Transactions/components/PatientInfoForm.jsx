import { UserPlus } from 'lucide-react';
import TextField from './TextField';
import { useState } from 'react';

export default function PatientInfoForm({ patient, errors = {}, onChange }) {
    const [showOtherGender, setShowOtherGender] = useState(
        patient.gender && !['Male', 'Female'].includes(patient.gender)
    );

    const handleChange = (field) => (e) => onChange(field, e.target.value);

    const handleGenderChange = (e) => {
        const value = e.target.value;
        if (value === 'Other') {
            setShowOtherGender(true);
            onChange('gender', '');
        } else {
            setShowOtherGender(false);
            onChange('gender', value);
        }
    };

    return (
        <section className="rounded-xl bg-white p-6 shadow">
            <header className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
                    <p className="text-sm text-gray-500">Basic details for queueing and receipts</p>
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    label="First Name"
                    required
                    value={patient.first_name}
                    onChange={handleChange('first_name')}
                    error={errors['patient.first_name']}
                />
                <TextField
                    label="Last Name"
                    required
                    value={patient.last_name}
                    onChange={handleChange('last_name')}
                    error={errors['patient.last_name']}
                />
                <TextField
                    label="Middle Name"
                    value={patient.middle_name}
                    onChange={handleChange('middle_name')}
                />
                <TextField
                    label="Email"
                    type="email"
                    value={patient.email}
                    onChange={handleChange('email')}
                    error={errors['patient.email']}
                />
                <TextField
                    label="Age"
                    type="number"
                    value={patient.age}
                    onChange={handleChange('age')}
                />
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Gender
                    </label>
                    <select
                        value={showOtherGender ? 'Other' : patient.gender}
                        onChange={handleGenderChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Others (Please Specify)</option>
                    </select>
                    {errors['patient.gender'] && (
                        <p className="mt-1 text-xs text-red-600">{errors['patient.gender']}</p>
                    )}
                </div>
                {showOtherGender && (
                    <TextField
                        label="Please Specify Gender"
                        value={patient.gender}
                        onChange={handleChange('gender')}
                        placeholder="Enter gender"
                        error={errors['patient.gender']}
                    />
                )}
                <TextField
                    label="Contact Number"
                    value={patient.contact}
                    onChange={handleChange('contact')}
                />
            </div>
            <div className="mt-4">
                <TextField
                    label="Address"
                    value={patient.address}
                    onChange={handleChange('address')}
                />
            </div>
        </section>
    );
}

