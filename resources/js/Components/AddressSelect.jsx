import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export default function AddressSelect({
    value = {},
    onChange,
    errors = {},
    disabled = false,
    required = false,
    regionRequired = true,
}) {
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [loading, setLoading] = useState({
        regions: false,
        provinces: false,
        cities: false,
        barangays: false,
    });

    const [loadErrors, setLoadErrors] = useState({
        regions: null,
        provinces: null,
        cities: null,
        barangays: null,
    });

    const [selectedValues, setSelectedValues] = useState({
        region_id: value.region_id || "",
        province_id: value.province_id || "",
        city_id: value.city_id || "",
        barangay_code: value.barangay_code || "",
        street: value.street || "",
    });

    // Track if we've loaded data for the current selection (to prevent infinite loops)
    const loadedRef = useRef({ region: "", province: "", city: "" });
    const regionsLoadedRef = useRef(false);

    // Sync selectedValues when value prop changes (e.g., when patient is selected)
    useEffect(() => {
        setSelectedValues((prev) => {
            const newValues = {
                region_id: value.region_id || "",
                province_id: value.province_id || "",
                city_id: value.city_id || "",
                barangay_code: value.barangay_code || "",
                street: value.street || "",
            };

            // Only update if values actually changed to avoid unnecessary re-renders
            const hasChanged =
                newValues.region_id !== prev.region_id ||
                newValues.province_id !== prev.province_id ||
                newValues.city_id !== prev.city_id ||
                newValues.barangay_code !== prev.barangay_code ||
                newValues.street !== prev.street;

            // If region/province/city changed significantly, reset the loaded ref
            // This ensures cascading loads happen when selecting a new patient
            if (
                hasChanged &&
                (newValues.region_id !== prev.region_id ||
                    newValues.province_id !== prev.province_id ||
                    newValues.city_id !== prev.city_id)
            ) {
                // Reset ref to force reload of cascading dropdowns
                if (newValues.region_id !== prev.region_id) {
                    loadedRef.current.region = "";
                }
                if (newValues.province_id !== prev.province_id) {
                    loadedRef.current.province = "";
                }
                if (newValues.city_id !== prev.city_id) {
                    loadedRef.current.city = "";
                }
            }

            return hasChanged ? newValues : prev;
        });
    }, [
        value.region_id,
        value.province_id,
        value.city_id,
        value.barangay_code,
        value.street,
    ]);

    // Load regions on mount - this should always run once
    useEffect(() => {
        // Only load if we haven't loaded yet and we don't have regions
        if (regionsLoadedRef.current || regions.length > 0) return;

        const loadRegions = async () => {
            regionsLoadedRef.current = true;
            setLoading((prev) => ({ ...prev, regions: true }));

            try {
                const response = await axios.get("/address/regions");
                if (
                    response.data &&
                    Array.isArray(response.data) &&
                    response.data.length > 0
                ) {
                    setRegions(response.data);
                    setLoadErrors((prev) => ({ ...prev, regions: null }));
                } else {
                    setRegions([]);
                    setLoadErrors((prev) => ({
                        ...prev,
                        regions: "No regions available",
                    }));
                    regionsLoadedRef.current = false;
                }
            } catch (error) {
                setRegions([]);
                setLoadErrors((prev) => ({
                    ...prev,
                    regions:
                        "Failed to load regions. Please check your connection and try again.",
                }));
                regionsLoadedRef.current = false;
            } finally {
                setLoading((prev) => ({ ...prev, regions: false }));
            }
        };

        loadRegions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Main cascade loader - handles both user changes and initial patient selection
    useEffect(() => {
        // Only run cascade logic if we have a region_id
        // For new patients with no region selected, this should not interfere
        if (selectedValues.region_id) {
            // Determine what needs to be loaded
            const needsProvinces =
                loadedRef.current.region !== selectedValues.region_id;
            const needsCities =
                loadedRef.current.province !== selectedValues.province_id;
            const needsBarangays =
                loadedRef.current.city !== selectedValues.city_id;

            // Only proceed if something needs to be loaded
            if (needsProvinces || needsCities || needsBarangays) {
                if (needsProvinces) {
                    // Need to load from region - full cascade
                    loadProvinces(selectedValues.region_id).then(() => {
                        loadedRef.current.region = selectedValues.region_id;
                        // Continue cascade if we have province_id
                        if (selectedValues.province_id) {
                            loadCities(selectedValues.province_id).then(() => {
                                loadedRef.current.province =
                                    selectedValues.province_id;
                                // Continue cascade if we have city_id
                                if (selectedValues.city_id) {
                                    loadBarangays(selectedValues.city_id).then(
                                        () => {
                                            loadedRef.current.city =
                                                selectedValues.city_id;
                                        }
                                    );
                                }
                            });
                        }
                    });
                } else if (needsCities && selectedValues.province_id) {
                    // Region already loaded, need to load cities and barangays
                    loadCities(selectedValues.province_id).then(() => {
                        loadedRef.current.province = selectedValues.province_id;
                        // Continue cascade if we have city_id
                        if (selectedValues.city_id) {
                            loadBarangays(selectedValues.city_id).then(() => {
                                loadedRef.current.city = selectedValues.city_id;
                            });
                        }
                    });
                } else if (needsBarangays && selectedValues.city_id) {
                    // Region and province already loaded, just need barangays
                    loadBarangays(selectedValues.city_id).then(() => {
                        loadedRef.current.city = selectedValues.city_id;
                    });
                }
            } else if (
                selectedValues.region_id &&
                selectedValues.province_id &&
                selectedValues.city_id &&
                barangays.length === 0
            ) {
                // Fallback: if all IDs are set but barangays aren't loaded, load them
                // This handles edge cases where the ref check passed but barangays didn't load
                loadBarangays(selectedValues.city_id).then(() => {
                    loadedRef.current.city = selectedValues.city_id;
                });
            }
        }
        // Note: We don't clear provinces/cities/barangays here when region_id is empty
        // because that would interfere with the user's ability to select regions for new patients
        // The clearing happens naturally when user selects a new region
    }, [
        selectedValues.region_id,
        selectedValues.province_id,
        selectedValues.city_id,
    ]);

    // Notify parent of changes
    useEffect(() => {
        if (onChange) {
            onChange(selectedValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedValues]);

    const loadProvinces = async (regionId) => {
        setLoading((prev) => ({ ...prev, provinces: true }));
        try {
            const response = await axios.get(`/address/provinces/${regionId}`);
            setProvinces(response.data);
            setLoadErrors((prev) => ({ ...prev, provinces: null }));
            return response.data;
        } catch (error) {
            setProvinces([]);
            setLoadErrors((prev) => ({
                ...prev,
                provinces: "Failed to load provinces. Please try again.",
            }));
            return [];
        } finally {
            setLoading((prev) => ({ ...prev, provinces: false }));
        }
    };

    const loadCities = async (provinceId) => {
        setLoading((prev) => ({ ...prev, cities: true }));
        try {
            const response = await axios.get(`/address/cities/${provinceId}`);
            setCities(response.data);
            setLoadErrors((prev) => ({ ...prev, cities: null }));
            return response.data;
        } catch (error) {
            setCities([]);
            setLoadErrors((prev) => ({
                ...prev,
                cities: "Failed to load cities. Please try again.",
            }));
            return [];
        } finally {
            setLoading((prev) => ({ ...prev, cities: false }));
        }
    };

    const loadBarangays = async (cityId) => {
        setLoading((prev) => ({ ...prev, barangays: true }));
        try {
            const response = await axios.get(`/address/barangays/${cityId}`);
            setBarangays(response.data);
            setLoadErrors((prev) => ({ ...prev, barangays: null }));
            return response.data;
        } catch (error) {
            setBarangays([]);
            setLoadErrors((prev) => ({
                ...prev,
                barangays: "Failed to load barangays. Please try again.",
            }));
            return [];
        } finally {
            setLoading((prev) => ({ ...prev, barangays: false }));
        }
    };

    const handleChange = (field, value) => {
        setSelectedValues((prev) => {
            const updated = { ...prev, [field]: value };

            // Reset dependent fields when parent changes
            if (field === "region_id") {
                updated.province_id = "";
                updated.city_id = "";
                updated.barangay_code = "";
            } else if (field === "province_id") {
                updated.city_id = "";
                updated.barangay_code = "";
            } else if (field === "city_id") {
                updated.barangay_code = "";
            }

            return updated;
        });
    };

    return (
        <div className="space-y-4">
            {/* Region */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Region {required && regionRequired && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={selectedValues.region_id}
                    onChange={(e) => handleChange("region_id", e.target.value)}
                    disabled={disabled || loading.regions}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.region_id ? "border-red-500" : "border-gray-300"
                    }`}
                >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                        <option key={region.id} value={region.region_id}>
                            {region.name}
                        </option>
                    ))}
                </select>
                {loadErrors.regions && (
                    <p className="mt-1 text-sm text-red-600">
                        {loadErrors.regions}
                    </p>
                )}
                {errors.region_id && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.region_id}
                    </p>
                )}
            </div>

            {/* Province */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Province{" "}
                    {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={selectedValues.province_id}
                    onChange={(e) =>
                        handleChange("province_id", e.target.value)
                    }
                    disabled={
                        disabled ||
                        !selectedValues.region_id ||
                        loading.provinces
                    }
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.province_id
                            ? "border-red-500"
                            : "border-gray-300"
                    }`}
                >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                        <option key={province.id} value={province.province_id}>
                            {province.name}
                        </option>
                    ))}
                </select>
                {loadErrors.provinces && (
                    <p className="mt-1 text-sm text-red-600">
                        {loadErrors.provinces}
                    </p>
                )}
                {errors.province_id && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.province_id}
                    </p>
                )}
            </div>

            {/* City/Municipality */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City/Municipality{" "}
                    {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={selectedValues.city_id}
                    onChange={(e) => handleChange("city_id", e.target.value)}
                    disabled={
                        disabled ||
                        !selectedValues.province_id ||
                        loading.cities
                    }
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.city_id ? "border-red-500" : "border-gray-300"
                    }`}
                >
                    <option value="">Select City/Municipality</option>
                    {cities.map((city) => (
                        <option key={city.id} value={city.city_id}>
                            {city.name}
                        </option>
                    ))}
                </select>
                {loadErrors.cities && (
                    <p className="mt-1 text-sm text-red-600">
                        {loadErrors.cities}
                    </p>
                )}
                {errors.city_id && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.city_id}
                    </p>
                )}
            </div>

            {/* Barangay */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Barangay{" "}
                    {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={selectedValues.barangay_code}
                    onChange={(e) =>
                        handleChange("barangay_code", e.target.value)
                    }
                    disabled={
                        disabled || !selectedValues.city_id || loading.barangays
                    }
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.barangay_code
                            ? "border-red-500"
                            : "border-gray-300"
                    }`}
                >
                    <option value="">Select Barangay</option>
                    {barangays.map((barangay) => (
                        <option key={barangay.id} value={barangay.code}>
                            {barangay.name}
                        </option>
                    ))}
                </select>
                {loadErrors.barangays && (
                    <p className="mt-1 text-sm text-red-600">
                        {loadErrors.barangays}
                    </p>
                )}
                {errors.barangay_code && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.barangay_code}
                    </p>
                )}
            </div>

            {/* Street Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Street Address{" "}
                    {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="text"
                    value={selectedValues.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., 123 Main Street, Building A"
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.street && (
                    <p className="mt-1 text-sm text-red-500">{errors.street}</p>
                )}
            </div>
        </div>
    );
}
