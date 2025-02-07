import React from 'react';
import './CustomButton.css';

const CustomButton = ({
    type = 'primary',
    onClick,
    children,
    className = '',
    disabled = false,
    ...props
}) => {
    const buttonClasses = `custom-button ${className} ${type} ${disabled ? 'disabled' : ''}`;

    return (
        <button
            onClick={onClick}
            className={buttonClasses}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default CustomButton;
