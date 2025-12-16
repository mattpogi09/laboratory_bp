import React, { useState, useEffect } from 'react';

export default function PhoneInput({ 
    value = '', 
    onChange, 
    error = '', 
    disabled = false,
    required = false,
    name = 'phone',
    placeholder = '09XXXXXXXXX'
}) {
    const [phoneValue, setPhoneValue] = useState(value);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setPhoneValue(value);
    }, [value]);

    const validatePhone = (phone) => {
        if (!phone) {
            return required ? 'Phone number is required' : '';
        }

        // Remove any non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');

        if (!digitsOnly.startsWith('09')) {
            return 'Phone number must start with 09';
        }

        if (digitsOnly.length !== 11) {
            return 'Phone number must be exactly 11 digits';
        }

        return '';
    };

    const handleChange = (e) => {
        let input = e.target.value;
        
        // Remove any non-digit characters
        input = input.replace(/\D/g, '');
        
        // Limit to 11 digits
        if (input.length > 11) {
            input = input.slice(0, 11);
        }

        // Enforce starting with 09
        if (input.length > 0 && !input.startsWith('0')) {
            input = '0' + input;
        }
        
        if (input.length > 1 && input[1] !== '9') {
            input = '09' + input.slice(2);
        }

        setPhoneValue(input);
        
        // Validate
        const error = validatePhone(input);
        setValidationError(error);

        // Pass to parent
        if (onChange) {
            onChange(input, error === '');
        }
    };

    const handleBlur = () => {
        const error = validatePhone(phoneValue);
        setValidationError(error);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                name={name}
                value={phoneValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                maxLength={11}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    (error || validationError) ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {(validationError || error) && (
                <p className="mt-1 text-sm text-red-500">
                    {validationError || error}
                </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format: 09XXXXXXXXX (11 digits starting with 09)
            </p>
        </div>
    );
}
