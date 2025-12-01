import { useState } from "react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import AddressSelect from "@/Components/AddressSelect";
import PhoneInput from "@/Components/PhoneInput";
import { X } from "lucide-react";
import { useForm } from "@inertiajs/react";

export default function CreatePatientModal({ show, onClose }) {
    const [showOtherGender, setShowOtherGender] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        age: "",
        gender: "",
        contact_number: "",
        region_id: "",
        province_id: "",
        city_id: "",
        barangay_code: "",
        street: "",
        date_of_birth: "",
    });

    const handleGenderChange = (e) => {
        const value = e.target.value;
        if (value === "Other") {
            setShowOtherGender(true);
            setData("gender", "");
        } else {
            setShowOtherGender(false);
            setData("gender", value);
        }
    };

    const handleDateOfBirthChange = (e) => {
        const birthDate = e.target.value;
        setData("date_of_birth", birthDate);

        if (birthDate) {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birth.getDate())
            ) {
                age--;
            }

            setData((prev) => ({ ...prev, age: age.toString() }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("patients.store"), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Add New Patient
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel>First Name *</InputLabel>
                            <TextInput
                                value={data.first_name}
                                onChange={(e) =>
                                    setData("first_name", e.target.value)
                                }
                                placeholder="Enter first name..."
                                required
                            />
                            {errors.first_name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.first_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <InputLabel>Last Name *</InputLabel>
                            <TextInput
                                value={data.last_name}
                                onChange={(e) =>
                                    setData("last_name", e.target.value)
                                }
                                placeholder="Enter last name..."
                                required
                            />
                            {errors.last_name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.last_name}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel>Middle Name</InputLabel>
                            <TextInput
                                value={data.middle_name}
                                onChange={(e) =>
                                    setData("middle_name", e.target.value)
                                }
                                placeholder="Enter middle name..."
                            />
                            {errors.middle_name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.middle_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <InputLabel>Date of Birth</InputLabel>
                            <TextInput
                                type="date"
                                value={data.date_of_birth}
                                onChange={handleDateOfBirthChange}
                                max={new Date().toISOString().split("T")[0]}
                            />
                            {errors.date_of_birth && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.date_of_birth}
                                </p>
                            )}
                        </div>

                        <div>
                            <InputLabel>Age *</InputLabel>
                            <TextInput
                                type="number"
                                value={data.age}
                                onChange={(e) => setData("age", e.target.value)}
                                placeholder="Enter age..."
                                min="0"
                                max="150"
                                readOnly={!!data.date_of_birth}
                                required
                            />
                            {errors.age && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.age}
                                </p>
                            )}
                        </div>

                        <div>
                            <InputLabel>Gender *</InputLabel>
                            <select
                                value={showOtherGender ? "Other" : data.gender}
                                onChange={handleGenderChange}
                                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2.5 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">
                                    Others (Please Specify)
                                </option>
                            </select>
                            {errors.gender && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.gender}
                                </p>
                            )}
                        </div>

                        {showOtherGender && (
                            <div>
                                <InputLabel>Please Specify Gender *</InputLabel>
                                <TextInput
                                    value={data.gender}
                                    onChange={(e) =>
                                        setData("gender", e.target.value)
                                    }
                                    placeholder="Enter gender..."
                                    required
                                />
                                {errors.gender && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.gender}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel>Email</InputLabel>
                            <TextInput
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="Enter email..."
                            />
                            {errors.email && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <PhoneInput
                                value={data.contact_number}
                                onChange={(value) =>
                                    setData("contact_number", value)
                                }
                                error={errors.contact_number}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <AddressSelect
                            value={{
                                region_id: data.region_id,
                                province_id: data.province_id,
                                city_id: data.city_id,
                                barangay_code: data.barangay_code,
                                street: data.street,
                            }}
                            onChange={(address) => {
                                setData("region_id", address.region_id);
                                setData("province_id", address.province_id);
                                setData("city_id", address.city_id);
                                setData("barangay_code", address.barangay_code);
                                setData("street", address.street);
                            }}
                            errors={{
                                region_id: errors.region_id,
                                province_id: errors.province_id,
                                city_id: errors.city_id,
                                barangay_code: errors.barangay_code,
                                street: errors.street,
                            }}
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <PrimaryButton
                            type="submit"
                            className="flex-1 touch-manipulation min-h-[44px]"
                            disabled={processing}
                        >
                            {processing ? "Adding..." : "Add Patient"}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 sm:py-2 border-gray-500 shadow-xl bg-white hover:bg-gray-300 text-black rounded-lg border transition-colors touch-manipulation min-h-[44px]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
