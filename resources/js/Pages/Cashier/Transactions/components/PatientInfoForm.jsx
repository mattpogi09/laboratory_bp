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
                console.error("Patient search error:", error);
                console.error("Search query:", searchQuery);
                console.error("Route URL:", route("patients.search"));
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
        // Reset address fields to Zamboanga defaults
        onChange("region_id", "09");
        onChange("province_id", "09317");
        onChange("city_id", "0931700");
        onChange("barangay_code", "");
        onChange("street", "");
    };

    const handleChange = (field) => (e) => onChange(field, e.target.value);

    // Calculate age from date of birth
    const handleDateOfBirthChange = (e) => {
        let value = e.target.value;

        // If input type is date, convert from YYYY-MM-DD to MM/DD/YYYY
        if (e.target.type === "date" && value) {
            const [year, month, day] = value.split("-");
            value = `${month}/${day}/${year}`;
        }

        onChange("date_of_birth", value);
        calculateAgeFromDOB(value);
    };

    // Handle manual text input for MM/DD/YYYY format
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

        onChange("date_of_birth", value);

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
            onChange("age", "");
            return;
        }

        const [month, day, year] = dateStr.split("/");
        const birthDate = new Date(year, month - 1, day);

        // Validate date
        if (isNaN(birthDate.getTime())) {
            onChange("age", "");
            return;
        }

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
                            Date of Birth (MM/DD/YYYY)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={patient.date_of_birth || ""}
                                onChange={handleDateOfBirthInput}
                                placeholder="MM/DD/YYYY"
                                maxLength="10"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={isExistingPatient}
                            />
                            <input
                                type="date"
                                onChange={handleDateOfBirthChange}
                                max={new Date().toISOString().split("T")[0]}
                                className="absolute inset-y-0 right-0 w-10 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={isExistingPatient}
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
                        </div>
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
                    required={false}
                    regionRequired={false}
                />
            </div>
        </section>
    );
}
