import { UserPlus, Search, X, CheckCircle2 } from "lucide-react";
import TextField from "./TextField";
import AddressSelect from "@/Components/AddressSelect";
import PhoneInput from "@/Components/PhoneInput";
import { useState, useEffect } from "react";
import axios from "axios";

export default function PatientInfoForm({ patient, errors = {}, onChange }) {
    const [showOtherGender, setShowOtherGender] = useState(
        patient.gender && !["Male", "Female"].includes(patient.gender)
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(!patient.id);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await axios.get(route("patients.search"), {
                    params: { query: searchQuery },
                });
                setSearchResults(response.data);
            } catch (error) {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const selectExistingPatient = (patientData) => {
        setSelectedPatient(patientData);
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);

        // Update all patient fields
        onChange("id", patientData.id);
        onChange("first_name", patientData.first_name);
        onChange("last_name", patientData.last_name);
        onChange("middle_name", patientData.middle_name || "");
        onChange("email", patientData.email || "");
        onChange("date_of_birth", patientData.date_of_birth || "");
        onChange("age", patientData.age || "");
        onChange("gender", patientData.gender || "");
        onChange("contact", patientData.contact_number || "");
        // Address fields
        onChange("region_id", patientData.region_id || "");
        onChange("province_id", patientData.province_id || "");
        onChange("city_id", patientData.city_id || "");
        onChange("barangay_code", patientData.barangay_code || "");
        onChange("street", patientData.street || "");
    };

    const clearSelection = () => {
        setSelectedPatient(null);
        setShowSearch(true);

        // Clear all patient fields
        onChange("id", null);
        onChange("first_name", "");
        onChange("last_name", "");
        onChange("middle_name", "");
        onChange("email", "");
        onChange("date_of_birth", "");
        onChange("age", "");
        onChange("gender", "");
        onChange("contact", "");
        // Clear address fields
        onChange("region_id", "");
        onChange("province_id", "");
        onChange("city_id", "");
        onChange("barangay_code", "");
        onChange("street", "");
    };

    const handleChange = (field) => (e) => onChange(field, e.target.value);

    // Calculate age from date of birth
    const handleDateOfBirthChange = (e) => {
        const dob = e.target.value;
        onChange("date_of_birth", dob);

        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // Adjust age if birthday hasn't occurred this year
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            onChange("age", age >= 0 ? age : "");
        } else {
            onChange("age", "");
        }
    };

    const handleGenderChange = (e) => {
        const value = e.target.value;
        if (value === "Other") {
            setShowOtherGender(true);
            onChange("gender", "");
        } else {
            setShowOtherGender(false);
            onChange("gender", value);
        }
    };

    const isExistingPatient = !!patient.id || !!selectedPatient;

    return (
        <section className="rounded-xl bg-white p-6 shadow">
            <header className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Patient Information
                    </h2>
                    <p className="text-sm text-gray-500">
                        Search existing patient or add new patient details
                    </p>
                </div>
            </header>

            {/* Patient Search */}
            {showSearch && !isExistingPatient && (
                <div className="mb-6 space-y-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Search Existing Patient
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, ID, or contact number..."
                                className="w-full rounded-lg border border-gray-900 pl-10 pr-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    type="button"
                                    onClick={() =>
                                        selectExistingPatient(result)
                                    }
                                    className="w-full border-b border-gray-200 p-3 text-left hover:bg-gray-50 transition-colors last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900">
                                        {result.full_name}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-600">
                                        ID: {result.patient_id} • {result.age} /{" "}
                                        {result.gender} •{" "}
                                        {result.contact_number}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {isSearching && searchQuery && (
                        <div className="text-sm text-gray-500">
                            Searching...
                        </div>
                    )}

                    {!isSearching &&
                        searchQuery.length >= 2 &&
                        searchResults.length === 0 && (
                            <div className="text-sm text-gray-500">
                                No patients found. Add as new patient below.
                            </div>
                        )}

                    <div className="flex items-center gap-2 pt-2">
                        <div className="h-px flex-1 bg-gray-300" />
                        <span className="text-xs text-gray-500">
                            OR ADD NEW PATIENT
                        </span>
                        <div className="h-px flex-1 bg-gray-300" />
                    </div>
                </div>
            )}

            {/* Selected Patient Badge */}
            {isExistingPatient && (
                <div className="mb-6 flex items-center justify-between rounded-lg border-2 border-green-500 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="font-semibold text-green-900">
                                {patient.first_name} {patient.middle_name}{" "}
                                {patient.last_name}
                            </div>
                            <div className="text-sm text-green-700">
                                Existing patient selected • Contact:{" "}
                                {patient.contact}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="rounded-lg p-2 text-green-700 hover:bg-green-100 transition-colors"
                        title="Clear selection"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {/* Personal Information Section */}
                <TextField
                    label="First Name"
                    required
                    value={patient.first_name}
                    onChange={handleChange("first_name")}
                    error={errors["patient.first_name"]}
                    disabled={isExistingPatient}
                />

                <TextField
                    label="Middle Name"
                    value={patient.middle_name}
                    onChange={handleChange("middle_name")}
                    disabled={isExistingPatient}
                />

                <TextField
                    label="Last Name"
                    required
                    value={patient.last_name}
                    onChange={handleChange("last_name")}
                    error={errors["patient.last_name"]}
                    disabled={isExistingPatient}
                />

                <TextField
                    label="Email"
                    type="email"
                    value={patient.email}
                    onChange={handleChange("email")}
                    error={errors["patient.email"]}
                />
            </div>

            {/* Demographic Information Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Demographic Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={patient.date_of_birth || ""}
                            onChange={handleDateOfBirthChange}
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={isExistingPatient}
                        />
                        {errors["patient.date_of_birth"] && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors["patient.date_of_birth"]}
                            </p>
                        )}
                    </div>

                    <TextField
                        label="Age"
                        type="number"
                        value={patient.age}
                        onChange={handleChange("age")}
                        disabled={isExistingPatient}
                        readOnly={!!patient.date_of_birth}
                        className={patient.date_of_birth ? "bg-gray-50" : ""}
                    />

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Gender
                        </label>
                        <select
                            value={showOtherGender ? "Other" : patient.gender}
                            onChange={handleGenderChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={isExistingPatient}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">
                                Others (Please Specify)
                            </option>
                        </select>
                        {errors["patient.gender"] && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors["patient.gender"]}
                            </p>
                        )}
                    </div>

                    {showOtherGender && !isExistingPatient && (
                        <TextField
                            label="Please Specify Gender"
                            value={patient.gender}
                            onChange={handleChange("gender")}
                            placeholder="Enter gender"
                            error={errors["patient.gender"]}
                        />
                    )}
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Contact Information
                </h3>
                <PhoneInput
                    value={patient.contact}
                    onChange={(value, isValid) => onChange("contact", value)}
                    error={errors["patient.contact"]}
                    disabled={isExistingPatient}
                    required
                />
            </div>

            {/* Address Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Address
                </h3>
                <AddressSelect
                    value={{
                        region_id: patient.region_id,
                        province_id: patient.province_id,
                        city_id: patient.city_id,
                        barangay_code: patient.barangay_code,
                        street: patient.street,
                    }}
                    onChange={(address) => {
                        onChange("region_id", address.region_id);
                        onChange("province_id", address.province_id);
                        onChange("city_id", address.city_id);
                        onChange("barangay_code", address.barangay_code);
                        onChange("street", address.street);
                    }}
                    errors={{
                        region_id: errors["patient.region_id"],
                        province_id: errors["patient.province_id"],
                        city_id: errors["patient.city_id"],
                        barangay_code: errors["patient.barangay_code"],
                        street: errors["patient.street"],
                    }}
                    disabled={isExistingPatient}
                    required
                />
            </div>
        </section>
    );
}
