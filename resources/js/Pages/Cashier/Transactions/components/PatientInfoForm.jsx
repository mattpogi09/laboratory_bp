import { UserPlus } from 'lucide-react';
import TextField from './TextField';

export default function PatientInfoForm({ patient, errors = {}, onChange }) {
    const handleChange = (field) => (e) => onChange(field, e.target.value);

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
                    label="Age"
                    type="number"
                    value={patient.age}
                    onChange={handleChange('age')}
                />
                <TextField
                    label="Gender"
                    value={patient.gender}
                    onChange={handleChange('gender')}
                />
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

