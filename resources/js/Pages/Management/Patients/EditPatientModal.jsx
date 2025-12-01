import { useState } from "react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import AddressSelect from "@/Components/AddressSelect";
import PhoneInput from "@/Components/PhoneInput";
import { X } from "lucide-react";
import { useForm } from "@inertiajs/react";

export default function EditPatientModal({
    patient,
    show,
    onClose,
    userRole = "admin",
}) {
    const [showOtherGender, setShowOtherGender] = useState(
        patient?.gender && !["Male", "Female"].includes(patient.gender)
    );

    const { data, setData, put, processing, errors } = useForm({
        first_name: patient?.first_name || "",
        last_name: patient?.last_name || "",
        middle_name: patient?.middle_name || "",
        email: patient?.email || "",
        age: patient?.age || "",
        gender: patient?.gender || "",
        contact_number: patient?.contact_number || "",
        region_id: patient?.region_id || "",
        province_id: patient?.province_id || "",
        city_id: patient?.city_id || "",
        barangay_code: patient?.barangay_code || "",
        street: patient?.street || "",
        date_of_birth: patient?.date_of_birth || "",
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
        let value = e.target.value;

        // If input type is date, convert from YYYY-MM-DD to MM/DD/YYYY
        if (e.target.type === "date" && value) {
            const [year, month, day] = value.split("-");
            value = `${month}/${day}/${year}`;
        }

        setData("date_of_birth", value);
        calculateAgeFromDOB(value);
    };

    const handleDateOfBirthInput = (e) => {
        let value = e.target.value;

        // Remove non-numeric characters except /
        value = value.replace(/[^\d/]/g, "");

        // Auto-add slashes
        if (value.length === 2 && !value.includes("/")) {
            value = value + "/";
        } else if (value.length === 5 && value.split("/").length === 2) {
            value = value + "/";
        }

        // Limit to MM/DD/YYYY format
        const parts = value.split("/");
        if (parts[0] && parts[0].length > 2) {
            parts[0] = parts[0].substring(0, 2);
        }
        if (parts[1] && parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2);
        }
        if (parts[2] && parts[2].length > 4) {
            parts[2] = parts[2].substring(0, 4);
        }
        value = parts.join("/");

        setData("date_of_birth", value);

        // Calculate age if date is complete
        if (isValidDateFormat(value)) {
            calculateAgeFromDOB(value);
        }
    };

    const isValidDateFormat = (dateStr) => {
        if (!dateStr) return false;
        const parts = dateStr.split("/");
        if (parts.length !== 3) return false;
        const [month, day, year] = parts;
        return month?.length === 2 && day?.length === 2 && year?.length === 4;
    };

    const calculateAgeFromDOB = (dateStr) => {
        if (!dateStr || !isValidDateFormat(dateStr)) {
            return;
        }

        const [month, day, year] = dateStr.split("/");
        const birth = new Date(year, month - 1, day);

        // Validate date
        if (isNaN(birth.getTime())) {
            return;
        }

        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }

        setData((prev) => ({ ...prev, age: age >= 0 ? age.toString() : "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("patients.update", patient.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const isAdmin = userRole === "admin";
    const isCashier = userRole === "cashier";

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Edit Patient
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>First Name {isAdmin && "*"}</InputLabel>
                            <TextInput
                                value={data.first_name}
                                onChange={(e) =>
                                    setData("first_name", e.target.value)
                                }
                                placeholder="Juan"
                                disabled={isCashier}
                                className={
                                    isCashier
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }
                                required={isAdmin}
                            />
                            {errors.first_name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.first_name}
                                </p>
                            )}
                        </div>

                        {/* Last Name - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>Last Name {isAdmin && "*"}</InputLabel>
                            <TextInput
                                value={data.last_name}
                                onChange={(e) =>
                                    setData("last_name", e.target.value)
                                }
                                placeholder="Dela Cruz"
                                disabled={isCashier}
                                className={
                                    isCashier
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }
                                required={isAdmin}
                            />
                            {errors.last_name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.last_name}
                                </p>
                            )}
                        </div>

                        {/* Date of Birth - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>
                                Date of Birth (MM/DD/YYYY) {isAdmin && "*"}
                            </InputLabel>
                            <div className="relative">
                                <TextInput
                                    type="text"
                                    value={data.date_of_birth}
                                    onChange={handleDateOfBirthInput}
                                    placeholder="MM/DD/YYYY"
                                    maxLength="10"
                                    disabled={isCashier}
                                    className={
                                        isCashier
                                            ? "bg-gray-100 cursor-not-allowed pr-10"
                                            : "pr-10"
                                    }
                                />
                                {!isCashier && (
                                    <>
                                        <input
                                            type="date"
                                            onChange={handleDateOfBirthChange}
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            className="absolute inset-y-0 right-0 w-10 opacity-0 cursor-pointer"
                                            title="Pick a date"
                                        />
                                        <svg
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </>
                                )}
                            </div>
                            {errors.date_of_birth && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.date_of_birth}
                                </p>
                            )}
                        </div>

                        {/* Age - Auto-calculated or manual */}
                        <div>
                            <InputLabel>Age {isAdmin && "*"}</InputLabel>
                            <TextInput
                                type="number"
                                value={data.age}
                                onChange={(e) => setData("age", e.target.value)}
                                placeholder="45"
                                disabled={isCashier}
                                className={
                                    isCashier
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }
                                readOnly={!!data.date_of_birth}
                                required={isAdmin}
                                min="0"
                                max="150"
                            />
                            {errors.age && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.age}
                                </p>
                            )}
                        </div>

                        {/* Gender - Admin can edit, Cashier read-only */}
                        <div>
                            <InputLabel>Gender {isAdmin && "*"}</InputLabel>
                            <select
                                value={showOtherGender ? "Other" : data.gender}
                                onChange={handleGenderChange}
                                className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                    isCashier
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "bg-white"
                                }`}
                                disabled={isCashier}
                                required={isAdmin}
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

                        {showOtherGender && isAdmin && (
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

                        {/* Email - Both can edit */}
                        <div>
                            <InputLabel>Email</InputLabel>
                            <TextInput
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="juan@email.com"
                            />
                            {errors.email && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact Number - Both can edit */}
                    <div>
                        <PhoneInput
                            value={data.contact_number}
                            onChange={(value) =>
                                setData("contact_number", value)
                            }
                            error={errors.contact_number}
                        />
                    </div>

                    {/* Address - Both can edit */}
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
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <PrimaryButton
                            type="submit"
                            className="flex-1 touch-manipulation min-h-[44px]"
                            disabled={processing}
                        >
                            {processing ? "Updating..." : "Update"}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 sm:py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-colors touch-manipulation min-h-[44px]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
