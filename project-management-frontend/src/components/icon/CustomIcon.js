import React from 'react';
import './CustomIcon.css';

const CustomIcon = ({ name, size = 'medium', className = '', ...props }) => {
    const iconClasses = `icon fa fa-${name} ${size} ${className}`;
    return <i className={iconClasses} {...props}></i>;
};

export default CustomIcon;
