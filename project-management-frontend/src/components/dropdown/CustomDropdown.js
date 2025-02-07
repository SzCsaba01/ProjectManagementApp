import React from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ label, options, value, onChange, error }) => {
    const handleOptionSelect = (option) => {
        onChange(option);
    };

    return (
        <div className="dropdown-container">
            <label
                htmlFor={label}
                className={`custom-dropdown-label ${error ? 'error' : ''}`}
            >
                {label}
            </label>
            <div className={`custom-dropdown ${error ? 'error' : ''}`}>
                <span className="custom-dropdown-value">
                    {value || 'Select...'}
                </span>
                <div className="custom-dropdown-options">
                    {options.map((option) => (
                        <div
                            key={option}
                            className="custom-dropdown-option"
                            onClick={() => handleOptionSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomDropdown;
